import type { Section } from "../models/Section";
import type { EventBus } from "../events/EventBus";
import { SeatView } from "./SeatView";
import type { IView } from "./IView";

/**
 * Renders an auditorium section and handles seat pointer interactions (clicks/drags).
 */
export class SectionView implements IView {
  private readonly container: SVGElement;
  private readonly section: Section;
  private readonly eventBus: EventBus;
  private readonly seatViews: Map<string, SeatView>;
  private readonly element: SVGGElement;

  private isDragging: boolean;
  private hasDragged: boolean;
  private dragStartSeatId: string | null;
  private lastHoveredSeatId: string | null;
  private readonly boundPointerUp: () => void;

  /**
   * Initializes a new SectionView instance.
   *
   * @param section - The section model.
   * @param container - The parent SVG element container.
   * @param eventBus - The application event bus.
   */
  constructor(section: Section, container: SVGElement, eventBus: EventBus) {
    this.section = section;
    this.container = container;
    this.eventBus = eventBus;
    this.seatViews = new Map();

    this.element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.element.setAttribute("class", `venue-section section-${section.id}`);

    this.isDragging = false;
    this.hasDragged = false;
    this.dragStartSeatId = null;
    this.lastHoveredSeatId = null;
    this.boundPointerUp = this.handlePointerUp.bind(this);

    this.attachEvents();
  }

  /**
   * Returns the SeatView instance for a specific seat ID.
   *
   * @param id - The seat identifier.
   */
  public getSeatView(id: string): SeatView | null {
    return this.seatViews.get(id) || null;
  }

  /**
   * Renders the section group and all nested seat views.
   */
  public render(): void {
    this.element.innerHTML = "";
    this.seatViews.clear();

    for (const seat of this.section.seats) {
      const seatView = new SeatView(seat);
      seatView.render();
      this.element.appendChild(seatView.getElement());
      this.seatViews.set(seat.id, seatView);
    }

    this.container.appendChild(this.element);
  }

  /**
   * Cleans up event listeners and removes DOM elements.
   */
  public destroy(): void {
    window.removeEventListener("pointerup", this.boundPointerUp);
    window.removeEventListener("pointercancel", this.boundPointerUp);

    for (const seatView of this.seatViews.values()) {
      seatView.destroy();
    }
    this.seatViews.clear();
    this.element.remove();
  }

  /**
   * Attaches pointer events for seat click and drag interactions.
   */
  private attachEvents(): void {
    this.element.addEventListener(
      "pointerdown",
      (event: PointerEvent): void => {
        const target = event.target as SVGElement;
        const seatId = target.getAttribute("data-seat-id");
        if (seatId) {
          this.handlePointerDown(event, seatId);
        }
      },
    );

    this.element.addEventListener(
      "pointerover",
      (event: PointerEvent): void => {
        this.handlePointerOver(event);
      },
    );
  }

  /**
   * Handles starting drag selection or click.
   */
  private handlePointerDown(event: PointerEvent, seatId: string): void {
    if (event.button !== 0) {
      return;
    }
    const seat = this.section.getSeat(seatId);
    if (!seat || seat.isDisabled) {
      return;
    }

    const target = event.target as SVGElement;
    try {
      target.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore if pointer capture release is not supported or not active
    }

    this.isDragging = true;
    this.hasDragged = false;
    this.dragStartSeatId = seatId;
    this.lastHoveredSeatId = seatId;

    this.eventBus.emit("seat:drag-start", { seatId });

    window.addEventListener("pointerup", this.boundPointerUp);
    window.addEventListener("pointercancel", this.boundPointerUp);
  }

  /**
   * Handles dragging over seats to extend selection.
   */
  private handlePointerOver(event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }
    const target = event.target as SVGElement;
    const seatId = target.getAttribute("data-seat-id");
    if (seatId && seatId !== this.lastHoveredSeatId) {
      const seat = this.section.getSeat(seatId);
      if (!seat || seat.isDisabled) {
        return;
      }
      this.hasDragged = true;
      this.lastHoveredSeatId = seatId;
      this.eventBus.emit("seat:drag-over", { seatId });
    }
  }

  /**
   * Cleans up dragging state and emits final click/drag-end events.
   */
  private handlePointerUp(): void {
    if (!this.isDragging) {
      return;
    }
    this.isDragging = false;

    this.eventBus.emit("seat:drag-end", undefined);

    if (!this.hasDragged && this.dragStartSeatId) {
      this.eventBus.emit("seat:click", { seatId: this.dragStartSeatId });
    }

    this.dragStartSeatId = null;
    this.lastHoveredSeatId = null;

    window.removeEventListener("pointerup", this.boundPointerUp);
    window.removeEventListener("pointercancel", this.boundPointerUp);
  }
}
