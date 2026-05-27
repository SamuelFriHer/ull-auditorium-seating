import type { AppState } from "../models/AppState";
import type { EventBus } from "../events/EventBus";
import type { IView } from "./IView";
import type { OrlaGuestGroup } from "../models/OrlaGuestGroup";

/**
 * Handles rendering the sidebar panel for Orla Mode.
 */
export class OrlaPanelView implements IView {
  private readonly onVenueUpdated: () => void;
  private readonly inputHandler: (e: Event) => void;
  private readonly clickHandler: (e: Event) => void;
  private readonly keydownHandler: (e: Event) => void;

  /**
   * Initializes a new OrlaPanelView instance.
   */
  constructor(
    private readonly container: HTMLElement,
    private readonly state: AppState,
    private readonly eventBus: EventBus,
  ) {
    this.onVenueUpdated = (): void => this.render();
    this.eventBus.on("venue:updated", this.onVenueUpdated);

    this.inputHandler = (e: Event): void => this.handleInput(e);
    this.clickHandler = (e: Event): void => this.handleClick(e);
    this.keydownHandler = (e: Event): void => this.handleKeydown(e);
    this.setupEventDelegation();
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
      this.container.querySelector("#orla-student-count") !== null;
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
    this.renderGroupsList(selectedGroup);
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

  private setupEventDelegation(): void {
    this.container.addEventListener("input", this.inputHandler);
    this.container.addEventListener("click", this.clickHandler);
    this.container.addEventListener("keydown", this.keydownHandler);
  }

  private handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (!target) return;
    if (target.id === "orla-student-count") {
      this.eventBus.emit("orla:students-change", {
        count: parseInt(target.value, 10) || 0,
      });
    } else if (target.id === "orla-guest-count") {
      this.eventBus.emit("orla:guests-change", {
        count: parseInt(target.value, 10) || 0,
      });
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
      if (group)
        this.eventBus.emit("orla:guest-group-toggle", { groupId: group.id });
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
    this.container.innerHTML = `
      <div class="group-panel-header"><h2>Asignación de Invitaciones</h2></div>
      <div class="orla-inputs-card">
        <div class="form-group-orla">
          <label for="orla-student-count">Estudiantes a graduarse</label>
          <input type="number" id="orla-student-count" min="0" value="${this.state.orlaStudentCount}" />
        </div>
        <div class="form-group-orla">
          <label for="orla-guest-count">Invitados por estudiante</label>
          <div class="guest-input-row">
            <input type="number" id="orla-guest-count" min="0" max="${maxGuests}" value="${this.state.orlaGuestCountPerStudent}" ${this.state.orlaStudentCount <= 0 ? "disabled" : ""} />
            <span class="max-badge">Máx: ${maxGuests}</span>
          </div>
        </div>
      </div>
      <div id="orla-detail-container">${this.renderDetailCard(selectedGroup)}</div>
      <div class="groups-list-header">
        <h3>Grupos de Invitados</h3>
        <span class="progress-badge">${occupiedCount}/${totalCount} ocupados</span>
      </div>
      <div class="groups-list" id="orla-groups-list"></div>
    `;
  }

  private updateExistingDOM(
    maxGuests: number,
    occupiedCount: number,
    totalCount: number,
    selectedGroup: OrlaGuestGroup | null,
  ): void {
    const studentInput = this.container.querySelector(
      "#orla-student-count",
    ) as HTMLInputElement;
    if (
      studentInput &&
      studentInput.value !== String(this.state.orlaStudentCount)
    ) {
      studentInput.value = String(this.state.orlaStudentCount);
    }
    const guestInput = this.container.querySelector(
      "#orla-guest-count",
    ) as HTMLInputElement;
    if (guestInput) {
      if (guestInput.value !== String(this.state.orlaGuestCountPerStudent)) {
        guestInput.value = String(this.state.orlaGuestCountPerStudent);
      }
      guestInput.max = String(maxGuests);
      if (this.state.orlaStudentCount <= 0)
        guestInput.setAttribute("disabled", "true");
      else guestInput.removeAttribute("disabled");
    }
    const maxBadge = this.container.querySelector(".max-badge");
    if (maxBadge) maxBadge.textContent = `Máx: ${maxGuests}`;

    this.updateDetailCard(selectedGroup);

    const progressBadge = this.container.querySelector(".progress-badge");
    if (progressBadge)
      progressBadge.textContent = `${occupiedCount}/${totalCount} ocupados`;
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

  private getGroupLocationText(group: OrlaGuestGroup): string {
    const firstSeatId = group.seatIds[0];
    const seat = firstSeatId ? this.state.venue.getSeat(firstSeatId) : null;
    if (!seat) return group.provisionalLabel;

    const sideText = seat.number % 2 !== 0 ? "Lado Impar" : "Lado Par";
    switch (seat.sectionId) {
      case "stalls":
        return `Patio - ${sideText}`;
      case "amphitheater":
        return `Anfiteatro - ${sideText}`;
      case "lower_box":
        return `Palco Bajo - ${sideText}`;
      case "upper_box":
        return `Palco Alto - ${sideText}`;
      default:
        return group.provisionalLabel;
    }
  }

  private renderDetailCard(group: OrlaGuestGroup | null): string {
    if (!group) {
      return `<div class="selected-group-detail empty-detail" data-group-id="null"><p>Selecciona un grupo de invitados en el plano para iniciar el sorteo.</p></div>`;
    }
    const seats = group.seatIds
      .map((id): string => {
        const seat = this.state.venue.getSeat(id);
        if (!seat) return id.split("-").pop() || "";
        const hasRow = seat.row !== "Odd" && seat.row !== "Even";
        return hasRow ? `${seat.row}-${seat.number}` : `${seat.number}`;
      })
      .join(", ");
    const locationText = this.getGroupLocationText(group);
    return `
      <div class="selected-group-detail card" data-group-id="${group.id}">
        <div class="detail-header">
          <h3>Detalle del Grupo</h3>
          <span class="status-indicator ${group.isOccupied ? "occupied" : "free"}">${group.isOccupied ? "Ocupado" : "Libre"}</span>
        </div>
        <div class="detail-body">
          <div class="detail-row"><strong>Ubicación:</strong> <span class="detail-location">${locationText}</span></div>
          <div class="detail-row"><strong>Butacas:</strong> <span class="detail-seats">${seats}</span></div>
          <div class="form-group-orla">
            <label for="orla-group-label">Asignar a estudiante</label>
            <input type="text" id="orla-group-label" value="${group.customLabel || ""}" placeholder="Nombre del estudiante..." />
          </div>
          <button class="btn-toggle-occupied ${group.isOccupied ? "btn-danger" : "btn-primary"}">
            ${group.isOccupied ? "Marcar como Libre" : "Entregar Invitaciones"}
          </button>
        </div>
      </div>
    `;
  }

  private updateDetailCard(group: OrlaGuestGroup | null): void {
    const detailContainer = this.container.querySelector(
      "#orla-detail-container",
    );
    if (!detailContainer) return;
    const detailCard = detailContainer.querySelector(".selected-group-detail");
    const currentGroupId = detailCard?.getAttribute("data-group-id") || null;
    const targetGroupId = group ? group.id : "null";

    if (currentGroupId !== targetGroupId) {
      detailContainer.innerHTML = this.renderDetailCard(group);
      return;
    }
    if (!group) return;

    const locationSpan = detailCard?.querySelector(".detail-location");
    if (locationSpan) {
      locationSpan.textContent = this.getGroupLocationText(group);
    }
    const seatsSpan = detailCard?.querySelector(".detail-seats");
    if (seatsSpan) {
      const seats = group.seatIds
        .map((id): string => {
          const seat = this.state.venue.getSeat(id);
          if (!seat) return id.split("-").pop() || "";
          const hasRow = seat.row !== "Odd" && seat.row !== "Even";
          return hasRow ? `${seat.row}-${seat.number}` : `${seat.number}`;
        })
        .join(", ");
      seatsSpan.textContent = seats;
    }
    const statusIndicator = detailCard?.querySelector(".status-indicator");
    if (statusIndicator) {
      statusIndicator.className = `status-indicator ${group.isOccupied ? "occupied" : "free"}`;
      statusIndicator.textContent = group.isOccupied ? "Ocupado" : "Libre";
    }
    const inputLabel = detailCard?.querySelector(
      "#orla-group-label",
    ) as HTMLInputElement;
    if (inputLabel && document.activeElement !== inputLabel) {
      inputLabel.value = group.customLabel || "";
    }
    const btnToggle = detailCard?.querySelector(".btn-toggle-occupied");
    if (btnToggle) {
      btnToggle.className = `btn-toggle-occupied ${group.isOccupied ? "btn-danger" : "btn-primary"}`;
      btnToggle.textContent = group.isOccupied
        ? "Marcar como Libre"
        : "Entregar Invitaciones";
    }
  }

  private renderGroupsList(activeGroup: OrlaGuestGroup | null): void {
    const list = this.container.querySelector("#orla-groups-list");
    if (!list) return;
    list.innerHTML = "";
    this.state.orlaGuestGroups.forEach((g): void => {
      const item = document.createElement("div");
      const isSel = activeGroup?.id === g.id;
      item.className = `group-item orla-group-item ${isSel ? "active" : ""} ${g.isOccupied ? "occupied" : ""}`;
      item.style.borderLeft = `4px solid ${g.isOccupied ? "var(--color-orla-guest-occupied)" : "var(--color-orla-guest-free)"}`;
      item.innerHTML = `<div class="group-info" role="button" tabindex="0"><span class="group-label">${g.label}</span><span class="group-count">${g.seatIds.length} butacas</span></div>`;
      item.querySelector(".group-info")?.addEventListener("click", (): void => {
        this.eventBus.emit("orla:guest-group-select", { groupId: g.id });
      });
      list.appendChild(item);
    });
  }
}
