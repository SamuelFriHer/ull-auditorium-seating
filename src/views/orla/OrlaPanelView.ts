import type { AppState } from "../../models/AppState";
import type { EventBus } from "../../events/EventBus";
import type { IView } from "../IView";
import type { OrlaGuestGroup } from "../../models/OrlaGuestGroup";
import { OrlaDetailCardView } from "./OrlaDetailCardView";
import { OrlaGroupsListView } from "./OrlaGroupsListView";
import { OrlaInputsView } from "./OrlaInputsView";

/**
 * Handles rendering the sidebar panel for Orla Mode.
 */
export class OrlaPanelView implements IView {
  private readonly onVenueUpdated = (): void => this.render();
  private readonly inputHandler = (e: Event): void => this.handleInput(e);
  private readonly clickHandler = (e: Event): void => this.handleClick(e);
  private readonly keydownHandler = (e: Event): void => this.handleKeydown(e);

  private inputsView?: OrlaInputsView;
  private detailCardView?: OrlaDetailCardView;
  private groupsListView?: OrlaGroupsListView;

  /**
   * Initializes a new OrlaPanelView instance.
   */
  constructor(
    private readonly container: HTMLElement,
    private readonly state: AppState,
    private readonly eventBus: EventBus,
  ) {
    this.eventBus.on("venue:updated", this.onVenueUpdated);
    this.container.addEventListener("input", this.inputHandler);
    this.container.addEventListener("click", this.clickHandler);
    this.container.addEventListener("keydown", this.keydownHandler);
  }

  /**
   * Renders the Orla Sidebar contents.
   */
  public render(): void {
    const selectedGroup = this.getSelectedGroup();
    const maxGuests = this.state.orlaMaxGuests;
    const occupiedCount = this.state.orlaGuestGroups.filter(
      (g) => g.isOccupied,
    ).length;
    const totalCount = this.state.orlaGuestGroups.length;

    const hasSkeleton =
      this.container.querySelector("#orla-inputs-container") !== null;
    if (!hasSkeleton) {
      this.renderSkeleton(maxGuests, occupiedCount, totalCount, selectedGroup);
    } else {
      this.updateExistingDOM(
        maxGuests,
        occupiedCount,
        totalCount,
        selectedGroup,
      );
    }

    this.renderSubComponents(selectedGroup);
  }

  /**
   * Cleans up event listeners and panel contents.
   */
  public destroy(): void {
    this.eventBus.off("venue:updated", this.onVenueUpdated);
    this.container.removeEventListener("input", this.inputHandler);
    this.container.removeEventListener("click", this.clickHandler);
    this.container.removeEventListener("keydown", this.keydownHandler);
    this.container.innerHTML = "";
  }

  private handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (!target) return;
    if (
      target.id === "orla-student-count" ||
      target.id === "orla-guest-count"
    ) {
      const isStudent = target.id === "orla-student-count";
      this.eventBus.emit(
        isStudent ? "orla:students-change" : "orla:guests-change",
        { count: parseInt(target.value, 10) || 0 },
      );
    } else if (target.id === "orla-group-label") {
      const group = this.getSelectedGroup();
      if (group) {
        this.eventBus.emit("orla:guest-group-label-change", {
          groupId: group.id,
          label: target.value,
        });
      }
    }
  }

  private handleClick(e: Event): void {
    const target = e.target as HTMLElement;
    const btnToggle = target?.closest(".btn-toggle-occupied");
    if (btnToggle) {
      const group = this.getSelectedGroup();
      if (group) {
        this.eventBus.emit("orla:guest-group-toggle", { groupId: group.id });
      }
    }
  }

  private handleKeydown(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (target && target.id === "orla-group-label") {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        const group = this.getSelectedGroup();
        if (group) {
          this.eventBus.emit("orla:guest-group-toggle", { groupId: group.id });
        }
      }
    }
  }

  private renderSkeleton(
    maxGuests: number,
    occupiedCount: number,
    totalCount: number,
    selectedGroup: OrlaGuestGroup | null,
  ): void {
    this.container.innerHTML =
      '<div class="group-panel-header"><h2>Asignación de Invitaciones</h2></div>' +
      '<div class="orla-inputs-card" id="orla-inputs-container"></div>' +
      '<div id="orla-detail-container"></div>' +
      '<div class="groups-list-header">' +
      `<h3>Grupos de Invitados</h3><span class="progress-badge">${occupiedCount}/${totalCount} ocupados</span>` +
      '</div><div class="groups-list" id="orla-groups-list"></div>';
    this.initSubComponents();
    this.inputsView?.render(maxGuests);
    this.detailCardView?.render(selectedGroup);
  }

  private initSubComponents(): void {
    const find = (id: string): HTMLElement | null =>
      this.container.querySelector(id);
    const inputs = find("#orla-inputs-container");
    const detail = find("#orla-detail-container");
    const list = find("#orla-groups-list");

    if (inputs) this.inputsView = new OrlaInputsView(inputs, this.state);
    if (detail)
      this.detailCardView = new OrlaDetailCardView(detail, this.state);
    if (list) {
      this.groupsListView = new OrlaGroupsListView(
        list,
        this.state,
        this.eventBus,
      );
    }
  }

  private updateExistingDOM(
    maxGuests: number,
    occupiedCount: number,
    totalCount: number,
    selectedGroup: OrlaGuestGroup | null,
  ): void {
    this.updateProgressBadge(occupiedCount, totalCount);
    if (!this.inputsView) this.initSubComponents();
    this.inputsView?.update(maxGuests);
    this.detailCardView?.update(selectedGroup);
  }

  private updateProgressBadge(occupiedCount: number, totalCount: number): void {
    const progressBadge = this.container.querySelector(".progress-badge");
    if (progressBadge) {
      progressBadge.textContent = `${occupiedCount}/${totalCount} ocupados`;
    }
  }

  private renderSubComponents(selectedGroup: OrlaGuestGroup | null): void {
    if (!this.groupsListView) this.initSubComponents();
    this.groupsListView?.render(selectedGroup);
  }

  private getSelectedGroup(): OrlaGuestGroup | null {
    const sel = this.state.selectedSeatIds;
    return (
      this.state.orlaGuestGroups.find(
        (g) =>
          g.seatIds.length > 0 && g.seatIds.every((id) => sel.includes(id)),
      ) || null
    );
  }
}
