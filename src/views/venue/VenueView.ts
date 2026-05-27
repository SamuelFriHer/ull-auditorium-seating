import type { AppState } from "../../models/AppState";
import type { Section } from "../../models/Section";
import type { EventBus } from "../../events/EventBus";
import type { Seat } from "../../models/Seat";
import { SectionView } from "./SectionView";
import { SeatView } from "./SeatView";
import type { IView } from "../IView";
import { SeatColorResolver } from "../../utils/SeatColorResolver";
import {
  getSectionIdsForFloor,
  calculateVenueViewBox,
} from "../../utils/LayoutUtils";

/**
 * Renders the entire auditorium seating map based on the active floor.
 */
export class VenueView implements IView {
  private readonly container: HTMLElement;
  private readonly state: AppState;
  private readonly eventBus: EventBus;
  private readonly sectionViews: Map<string, SectionView>;
  private readonly seatViews: Map<string, SeatView>;

  private readonly onVenueUpdated: () => void;
  private readonly onVenueLoaded: () => void;
  private readonly onFloorChanged: (payload: { floor: number }) => void;

  /**
   * Initializes a new VenueView instance.
   *
   * @param container - The parent container element.
   * @param state - The global application state.
   * @param eventBus - The application event bus.
   */
  constructor(container: HTMLElement, state: AppState, eventBus: EventBus) {
    this.container = container;
    this.state = state;
    this.eventBus = eventBus;
    this.sectionViews = new Map<string, SectionView>();
    this.seatViews = new Map<string, SeatView>();

    this.onVenueUpdated = (): void => this.updateSeatStates();
    this.onVenueLoaded = (): void => this.render();
    this.onFloorChanged = (payload: { floor: number }): void => {
      this.state.activeFloor = payload.floor;
      this.render();
    };

    this.bindEvents();
  }

  /**
   * Renders the active floor SVG map and child section views.
   */
  public render(): void {
    this.clearViews();

    const activeSections: Section[] = this.getSectionsForFloor(
      this.state.activeFloor,
    );
    const svg: SVGElement = this.createSvgContainer();

    this.renderSections(activeSections, svg);
    this.updateSeatStates();
  }

  /**
   * Highlights the specified seat IDs and updates their state.
   *
   * @param seatIds - List of seat IDs to select.
   */
  public highlightSeats(seatIds: string[]): void {
    this.state.selectedSeatIds = seatIds;
    this.updateSeatStates();
  }

  /**
   * Cleans up event listeners and child view nodes.
   */
  public destroy(): void {
    this.eventBus.off("venue:updated", this.onVenueUpdated);
    this.eventBus.off("venue:loaded", this.onVenueLoaded);
    this.eventBus.off("floor:change", this.onFloorChanged);
    this.clearViews();
  }

  private clearViews(): void {
    this.container.innerHTML = "";
    this.sectionViews.forEach((view: SectionView): void => {
      view.destroy();
    });
    this.sectionViews.clear();
    this.seatViews.clear();
  }

  private createSvgContainer(): SVGElement {
    const svg: SVGElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    svg.setAttribute(
      "viewBox",
      calculateVenueViewBox(this.state.venue.sections),
    );
    svg.setAttribute("class", "venue-svg");
    this.container.appendChild(svg);
    return svg;
  }

  private renderSections(sections: Section[], svg: SVGElement): void {
    sections.forEach((sec: Section): void => {
      const view: SectionView = new SectionView(sec, svg, this.eventBus);
      view.render();
      this.sectionViews.set(sec.id, view);
      sec.seats.forEach((s: Seat): void => {
        const sv: SeatView | null = view.getSeatView(s.id);
        if (sv) {
          this.seatViews.set(s.id, sv);
        }
      });
    });
  }

  private bindEvents(): void {
    this.eventBus.on("venue:updated", this.onVenueUpdated);
    this.eventBus.on("venue:loaded", this.onVenueLoaded);
    this.eventBus.on("floor:change", this.onFloorChanged);
  }

  private updateSeatStates(): void {
    const selectedSet: Set<string> = new Set<string>(
      this.state.selectedSeatIds,
    );
    const resolver: SeatColorResolver = new SeatColorResolver(this.state);

    this.seatViews.forEach((seatView: SeatView, seatId: string): void => {
      seatView.setSelected(selectedSet.has(seatId));
      const seat: Seat = seatView.getSeat();
      const color: string | null = resolver.resolveColor(seat);
      seatView.setGroupColor(color);
    });
  }

  private getSectionsForFloor(floor: number): Section[] {
    const floorSectionIds: string[] = getSectionIdsForFloor(floor);
    return this.state.venue.sections.filter((sec: Section): boolean =>
      floorSectionIds.includes(sec.id),
    );
  }
}
