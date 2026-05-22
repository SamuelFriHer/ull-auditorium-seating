import { AppState } from "../models/AppState";
import { SeatGroup } from "../models/SeatGroup";
import { EventBus } from "../events/EventBus";
import { ColorUtils } from "../utils/ColorUtils";
import { type SeatGroupJSON } from "../types";

/**
 * Controller managing seat group operations and coordination.
 */
export class GroupController {
  private readonly state: AppState;
  private readonly eventBus: EventBus;
  private readonly colorUtils: typeof ColorUtils;

  /**
   * Initializes a new GroupController and registers event handlers.
   *
   * @param state - The global application state.
   * @param eventBus - The shared application event bus.
   */
  constructor(state: AppState, eventBus: EventBus) {
    this.state = state;
    this.eventBus = eventBus;
    this.colorUtils = ColorUtils;

    this.subscribeToEvents();
  }

  /**
   * Creates a new seat group and registers it within the venue.
   *
   * @param label - Name/label of the group.
   * @param color - Optional hex color code representation.
   * @returns The newly created SeatGroup instance.
   */
  public createGroup(label: string, color?: string): SeatGroup {
    const defaultColor = this.colorUtils.generateColor(
      this.state.venue.groups.length,
    );
    const resolvedColor = color || defaultColor;
    const generatedId = `group_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const group = new SeatGroup(generatedId, label, resolvedColor, []);
    this.state.venue.groups.push(group);
    this.state.activeGroupId = group.id;

    this.eventBus.emit("venue:updated");
    this.eventBus.emit("group:active-change", { id: group.id });

    return group;
  }

  /**
   * Updates fields and assignments on an existing group.
   *
   * @param id - Identifier of the target group.
   * @param patch - Partial fields to update on the group.
   */
  public updateGroup(id: string, patch: Partial<SeatGroupJSON>): void {
    const group = this.state.venue.getGroup(id);
    if (!group) {
      return;
    }

    if (patch.label !== undefined) {
      group.label = patch.label;
    }
    if (patch.color !== undefined) {
      group.color = patch.color;
    }
    if (patch.seatIds !== undefined) {
      this.state.venue.unassignSeats([...group.seatIds]);
      this.state.venue.assignSeatsToGroup(patch.seatIds, group.id);
    }

    this.eventBus.emit("venue:updated");
  }

  /**
   * Deletes a group, freeing all its currently assigned seats.
   *
   * @param id - Identifier of the group to delete.
   */
  public deleteGroup(id: string): void {
    const group = this.state.venue.getGroup(id);
    if (!group) {
      return;
    }

    this.state.venue.unassignSeats([...group.seatIds]);

    const index = this.state.venue.groups.indexOf(group);
    if (index !== -1) {
      this.state.venue.groups.splice(index, 1);
    }

    if (this.state.activeGroupId === id) {
      this.state.activeGroupId = null;
      this.eventBus.emit("group:active-change", { id: null });
    }

    this.eventBus.emit("venue:updated");
  }

  /**
   * Assigns all currently selected seats to a group and clears selection.
   *
   * @param groupId - Target group identifier.
   */
  public assignSelectedSeats(groupId: string): void {
    const selectedIds = [...this.state.selectedSeatIds];
    this.state.venue.assignSeatsToGroup(selectedIds, groupId);
    this.state.selectedSeatIds = [];
    this.eventBus.emit("venue:updated");
  }

  /**
   * Sets the active group in state and notifies listeners.
   *
   * @param id - The active group identifier or null.
   */
  public setActiveGroup(id: string | null): void {
    if (this.state.activeGroupId === id) {
      return;
    }
    this.state.activeGroupId = id;
    this.eventBus.emit("group:active-change", { id });
  }

  /**
   * Registers event handlers on the shared event bus.
   */
  private subscribeToEvents(): void {
    this.eventBus.on(
      "group:create",
      (payload: { label: string; color?: string }): void => {
        this.createGroup(payload.label, payload.color);
      },
    );
    this.eventBus.on(
      "group:update",
      (payload: { id: string; patch: Partial<SeatGroupJSON> }): void => {
        this.updateGroup(payload.id, payload.patch);
      },
    );
    this.eventBus.on("group:delete", (payload: { id: string }): void => {
      this.deleteGroup(payload.id);
    });
    this.eventBus.on(
      "group:assign",
      (payload: { seatIds: string[]; groupId: string }): void => {
        this.state.venue.assignSeatsToGroup(payload.seatIds, payload.groupId);
        this.state.selectedSeatIds = this.state.selectedSeatIds.filter(
          (id: string): boolean => !payload.seatIds.includes(id),
        );
        this.eventBus.emit("venue:updated");
      },
    );
    this.eventBus.on(
      "group:unassign",
      (payload: { seatIds: string[] }): void => {
        this.state.venue.unassignSeats(payload.seatIds);
        this.state.selectedSeatIds = this.state.selectedSeatIds.filter(
          (id: string): boolean => !payload.seatIds.includes(id),
        );
        this.eventBus.emit("venue:updated");
      },
    );
    this.eventBus.on(
      "group:active-change",
      (payload: { id: string | null }): void => {
        this.setActiveGroup(payload.id);
      },
    );
  }
}
