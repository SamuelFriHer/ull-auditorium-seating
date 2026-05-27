import { AppState } from "../models/AppState";
import { EventBus } from "../events/EventBus";
import { SelectionMode } from "../types";

/**
 * Controller responsible for managing individual and drag-based seat selections.
 */
export class SelectionController {
  private readonly state: AppState;
  private readonly eventBus: EventBus;
  private dragStartSeatId: string | null;
  private isSelecting: boolean;
  private hasDragged: boolean;

  /**
   * Initializes a new SelectionController instance and binds event listeners.
   *
   * @param state - The global application state.
   * @param eventBus - The shared application event bus.
   */
  constructor(state: AppState, eventBus: EventBus) {
    this.state = state;
    this.eventBus = eventBus;
    this.dragStartSeatId = null;
    this.isSelecting = true;
    this.hasDragged = false;

    this.subscribeToEvents();
  }

  /**
   * Toggles the selection status of a single seat.
   *
   * @param seatId - The identifier of the clicked seat.
   */
  public onSeatClick(seatId: string): void {
    const seat = this.state.venue.getSeat(seatId);
    if (!seat || seat.isDisabled) {
      return;
    }

    if (this.state.isOrlaMode) {
      this.handleOrlaSeatClick(seatId);
      return;
    }

    const index = this.state.selectedSeatIds.indexOf(seatId);
    if (index === -1) {
      this.state.selectedSeatIds.push(seatId);
    } else {
      this.state.selectedSeatIds.splice(index, 1);
    }

    this.state.selectionMode = SelectionMode.SINGLE;
    this.eventBus.emit("venue:updated");
  }

  /**
   * Special click handling for guest groups in Orla Mode.
   */
  private handleOrlaSeatClick(seatId: string): void {
    const group = this.state.orlaGuestGroups.find((g) =>
      g.seatIds.includes(seatId),
    );
    if (!group) {
      return;
    }

    const isSelected = this.state.selectedSeatIds.includes(seatId);
    if (isSelected) {
      this.state.selectedSeatIds = [];
      this.eventBus.emit("orla:guest-group-select", { groupId: null });
    } else {
      this.state.selectedSeatIds = [...group.seatIds];
      this.eventBus.emit("orla:guest-group-select", { groupId: group.id });
    }
    this.eventBus.emit("venue:updated");
  }

  /**
   * Prepares the controller state when a seat drag interaction starts.
   *
   * @param seatId - The identifier of the seat where the drag started.
   */
  public onDragStart(seatId: string): void {
    if (this.state.isOrlaMode) {
      return;
    }
    const seat = this.state.venue.getSeat(seatId);
    if (!seat || seat.isDisabled) {
      return;
    }

    this.dragStartSeatId = seatId;
    this.state.selectionMode = SelectionMode.DRAG;
    this.isSelecting = !this.state.selectedSeatIds.includes(seatId);
    this.hasDragged = false;
  }

  /**
   * Adds or removes a seat to/from the selection during an active drag.
   *
   * @param seatId - The identifier of the seat currently dragged over.
   */
  public onDragOver(seatId: string): void {
    if (this.state.isOrlaMode) {
      return;
    }
    if (!this.dragStartSeatId) {
      return;
    }

    const seat = this.state.venue.getSeat(seatId);
    if (!seat || seat.isDisabled) {
      return;
    }

    if (!this.hasDragged) {
      this.applySelectionState(this.dragStartSeatId);
      this.hasDragged = true;
    }

    this.applySelectionState(seatId);
    this.eventBus.emit("venue:updated");
  }

  /**
   * Finishes the drag interaction, resetting mode and temporary states.
   */
  public onDragEnd(): void {
    this.state.selectionMode = SelectionMode.NONE;
    this.dragStartSeatId = null;
    this.hasDragged = false;
  }

  /**
   * Clears the current selection list and resets selection mode.
   */
  public clearSelection(): void {
    this.state.selectedSeatIds = [];
    this.state.selectionMode = SelectionMode.NONE;
    this.eventBus.emit("venue:updated");
  }

  /**
   * Configures subscriptions for the expected event bus channels.
   */
  private subscribeToEvents(): void {
    this.eventBus.on("seat:click", (payload: { seatId: string }): void => {
      this.onSeatClick(payload.seatId);
    });
    this.eventBus.on("seat:drag-start", (payload: { seatId: string }): void => {
      this.onDragStart(payload.seatId);
    });
    this.eventBus.on("seat:drag-over", (payload: { seatId: string }): void => {
      this.onDragOver(payload.seatId);
    });
    this.eventBus.on("seat:drag-end", (): void => {
      this.onDragEnd();
    });
    this.eventBus.on("selection:clear", (): void => {
      this.clearSelection();
    });
  }

  /**
   * Applies the determined selection state (select or deselect) to a specific seat.
   *
   * @param targetSeatId - The identifier of the seat to modify.
   */
  private applySelectionState(targetSeatId: string): void {
    const isCurrentlySelected =
      this.state.selectedSeatIds.includes(targetSeatId);

    if (this.isSelecting && !isCurrentlySelected) {
      this.state.selectedSeatIds.push(targetSeatId);
    } else if (!this.isSelecting && isCurrentlySelected) {
      const index = this.state.selectedSeatIds.indexOf(targetSeatId);
      if (index !== -1) {
        this.state.selectedSeatIds.splice(index, 1);
      }
    }
  }
}
