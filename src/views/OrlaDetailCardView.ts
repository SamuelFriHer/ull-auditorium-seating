import type { AppState } from "../models/AppState";
import type { OrlaGuestGroup } from "../models/OrlaGuestGroup";

/**
 * Component for rendering the detail card of a selected OrlaGuestGroup.
 */
export class OrlaDetailCardView {
  /**
   * Initializes a new OrlaDetailCardView.
   */
  constructor(
    private readonly container: HTMLElement,
    private readonly state: AppState,
  ) {}

  /**
   * Renders the HTML structure for the selected group details.
   */
  public render(group: OrlaGuestGroup | null): void {
    this.container.innerHTML = this.generateHtml(group);
  }

  /**
   * Updates the detail card elements without fully re-rendering if group matches.
   */
  public update(group: OrlaGuestGroup | null): void {
    const detailCard = this.container.querySelector(".selected-group-detail");
    const currentGroupId = detailCard?.getAttribute("data-group-id") || null;
    const targetGroupId = group ? group.id : "null";

    if (currentGroupId !== targetGroupId) {
      this.render(group);
      return;
    }
    if (!group) return;

    this.updateCardContent(group, detailCard as HTMLElement);
  }

  private updateCardContent(
    group: OrlaGuestGroup,
    detailCard: HTMLElement,
  ): void {
    this.updateLocation(group, detailCard);
    this.updateSeats(group, detailCard);
    this.updateStatusAndInputs(group, detailCard);
  }

  private updateLocation(group: OrlaGuestGroup, card: HTMLElement): void {
    const span = card.querySelector(".detail-location");
    if (span) {
      span.textContent = this.getGroupLocationText(group);
    }
  }

  private updateSeats(group: OrlaGuestGroup, card: HTMLElement): void {
    const span = card.querySelector(".detail-seats");
    if (span) {
      span.textContent = this.formatSeatsText(group);
    }
  }

  private updateStatusAndInputs(
    group: OrlaGuestGroup,
    card: HTMLElement,
  ): void {
    const status = card.querySelector(".status-indicator");
    if (status) {
      status.className = `status-indicator ${group.isOccupied ? "occupied" : "free"}`;
      status.textContent = group.isOccupied ? "Ocupado" : "Libre";
    }
    const input = card.querySelector("#orla-group-label") as HTMLInputElement;
    if (input && document.activeElement !== input) {
      input.value = group.customLabel || "";
    }
    const btn = card.querySelector(".btn-toggle-occupied");
    if (btn) {
      btn.className = `btn-toggle-occupied ${group.isOccupied ? "btn-danger" : "btn-primary"}`;
      btn.textContent = group.isOccupied
        ? "Marcar como Libre"
        : "Entregar Invitaciones";
    }
  }

  private generateHtml(group: OrlaGuestGroup | null): string {
    if (!group) {
      return `<div class="selected-group-detail empty-detail" data-group-id="null"><p>Selecciona un grupo de invitados en el plano para iniciar la asignación.</p></div>`;
    }
    const seats = this.formatSeatsText(group);
    const locationText = this.getGroupLocationText(group);
    return `
      <div class="selected-group-detail card" data-group-id="${group.id}">
        <div class="detail-header">
          <h3>Detalles del Grupo</h3>
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

  private formatSeatsText(group: OrlaGuestGroup): string {
    return group.seatIds
      .map((id): string => {
        const seat = this.state.venue.getSeat(id);
        if (!seat) return id.split("-").pop() || "";
        const hasRow = seat.row !== "Odd" && seat.row !== "Even";
        return hasRow ? `${seat.row}-${seat.number}` : `${seat.number}`;
      })
      .join(", ");
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
}
