import type { AppState } from "../../models/AppState";
import type { SeatGroup } from "../../models/SeatGroup";
import type { EventBus } from "../../events/EventBus";
import { ColorUtils } from "../../utils/ColorUtils";
import type { IView } from "../IView";
import { GroupItemView } from "./GroupItemView";

/**
 * Handles rendering the sidebar panel to manage and assign seat groups.
 */
export class GroupPanelView implements IView {
  private readonly container: HTMLElement;
  private readonly state: AppState;
  private readonly eventBus: EventBus;
  private readonly groupElements: Map<string, HTMLElement> = new Map();
  private activeGroupId: string | null = null;

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
    this.activeGroupId = state.activeGroupId;

    this.onVenueUpdated = (): void => this.render();
    this.onVenueLoaded = (): void => this.render();
    this.onActiveGroupChanged = (payload): void =>
      this.setActiveGroup(payload.id);

    this.bindEvents();
  }

  /**
   * Renders the sidebar form, headers, and list of seat groups.
   */
  public render(): void {
    this.groupElements.clear();
    this.activeGroupId = this.state.activeGroupId;

    this.container.innerHTML = `
      <div class="group-panel-header">
        <h2>Gestión de Grupos</h2>
      </div>
      
      <form id="create-group-form" class="create-group-form">
        <div class="form-group">
          <label class="sr-only" for="group-name-input">Nombre del nuevo grupo</label>
          <input type="text" id="group-name-input" placeholder="Nuevo grupo..." required />
          <label class="sr-only" for="group-color-input">Color del nuevo grupo</label>
          <input type="color" id="group-color-input" value="${this.getNextColor()}" title="Color del grupo" />
        </div>
        <button type="submit" class="btn-create-group">Crear Grupo</button>
      </form>

      <div class="groups-list" id="groups-list">
        ${this.state.venue.groups.length === 0 ? '<div class="empty-state" style="text-align: center; padding: 1.5rem; font-size: 0.875rem; color: var(--text-secondary);">No hay grupos creados. Crea uno para empezar.</div>' : ""}
      </div>
    `;

    this.attachFormEvents();

    const listContainer = this.container.querySelector("#groups-list");
    if (listContainer) {
      for (const group of this.state.venue.groups) {
        this.renderGroup(group, listContainer);
      }
    }
  }

  /**
   * Appends and renders a single seat group item to the sidebar list.
   *
   * @param group - The SeatGroup model to render.
   * @param listContainer - The DOM container element to append to.
   */
  public renderGroup(group: SeatGroup, listContainer: Element): void {
    const itemView = new GroupItemView(group, this.state, this.eventBus);
    const element = itemView.getElement();
    listContainer.appendChild(element);
    this.groupElements.set(group.id, element);
  }

  /**
   * Updates selection styling on the group list elements.
   *
   * @param id - The active group ID, or null.
   */
  public setActiveGroup(id: string | null): void {
    this.state.activeGroupId = id;
    const oldId = this.activeGroupId;
    this.activeGroupId = id;

    if (oldId !== null && oldId !== id) {
      const oldElement = this.groupElements.get(oldId);
      if (oldElement) {
        oldElement.classList.remove("active");
        const oldInfo = oldElement.querySelector(".group-info");
        if (oldInfo) oldInfo.setAttribute("aria-pressed", "false");
      }
    }

    if (id !== null && oldId !== id) {
      const newElement = this.groupElements.get(id);
      if (newElement) {
        newElement.classList.add("active");
        const newInfo = newElement.querySelector(".group-info");
        if (newInfo) newInfo.setAttribute("aria-pressed", "true");
      }
    }
  }

  /**
   * Cleans up event listeners and panel contents.
   */
  public destroy(): void {
    this.eventBus.off("venue:updated", this.onVenueUpdated);
    this.eventBus.off("venue:loaded", this.onVenueLoaded);
    this.eventBus.off("group:active-change", this.onActiveGroupChanged);
    this.container.innerHTML = "";
    this.groupElements.clear();
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
}
