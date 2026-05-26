import type { SeatGroup } from "../models/SeatGroup";
import type { AppState } from "../models/AppState";
import type { EventBus } from "../events/EventBus";

/**
 * Handles rendering and event interactions for a single seat group item.
 */
export class GroupItemView {
  private readonly element: HTMLDivElement;
  private readonly group: SeatGroup;
  private readonly state: AppState;
  private readonly eventBus: EventBus;

  /**
   * Initializes a new GroupItemView instance.
   *
   * @param group - The seat group model.
   * @param state - The application state.
   * @param eventBus - The event bus.
   */
  constructor(group: SeatGroup, state: AppState, eventBus: EventBus) {
    this.group = group;
    this.state = state;
    this.eventBus = eventBus;
    this.element = document.createElement("div");
    this.init();
    this.attachEvents();
  }

  /**
   * Returns the underlying DOM element for the group item.
   */
  public getElement(): HTMLDivElement {
    return this.element;
  }

  /**
   * Sets initial contents and styling on the group list item element.
   */
  private init(): void {
    this.element.className = "group-item";
    this.element.setAttribute("data-group-id", this.group.id);

    const isActive = this.state.activeGroupId === this.group.id;
    if (isActive) {
      this.element.classList.add("active");
    }

    this.element.style.borderLeft = `4px solid ${this.group.color}`;
    const selectedCount = this.state.selectedSeatIds.length;

    this.element.innerHTML = `
      <div class="group-info" role="button" tabindex="0" aria-pressed="${isActive ? "true" : "false"}">
        <span class="group-label">${this.group.label}</span>
        <span class="group-count">${this.group.seatIds.length} butacas</span>
      </div>
      <div class="group-actions">
        <button class="btn-assign-seats" title="${selectedCount === 0 ? "Selecciona butacas primero" : "Asignar seleccionados"}" ${selectedCount === 0 ? "disabled" : ""}>
          Asignar
        </button>
        <button class="btn-delete-group" title="Eliminar grupo ${this.group.label}" aria-label="Eliminar grupo ${this.group.label}">
          &times;
        </button>
      </div>
    `;
  }

  /**
   * Attaches interaction event listeners to the group list item element.
   */
  private attachEvents(): void {
    const toggleActiveGroup = (): void => {
      const nextActiveId =
        this.state.activeGroupId === this.group.id ? null : this.group.id;
      this.eventBus.emit("group:active-change", { id: nextActiveId });
    };

    const groupInfo = this.element.querySelector(".group-info");

    groupInfo?.addEventListener("click", toggleActiveGroup);

    groupInfo?.addEventListener("keydown", (event: Event): void => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        toggleActiveGroup();
      }
    });

    this.element
      .querySelector(".btn-assign-seats")
      ?.addEventListener("click", (event: Event): void => {
        event.stopPropagation();
        this.eventBus.emit("group:assign", {
          seatIds: [...this.state.selectedSeatIds],
          groupId: this.group.id,
        });
      });

    this.element
      .querySelector(".btn-delete-group")
      ?.addEventListener("click", (event: Event): void => {
        event.stopPropagation();
        if (
          window.confirm(
            `¿Estás seguro de que deseas eliminar el grupo "${this.group.label}"?`,
          )
        ) {
          this.eventBus.emit("group:delete", { id: this.group.id });
        }
      });
  }
}
