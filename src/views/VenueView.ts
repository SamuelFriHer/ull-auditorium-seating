import type { AppState } from "../models/AppState";
import type { Section } from "../models/Section";
import type { EventBus } from "../events/EventBus";
import type { Seat } from "../models/Seat";
import type { SeatGroup } from "../models/SeatGroup";
import { SectionView } from "./SectionView";
import { SeatView } from "./SeatView";
import type { IView } from "./IView";
import {
  getSectionIdsForFloor,
  calculateVenueViewBox,
} from "../utils/LayoutUtils";

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
    this.sectionViews = new Map();
    this.seatViews = new Map();

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
   * Clears all currently rendered section and seat views.
   */
  private clearViews(): void {
    this.container.innerHTML = "";
    this.sectionViews.forEach((view: SectionView): void => {
      view.destroy();
    });
    this.sectionViews.clear();
    this.seatViews.clear();
  }

  /**
   * Creates and configures the parent SVG element.
   */
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

  /**
   * Renders individual section views and populates cached seat views.
   *
   * @param sections - List of sections to render.
   * @param svg - The parent SVG element container.
   */
  private renderSections(sections: Section[], svg: SVGElement): void {
    sections.forEach((section: Section): void => {
      const sectionView: SectionView = new SectionView(
        section,
        svg,
        this.eventBus,
      );
      sectionView.render();
      this.sectionViews.set(section.id, sectionView);

      section.seats.forEach((seat: Seat): void => {
        const seatView: SeatView | null = sectionView.getSeatView(seat.id);
        if (seatView) {
          this.seatViews.set(seat.id, seatView);
        }
      });
    });
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

    this.sectionViews.forEach((view: SectionView): void => {
      view.destroy();
    });
    this.sectionViews.clear();
    this.seatViews.clear();
    this.container.innerHTML = "";
  }

  /**
   * Subscribes to necessary application events.
   */
  private bindEvents(): void {
    this.eventBus.on("venue:updated", this.onVenueUpdated);
    this.eventBus.on("venue:loaded", this.onVenueLoaded);
    this.eventBus.on("floor:change", this.onFloorChanged);
  }

  /**
   * Synchronizes select and color states on all rendered seat elements.
   */
  private updateSeatStates(): void {
    const selectedSet: Set<string> = new Set(this.state.selectedSeatIds);
    const groupColorMap: Map<string, string> = new Map();

    this.state.venue.groups.forEach((group: SeatGroup): void => {
      groupColorMap.set(group.id, group.color);
    });

    this.seatViews.forEach((seatView: SeatView, seatId: string): void => {
      seatView.setSelected(selectedSet.has(seatId));

      const seat: Seat = seatView.getSeat();
      const groupColor: string | null = seat.groupId
        ? groupColorMap.get(seat.groupId) || null
        : null;
      seatView.setGroupColor(groupColor);
    });
  }

  /**
   * Resolves the list of Section models visible for a given floor.
   */
  private getSectionsForFloor(floor: number): Section[] {
    const floorSectionIds: string[] = getSectionIdsForFloor(floor);
    return this.state.venue.sections.filter((sec: Section): boolean =>
      floorSectionIds.includes(sec.id),
    );
  }
}
