import type { AppState } from "../../models/AppState";
import type { EventBus } from "../../events/EventBus";
import type { OrlaGuestGroup } from "../../models/OrlaGuestGroup";

/**
 * Component for rendering the list of guest groups in Orla mode.
 */
export class OrlaGroupsListView {
  /**
   * Initializes a new OrlaGroupsListView.
   */
  constructor(
    private readonly container: HTMLElement,
    private readonly state: AppState,
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Renders the list of Orla guest groups.
   */
  public render(selectedGroup: OrlaGuestGroup | null): void {
    this.container.innerHTML = "";
    this.state.orlaGuestGroups.forEach((g): void => {
      const item = this.createGroupItem(g, selectedGroup);
      this.container.appendChild(item);
    });
  }

  private createGroupItem(
    group: OrlaGuestGroup,
    selectedGroup: OrlaGuestGroup | null,
  ): HTMLDivElement {
    const item = document.createElement("div");
    const isSel = selectedGroup?.id === group.id;

    item.className = `group-item orla-group-item ${isSel ? "active" : ""} ${
      group.isOccupied ? "occupied" : ""
    }`;

    const colorVar = group.isOccupied
      ? "var(--color-orla-guest-occupied)"
      : "var(--color-orla-guest-free)";
    item.style.borderLeft = `4px solid ${colorVar}`;

    item.innerHTML = `
      <div class="group-info" role="button" tabindex="0">
        <span class="group-label">${group.label}</span>
        <span class="group-count">${group.seatIds.length} butacas</span>
      </div>
    `;

    const info = item.querySelector(".group-info");
    info?.addEventListener("click", (): void => {
      this.eventBus.emit("orla:guest-group-select", { groupId: group.id });
    });

    return item;
  }
}
