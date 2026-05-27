import type { AppState } from "../../models/AppState";
import type { EventBus } from "../../events/EventBus";
import type { IView } from "../IView";

/**
 * Renders the top toolbar containing action buttons and the floor selector.
 */
export class ToolbarView implements IView {
  private readonly container: HTMLElement;
  private readonly state: AppState;
  private readonly eventBus: EventBus;

  private readonly onVenueUpdated: () => void;
  private readonly onFloorChanged: (payload: { floor: number }) => void;

  /**
   * Initializes a new ToolbarView instance.
   *
   * @param container - The toolbar container element.
   * @param state - The global application state.
   * @param eventBus - The application event bus.
   */
  constructor(container: HTMLElement, state: AppState, eventBus: EventBus) {
    this.container = container;
    this.state = state;
    this.eventBus = eventBus;

    this.onVenueUpdated = () => this.render();
    this.onFloorChanged = (payload: { floor: number }): void => {
      this.state.activeFloor = payload.floor;
      this.render();
    };

    this.bindEvents();
  }

  /**
   * Renders the toolbar HTML and attaches action event handlers.
   */
  public render(): void {
    const selectedCount = this.state.selectedSeatIds.length;
    const isGraduation = this.state.isGraduationMode;
    this.container.innerHTML = `
      <div class="toolbar-left">
        <span class="app-logo">🎟️ Paraninfo Seating</span>
        <button id="btn-toggle-graduation" class="btn-toggle-graduation ${isGraduation ? "active" : ""}" title="Toggles Graduation Mode">
          🎓 Modo Orla: ${isGraduation ? "ON" : "OFF"}
        </button>
        <div class="floor-selector" id="floor-selector">
          <button class="btn-floor ${this.state.activeFloor === 0 ? "active" : ""}" data-floor="0" aria-pressed="${this.state.activeFloor === 0 ? "true" : "false"}">P0 (Patio)</button>
          <button class="btn-floor ${this.state.activeFloor === 1 ? "active" : ""}" data-floor="1" aria-pressed="${this.state.activeFloor === 1 ? "true" : "false"}">P1 (Anfiteatro + P. Bajo)</button>
          <button class="btn-floor ${this.state.activeFloor === 2 ? "active" : ""}" data-floor="2" aria-pressed="${this.state.activeFloor === 2 ? "true" : "false"}">P2 (Palco Alto)</button>
        </div>
      </div>
      <div class="toolbar-actions">
        <button id="btn-clear-selection" class="btn-secondary" ${selectedCount === 0 || isGraduation ? "disabled" : ""} title="${isGraduation ? "Deshabilitado en Modo Orla" : selectedCount === 0 ? "Selecciona butacas primero" : "Limpiar selección"}">
          Limpiar Selección (${selectedCount})
        </button>
        <button id="btn-unassign-seats" class="btn-secondary" ${selectedCount === 0 || isGraduation ? "disabled" : ""} title="${isGraduation ? "Deshabilitado en Modo Orla" : selectedCount === 0 ? "Selecciona butacas primero" : "Desasignar butacas seleccionadas"}">
          Desasignar
        </button>
        <button id="btn-export-layout" class="btn-primary">
          Exportar JSON
        </button>
        <label for="input-import-layout" class="btn-primary label-import">
          Importar JSON
        </label>
        <input type="file" id="input-import-layout" accept=".json" style="display: none;" />
      </div>
    `;

    this.attachEvents();
  }

  /**
   * Cleans up event listeners and panel contents.
   */
  public destroy(): void {
    this.eventBus.off("venue:updated", this.onVenueUpdated);
    this.eventBus.off("floor:change", this.onFloorChanged);
    this.container.innerHTML = "";
  }

  /**
   * Subscribes to events for reactive rendering updates.
   */
  private bindEvents(): void {
    this.eventBus.on("venue:updated", this.onVenueUpdated);
    this.eventBus.on("floor:change", this.onFloorChanged);
  }

  /**
   * Registers event handlers on the buttons and files input.
   */
  private attachEvents(): void {
    this.container
      .querySelector("#btn-toggle-graduation")
      ?.addEventListener("click", (): void => {
        this.eventBus.emit("graduation:toggle", {
          active: !this.state.isGraduationMode,
        });
      });

    this.container
      .querySelector("#btn-clear-selection")
      ?.addEventListener("click", (): void => {
        this.eventBus.emit("selection:clear", undefined);
      });

    this.container
      .querySelector("#btn-unassign-seats")
      ?.addEventListener("click", (): void => {
        this.eventBus.emit("group:unassign", {
          seatIds: [...this.state.selectedSeatIds],
        });
      });

    this.container
      .querySelector("#btn-export-layout")
      ?.addEventListener("click", (): void => {
        this.eventBus.emit("venue:export", undefined);
      });

    this.attachImportEvent();
    this.attachFloorSelectorEvents();
  }

  /**
   * Attaches change listener to the JSON file import input.
   */
  private attachImportEvent(): void {
    const fileInput = this.container.querySelector(
      "#input-import-layout",
    ) as HTMLInputElement;
    fileInput?.addEventListener("change", (): void => {
      const file = fileInput.files?.[0];
      if (file) {
        this.eventBus.emit("venue:import", { file });
      }
    });
  }

  /**
   * Attaches click listeners to the floor switcher buttons.
   */
  private attachFloorSelectorEvents(): void {
    const floorButtons = this.container.querySelectorAll(".btn-floor");
    floorButtons.forEach((btn): void => {
      btn.addEventListener("click", (): void => {
        const floorAttr = btn.getAttribute("data-floor");
        if (floorAttr !== null) {
          const floor = parseInt(floorAttr, 10);
          if (!isNaN(floor)) {
            this.eventBus.emit("floor:change", { floor });
          }
        }
      });
    });
  }
}
