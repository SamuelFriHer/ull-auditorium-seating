import type { SeatGroup } from "../../models/SeatGroup";
import type { AppState } from "../../models/AppState";
import type { EventBus } from "../../events/EventBus";

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

    this.renderHtml(isActive);
    this.populateSafeText();
  }

  /**
   * Renders the HTML structure with placeholders for text content.
   *
   * @param isActive - Indicates if the group is currently active.
   */
  private renderHtml(isActive: boolean): void {
    const selectedCount = this.state.selectedSeatIds.length;
    this.element.innerHTML = `
      <div class="group-info" role="button" tabindex="0" aria-pressed="${isActive ? "true" : "false"}">
        <span class="group-label"></span>
        <span class="group-count">${this.group.seatIds.length} butacas</span>
      </div>
      <div class="group-actions">
        <button class="btn-assign-seats" title="${selectedCount === 0 ? "Selecciona butacas primero" : "Asignar seleccionados"}" ${selectedCount === 0 ? "disabled" : ""}>
          Asignar
        </button>
        <button class="btn-delete-group" aria-label="Eliminar grupo">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;
  }

  /**
   * Populates the HTML elements with safe text content.
   */
  private populateSafeText(): void {
    const labelSpan = this.element.querySelector(".group-label");
    if (labelSpan) {
      labelSpan.textContent = this.group.label;
    }

    const deleteBtn = this.element.querySelector(".btn-delete-group");
    if (deleteBtn) {
      const deleteText = `Eliminar grupo ${this.group.label}`;
      deleteBtn.setAttribute("title", deleteText);
      deleteBtn.setAttribute("aria-label", deleteText);
    }
  }

  /**
   * Attaches interaction event listeners to the group list item element.
   */
  private attachEvents(): void {
    this.attachInfoEvents();
    this.attachActionEvents();
  }

  /**
   * Attaches interaction event listeners for clicking/activating the group.
   */
  private attachInfoEvents(): void {
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
  }

  /**
   * Attaches interaction event listeners for action buttons (assign, delete).
   */
  private attachActionEvents(): void {
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
        const confirmationMessage = `¿Estás seguro de que deseas eliminar el grupo "${this.group.label}"?`;
        if (window.confirm(confirmationMessage)) {
          this.eventBus.emit("group:delete", { id: this.group.id });
        }
      });
  }
}
