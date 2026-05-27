import type { AppState } from "../../models/AppState";
import type { EventBus } from "../../events/EventBus";
import type { GraduationGuestGroup } from "../../models/GraduationGuestGroup";

/**
 * Component for rendering the list of guest groups in Graduation mode.
 */
export class GraduationGroupsListView {
  /**
   * Initializes a new GraduationGroupsListView.
   */
  constructor(
    private readonly container: HTMLElement,
    private readonly state: AppState,
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Renders the list of Graduation guest groups.
   */
  public render(selectedGroup: GraduationGuestGroup | null): void {
    this.container.innerHTML = "";
    this.state.graduationGuestGroups.forEach((g): void => {
      const item = this.createGroupItem(g, selectedGroup);
      this.container.appendChild(item);
    });
  }

  private createGroupItem(
    group: GraduationGuestGroup,
    selectedGroup: GraduationGuestGroup | null,
  ): HTMLDivElement {
    const item = document.createElement("div");
    const isSel = selectedGroup?.id === group.id;

    item.className = `group-item graduation-group-item ${isSel ? "active" : ""} ${
      group.isOccupied ? "occupied" : ""
    }`;

    const colorVar = group.isOccupied
      ? "var(--color-graduation-guest-occupied)"
      : "var(--color-graduation-guest-free)";
    item.style.borderLeft = `4px solid ${colorVar}`;

    item.innerHTML = `
      <div class="group-info" role="button" tabindex="0">
        <span class="group-label">${group.label}</span>
        <span class="group-count">${group.seatIds.length} butacas</span>
      </div>
    `;

    const info = item.querySelector(".group-info");
    info?.addEventListener("click", (): void => {
      this.eventBus.emit("graduation:guest-group-select", { groupId: group.id });
    });

    return item;
  }
}
