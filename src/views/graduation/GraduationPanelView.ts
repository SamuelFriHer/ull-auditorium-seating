import type { AppState } from "../../models/AppState";
import type { EventBus } from "../../events/EventBus";
import type { IView } from "../IView";
import type { GraduationGuestGroup } from "../../models/GraduationGuestGroup";
import { GraduationDetailCardView } from "./GraduationDetailCardView";
import { GraduationGroupsListView } from "./GraduationGroupsListView";
import { GraduationInputsView } from "./GraduationInputsView";

/**
 * Handles rendering the sidebar panel for Graduation Mode.
 */
export class GraduationPanelView implements IView {
  private readonly onVenueUpdated = (): void => this.render();
  private readonly inputHandler = (e: Event): void => this.handleInput(e);
  private readonly clickHandler = (e: Event): void => this.handleClick(e);
  private readonly keydownHandler = (e: Event): void => this.handleKeydown(e);

  private inputsView?: GraduationInputsView;
  private detailCardView?: GraduationDetailCardView;
  private groupsListView?: GraduationGroupsListView;

  /**
   * Initializes a new GraduationPanelView instance.
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
   * Renders the Graduation Sidebar contents.
   */
  public render(): void {
    const selectedGroup = this.getSelectedGroup();
    const maxGuests = this.state.graduationMaxGuests;
    const occupiedCount = this.state.graduationGuestGroups.filter(
      (g) => g.isOccupied,
    ).length;
    const totalCount = this.state.graduationGuestGroups.length;

    const hasSkeleton =
      this.container.querySelector("#graduation-inputs-container") !== null;
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
      target.id === "graduation-student-count" ||
      target.id === "graduation-guest-count"
    ) {
      const isStudent = target.id === "graduation-student-count";
      this.eventBus.emit(
        isStudent ? "graduation:students-change" : "graduation:guests-change",
        { count: parseInt(target.value, 10) || 0 },
      );
    } else if (target.id === "graduation-group-label") {
      const group = this.getSelectedGroup();
      if (group) {
        this.eventBus.emit("graduation:guest-group-label-change", {
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
        this.eventBus.emit("graduation:guest-group-toggle", { groupId: group.id });
      }
    }
  }

  private handleKeydown(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (target && target.id === "graduation-group-label") {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        const group = this.getSelectedGroup();
        if (group) {
          this.eventBus.emit("graduation:guest-group-toggle", { groupId: group.id });
        }
      }
    }
  }

  private renderSkeleton(
    maxGuests: number,
    occupiedCount: number,
    totalCount: number,
    selectedGroup: GraduationGuestGroup | null,
  ): void {
    this.container.innerHTML =
      '<div class="group-panel-header"><h2>Asignación de Invitaciones</h2></div>' +
      '<div class="graduation-inputs-card" id="graduation-inputs-container"></div>' +
      '<div id="graduation-detail-container"></div>' +
      '<div class="groups-list-header">' +
      `<h3>Grupos de Invitados</h3><span class="progress-badge">${occupiedCount}/${totalCount} ocupados</span>` +
      '</div><div class="groups-list" id="graduation-groups-list"></div>';
    this.initSubComponents();
    this.inputsView?.render(maxGuests);
    this.detailCardView?.render(selectedGroup);
  }

  private initSubComponents(): void {
    const find = (id: string): HTMLElement | null =>
      this.container.querySelector(id);
    const inputs = find("#graduation-inputs-container");
    const detail = find("#graduation-detail-container");
    const list = find("#graduation-groups-list");

    if (inputs) this.inputsView = new GraduationInputsView(inputs, this.state);
    if (detail)
      this.detailCardView = new GraduationDetailCardView(detail, this.state);
    if (list) {
      this.groupsListView = new GraduationGroupsListView(
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
    selectedGroup: GraduationGuestGroup | null,
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

  private renderSubComponents(selectedGroup: GraduationGuestGroup | null): void {
    if (!this.groupsListView) this.initSubComponents();
    this.groupsListView?.render(selectedGroup);
  }

  private getSelectedGroup(): GraduationGuestGroup | null {
    const sel = this.state.selectedSeatIds;
    return (
      this.state.graduationGuestGroups.find(
        (g) =>
          g.seatIds.length > 0 && g.seatIds.every((id) => sel.includes(id)),
      ) || null
    );
  }
}
