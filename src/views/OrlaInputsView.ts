import type { AppState } from "../models/AppState";

/**
 * Component for rendering and handling the Orla student/guest inputs.
 */
export class OrlaInputsView {
  /**
   * Initializes a new OrlaInputsView.
   */
  constructor(
    private readonly container: HTMLElement,
    private readonly state: AppState,
  ) {}

  /**
   * Renders the inputs section HTML template.
   */
  public render(maxGuests: number): void {
    this.container.innerHTML = `
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
    `;
  }

  /**
   * Updates student and guest input fields.
   */
  public update(maxGuests: number): void {
    this.updateStudentInput();
    this.updateGuestInput(maxGuests);
  }

  private updateStudentInput(): void {
    const input = this.container.querySelector(
      "#orla-student-count",
    ) as HTMLInputElement;
    if (input && input.value !== String(this.state.orlaStudentCount)) {
      input.value = String(this.state.orlaStudentCount);
    }
  }

  private updateGuestInput(maxGuests: number): void {
    const input = this.container.querySelector(
      "#orla-guest-count",
    ) as HTMLInputElement;
    if (input) {
      if (input.value !== String(this.state.orlaGuestCountPerStudent)) {
        input.value = String(this.state.orlaGuestCountPerStudent);
      }
      input.max = String(maxGuests);
      if (this.state.orlaStudentCount <= 0) {
        input.setAttribute("disabled", "true");
      } else {
        input.removeAttribute("disabled");
      }
    }
    this.updateMaxBadge(maxGuests);
  }

  private updateMaxBadge(maxGuests: number): void {
    const badge = this.container.querySelector(".max-badge");
    if (badge) {
      badge.textContent = `Máx: ${maxGuests}`;
    }
  }
}
