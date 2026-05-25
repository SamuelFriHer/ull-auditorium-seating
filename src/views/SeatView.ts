import type { Seat } from "../models/Seat";
import type { IView } from "./IView";

/**
 * Handles rendering and interactive states of a single seat in the SVG layout.
 */
export class SeatView implements IView {
  private readonly element: SVGRectElement;
  private readonly seat: Seat;

  /**
   * Initializes a new SeatView instance.
   *
   * @param seat - The seat model instance.
   */
  constructor(seat: Seat) {
    this.seat = seat;
    this.element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    this.initElement();
  }

  /**
   * Returns the underlying SVG rect element.
   */
  public getElement(): SVGRectElement {
    return this.element;
  }

  /**
   * Renders the seat element properties and appends a tooltip title.
   */
  public render(): void {
    this.element.setAttribute("class", "seat");
    this.element.setAttribute("x", this.seat.x.toString());
    this.element.setAttribute("y", this.seat.y.toString());
    this.element.setAttribute("width", "18");
    this.element.setAttribute("height", "18");
    this.element.setAttribute("rx", "3");
    this.element.setAttribute("ry", "3");

    this.element.innerHTML = "";
    const title = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "title",
    );
    const rowLabel: string =
      this.seat.row === "Odd"
        ? "Impar"
        : this.seat.row === "Even"
          ? "Par"
          : this.seat.row;
    title.textContent = `Fila ${rowLabel}, Asiento ${this.seat.number}`;
    this.element.appendChild(title);
  }

  /**
   * Toggles the selection styling state on the seat.
   *
   * @param selected - True if the seat is currently selected.
   */
  public setSelected(selected: boolean): void {
    if (selected) {
      this.element.classList.add("selected");
    } else {
      this.element.classList.remove("selected");
    }
  }

  /**
   * Sets the visual color coding from the assigned group.
   *
   * @param color - The hex/css color code, or null if unassigned.
   */
  public setGroupColor(color: string | null): void {
    if (color) {
      this.element.style.fill = color;
      this.element.classList.add("assigned");
    } else {
      this.element.style.fill = "";
      this.element.classList.remove("assigned");
    }
  }

  /**
   * Removes the seat element from the DOM.
   */
  public destroy(): void {
    this.element.remove();
  }

  /**
   * Sets the static identification data attribute.
   */
  private initElement(): void {
    this.element.setAttribute("data-seat-id", this.seat.id);
  }
}
