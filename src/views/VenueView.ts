import type { AppState } from "../models/AppState";
import type { Section } from "../models/Section";
import type { EventBus } from "../events/EventBus";
import { SectionView } from "./SectionView";
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
    this.container.innerHTML = "";
    for (const view of this.sectionViews.values()) {
      view.destroy();
    }
    this.sectionViews.clear();

    const activeSections: Section[] = this.getSectionsForFloor(
      this.state.activeFloor,
    );
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

    for (const section of activeSections) {
      const sectionView = new SectionView(section, svg, this.eventBus);
      sectionView.render();
      this.sectionViews.set(section.id, sectionView);
    }

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

    for (const view of this.sectionViews.values()) {
      view.destroy();
    }
    this.sectionViews.clear();
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
    const activeSections: Section[] = this.getSectionsForFloor(
      this.state.activeFloor,
    );

    for (const section of activeSections) {
      const sectionView = this.sectionViews.get(section.id);
      if (!sectionView) {
        continue;
      }

      for (const seat of section.seats) {
        const seatView = sectionView.getSeatView(seat.id);
        if (!seatView) {
          continue;
        }

        seatView.setSelected(selectedSet.has(seat.id));

        const groupColor: string | null = seat.groupId
          ? this.state.venue.getGroup(seat.groupId)?.color || null
          : null;
        seatView.setGroupColor(groupColor);
      }
    }
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
