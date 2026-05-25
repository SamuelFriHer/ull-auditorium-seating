import type { AppState } from "../models/AppState";
import type { SeatGroup } from "../models/SeatGroup";
import type { EventBus } from "../events/EventBus";
import { ColorUtils } from "../utils/ColorUtils";
import type { IView } from "./IView";

/**
 * Handles rendering the sidebar panel to manage and assign seat groups.
 */
export class GroupPanelView implements IView {
  private readonly container: HTMLElement;
  private readonly state: AppState;
  private readonly eventBus: EventBus;

  private readonly onVenueUpdated: () => void;
  private readonly onVenueLoaded: () => void;
  private readonly onActiveGroupChanged: (payload: {
    id: string | null;
  }) => void;

  /**
   * Initializes a new GroupPanelView instance.
   *
   * @param container - The sidebar container DOM element.
   * @param state - The global application state.
   * @param eventBus - The application event bus.
   */
  constructor(container: HTMLElement, state: AppState, eventBus: EventBus) {
    this.container = container;
    this.state = state;
    this.eventBus = eventBus;

    this.onVenueUpdated = () => this.render();
    this.onVenueLoaded = () => this.render();
    this.onActiveGroupChanged = (payload): void =>
      this.setActiveGroup(payload.id);

    this.bindEvents();
  }

  /**
   * Renders the sidebar form, headers, and list of seat groups.
   */
  public render(): void {
    this.container.innerHTML = `
      <div class="group-panel-header">
        <h2>Gestión de Grupos</h2>
      </div>
      
      <form id="create-group-form" class="create-group-form">
        <div class="form-group">
          <input type="text" id="group-name-input" placeholder="Nuevo grupo..." aria-label="Nombre del nuevo grupo" required />
          <input type="color" id="group-color-input" value="${this.getNextColor()}" title="Color del grupo" aria-label="Color del nuevo grupo" />
        </div>
        <button type="submit" class="btn-create-group">Crear Grupo</button>
      </form>

      <div class="groups-list" id="groups-list">
        ${this.state.venue.groups.length === 0 ? '<div class="empty-state" style="text-align: center; padding: 1.5rem; font-size: 0.875rem; color: var(--text-secondary);">No hay grupos creados. Crea uno para empezar.</div>' : ""}
      </div>
    `;

    this.attachFormEvents();

    for (const group of this.state.venue.groups) {
      this.renderGroup(group);
    }
  }

  /**
   * Appends and renders a single seat group item to the sidebar list.
   *
   * @param group - The SeatGroup model to render.
   */
  public renderGroup(group: SeatGroup): void {
    const listContainer = this.container.querySelector("#groups-list");
    if (!listContainer) {
      return;
    }

    const groupItem = document.createElement("div");
    this.initGroupItem(groupItem, group);

    this.attachGroupItemEvents(groupItem, group);

    listContainer.appendChild(groupItem);
  }

  /**
   * Updates selection styling on the group list elements.
   *
   * @param id - The active group ID, or null.
   */
  public setActiveGroup(id: string | null): void {
    this.state.activeGroupId = id;
    const items = this.container.querySelectorAll(".group-item");
    items.forEach((item): void => {
      const groupId = item.getAttribute("data-group-id");
      const groupInfo = item.querySelector(".group-info");
      if (groupId === id) {
        item.classList.add("active");
        if (groupInfo) groupInfo.setAttribute("aria-pressed", "true");
      } else {
        item.classList.remove("active");
        if (groupInfo) groupInfo.setAttribute("aria-pressed", "false");
      }
    });
  }

  /**
   * Cleans up event listeners and panel contents.
   */
  public destroy(): void {
    this.eventBus.off("venue:updated", this.onVenueUpdated);
    this.eventBus.off("venue:loaded", this.onVenueLoaded);
    this.eventBus.off("group:active-change", this.onActiveGroupChanged);
    this.container.innerHTML = "";
  }

  /**
   * Registers event handlers on the event bus.
   */
  private bindEvents(): void {
    this.eventBus.on("venue:updated", this.onVenueUpdated);
    this.eventBus.on("venue:loaded", this.onVenueLoaded);
    this.eventBus.on("group:active-change", this.onActiveGroupChanged);
  }

  /**
   * Resolves the next default color for a new group based on existing groups.
   */
  private getNextColor(): string {
    return ColorUtils.generateColor(this.state.venue.groups.length);
  }

  /**
   * Attaches submit listener to the group creation form.
   */
  private attachFormEvents(): void {
    const form = this.container.querySelector("#create-group-form");
    form?.addEventListener("submit", (event: Event): void => {
      event.preventDefault();
      const nameInput = this.container.querySelector(
        "#group-name-input",
      ) as HTMLInputElement;
      const colorInput = this.container.querySelector(
        "#group-color-input",
      ) as HTMLInputElement;
      if (nameInput) {
        const label = nameInput.value.trim();
        if (label) {
          const payload: { label: string; color?: string } = { label };
          if (colorInput && colorInput.value) {
            payload.color = colorInput.value;
          }
          this.eventBus.emit("group:create", payload);
        }
      }
    });
  }

  /**
   * Sets initial contents and styling on a group list item.
   */
  private initGroupItem(groupItem: HTMLDivElement, group: SeatGroup): void {
    groupItem.className = "group-item";
    groupItem.setAttribute("data-group-id", group.id);

    const isActive = this.state.activeGroupId === group.id;
    if (isActive) {
      groupItem.classList.add("active");
    }

    groupItem.style.borderLeft = `4px solid ${group.color}`;
    const selectedCount = this.state.selectedSeatIds.length;

    groupItem.innerHTML = `
      <div class="group-info" role="button" tabindex="0" aria-pressed="${isActive ? "true" : "false"}">
        <span class="group-label">${group.label}</span>
        <span class="group-count">${group.seatIds.length} butacas</span>
      </div>
      <div class="group-actions">
        <button class="btn-assign-seats" title="${selectedCount === 0 ? "Selecciona butacas primero" : "Asignar seleccionados"}" ${selectedCount === 0 ? "disabled" : ""}>
          Asignar
        </button>
        <button class="btn-delete-group" title="Eliminar grupo" aria-label="Eliminar grupo">
          &times;
        </button>
      </div>
    `;
  }

  /**
   * Attaches interaction event listeners to a group list item.
   */
  private attachGroupItemEvents(
    groupItem: HTMLDivElement,
    group: SeatGroup,
  ): void {
    const toggleActiveGroup = (): void => {
      const nextActiveId =
        this.state.activeGroupId === group.id ? null : group.id;
      this.eventBus.emit("group:active-change", { id: nextActiveId });
    };

    const groupInfo = groupItem.querySelector(".group-info");

    groupInfo?.addEventListener("click", toggleActiveGroup);

    groupInfo?.addEventListener("keydown", (event: Event): void => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        toggleActiveGroup();
      }
    });

    groupItem
      .querySelector(".btn-assign-seats")
      ?.addEventListener("click", (event: Event): void => {
        event.stopPropagation();
        this.eventBus.emit("group:assign", {
          seatIds: [...this.state.selectedSeatIds],
          groupId: group.id,
        });
      });

    groupItem
      .querySelector(".btn-delete-group")
      ?.addEventListener("click", (event: Event): void => {
        event.stopPropagation();
        if (
          window.confirm("¿Estás seguro de que deseas eliminar este grupo?")
        ) {
          this.eventBus.emit("group:delete", { id: group.id });
        }
      });
  }
}
