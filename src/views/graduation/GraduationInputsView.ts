import type { AppState } from "../../models/AppState";

/**
 * Component for rendering and handling the Graduation student/guest inputs.
 */
export class GraduationInputsView {
  /**
   * Initializes a new GraduationInputsView.
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
      <div class="form-group-graduation">
        <label for="graduation-student-count">Estudiantes a graduarse</label>
        <input type="number" id="graduation-student-count" min="0" value="${this.state.graduationStudentCount}" />
      </div>
      <div class="form-group-graduation">
        <label for="graduation-guest-count">Invitados por estudiante</label>
        <div class="guest-input-row">
          <input type="number" id="graduation-guest-count" min="0" max="${maxGuests}" value="${this.state.graduationGuestCountPerStudent}" ${this.state.graduationStudentCount <= 0 ? "disabled" : ""} />
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
      "#graduation-student-count",
    ) as HTMLInputElement;
    if (input && input.value !== String(this.state.graduationStudentCount)) {
      input.value = String(this.state.graduationStudentCount);
    }
  }

  private updateGuestInput(maxGuests: number): void {
    const input = this.container.querySelector(
      "#graduation-guest-count",
    ) as HTMLInputElement;
    if (input) {
      if (input.value !== String(this.state.graduationGuestCountPerStudent)) {
        input.value = String(this.state.graduationGuestCountPerStudent);
      }
      input.max = String(maxGuests);
      if (this.state.graduationStudentCount <= 0) {
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
