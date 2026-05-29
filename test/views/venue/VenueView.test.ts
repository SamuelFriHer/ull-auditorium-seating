import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockInstance } from "vitest";
import { VenueView } from "../../../src/views/venue/VenueView";
import { AppState } from "../../../src/models/AppState";
import { EventBus } from "../../../src/events/EventBus";
import { Venue } from "../../../src/models/Venue";
import { Section } from "../../../src/models/Section";
import { Seat } from "../../../src/models/Seat";
import { SeatGroup } from "../../../src/models/SeatGroup";
import { SectionType } from "../../../src/types";

/**
 * Mock representation of an SVG/HTML element for testing DOM operations in Node.
 */
class MockElement {
  public attributes: Record<string, string> = {};
  public children: MockElement[] = [];
  public classList: {
    classes: Set<string>;
    add: (className: string) => void;
    remove: (className: string) => void;
    contains: (className: string) => boolean;
  } = {
    classes: new Set<string>(),
    add: (className: string): void => {
      this.classList.classes.add(className);
    },
    remove: (className: string): void => {
      this.classList.classes.delete(className);
    },
    contains: (className: string): boolean => {
      return this.classList.classes.has(className);
    },
  };
  public style: { fill: string } = {
    fill: "",
  };
  public textContent: string = "";
  private internalInnerHTML: string = "";

  /**
   * Getter for innerHTML.
   *
   * @returns The internal innerHTML string.
   */
  public get innerHTML(): string {
    return this.internalInnerHTML;
  }

  /**
   * Setter for innerHTML. Clears children if empty string is assigned.
   *
   * @param val - The HTML string to set.
   */
  public set innerHTML(val: string) {
    this.internalInnerHTML = val;
    if (val === "") {
      this.children = [];
    }
  }

  /**
   * Sets the value of an attribute on the mock element.
   *
   * @param name - The name of the attribute.
   * @param value - The value to set.
   */
  public setAttribute(name: string, value: string): void {
    this.attributes[name] = value;
    if (name === "class") {
      this.classList.classes.clear();
      value.split(" ").forEach((className: string): void => {
        if (className.trim()) {
          this.classList.classes.add(className.trim());
        }
      });
    }
  }

  /**
   * Gets the value of an attribute from the mock element.
   *
   * @param name - The name of the attribute.
   * @returns The attribute value, or null if it does not exist.
   */
  public getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  /**
   * Appends a child to the mock element.
   *
   * @param child - The child element to append.
   */
  public appendChild(child: MockElement): void {
    this.children.push(child);
  }

  /**
   * Mock function to simulate removing the element.
   */
  public remove: () => void = vi.fn();

  /**
   * Mock function to simulate releasePointerCapture.
   *
   * @param pointerId - Pointer identifier.
   */
  public releasePointerCapture: (pointerId: number) => void = vi.fn();

  /**
   * Mock function to simulate addEventListener.
   *
   * @param eventType - Event type.
   * @param callback - Event listener callback.
   */
  public addEventListener: (
    eventType: string,
    callback: (event: unknown) => void,
  ) => void = vi.fn();

  /**
   * Mock function to simulate removeEventListener.
   *
   * @param eventType - Event type.
   * @param callback - Event listener callback.
   */
  public removeEventListener: (
    eventType: string,
    callback: (event: unknown) => void,
  ) => void = vi.fn();
}

/**
 * Creates a mock Venue containing sections and seats for testing.
 *
 * @returns The initialized mock Venue instance.
 */
function createMockVenue(): Venue {
  const seat1: Seat = new Seat("seat-1", "A", 1, "stalls", 10, 20);
  const seat2: Seat = new Seat("seat-2", "A", 2, "stalls", 30, 20);
  const seat3: Seat = new Seat("seat-3", "B", 1, "amphitheater", 50, 40);
  const seat4: Seat = new Seat("seat-4", "C", 1, "lower_box", 70, 60);
  const seat5: Seat = new Seat("seat-5", "D", 1, "upper_box", 90, 80);

  const sectionStalls: Section = new Section(
    "stalls",
    "Stalls",
    SectionType.STALLS,
    [seat1, seat2],
  );
  const sectionAmphi: Section = new Section(
    "amphitheater",
    "Amphitheater",
    SectionType.AMPHITHEATER,
    [seat3],
  );
  const sectionLowerBox: Section = new Section(
    "lower_box",
    "Lower Box",
    SectionType.LOWER_BOX,
    [seat4],
  );
  const sectionUpperBox: Section = new Section(
    "upper_box",
    "Upper Box",
    SectionType.UPPER_BOX,
    [seat5],
  );

  return new Venue("venue-1", "ULL Auditorium", [
    sectionStalls,
    sectionAmphi,
    sectionLowerBox,
    sectionUpperBox,
  ]);
}

describe("VenueView - ZOMBIES", (): void => {
  let container: MockElement;
  let eventBus: EventBus;
  let state: AppState;
  let venue: Venue;

  beforeEach((): void => {
    vi.clearAllMocks();
    container = new MockElement();
    eventBus = new EventBus();

    globalThis.document = {
      createElementNS: vi
        .fn()
        .mockImplementation((): MockElement => new MockElement()),
    } as unknown as Document;

    globalThis.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window & typeof globalThis;

    venue = createMockVenue();
    state = new AppState(venue);
    state.activeFloor = 0;
  });

  describe("Z - Zero", (): void => {
    it("should render empty SVG and no sections if active floor has no sections", (): void => {
      state.activeFloor = 99;
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();

      expect(container.children).toHaveLength(1);
      const svg: MockElement = container.children[0];
      expect(svg.children).toHaveLength(0);
    });

    it("should handle empty venue sections array gracefully", (): void => {
      const emptyVenue: Venue = new Venue("empty", "Empty", []);
      const emptyState: AppState = new AppState(emptyVenue);
      emptyState.activeFloor = 0;

      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        emptyState,
        eventBus,
      );
      view.render();

      expect(container.children).toHaveLength(1);
      const svg: MockElement = container.children[0];
      expect(svg.getAttribute("viewBox")).toBe("0 0 1050 720");
    });
  });

  describe("O - One", (): void => {
    it("should render one section when active floor contains exactly one section", (): void => {
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();

      expect(container.children).toHaveLength(1);
      const svg: MockElement = container.children[0];
      expect(svg.children).toHaveLength(1);

      const sectionGroup: MockElement = svg.children[0];
      expect(sectionGroup.getAttribute("class")).toContain("section-stalls");
    });
  });

  describe("M - Many", (): void => {
    it("should render multiple sections when active floor contains multiple sections", (): void => {
      state.activeFloor = 1;
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();

      expect(container.children).toHaveLength(1);
      const svg: MockElement = container.children[0];
      expect(svg.children).toHaveLength(2);

      const amphiGroup: MockElement = svg.children[0];
      const lowerBoxGroup: MockElement = svg.children[1];
      expect(amphiGroup.getAttribute("class")).toContain(
        "section-amphitheater",
      );
      expect(lowerBoxGroup.getAttribute("class")).toContain(
        "section-lower_box",
      );
    });

    it("should render seats and associate group colors correctly", (): void => {
      const group: SeatGroup = new SeatGroup("g-1", "Group 1", "#00FF00", [
        "seat-1",
      ]);
      venue.groups.push(group);
      const targetSeat: Seat | null = venue.getSeat("seat-1");
      if (targetSeat) {
        targetSeat.groupId = "g-1";
      }

      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();

      const internalSeatViews: Map<string, { getElement: () => MockElement }> =
        (
          view as unknown as {
            seatViews: Map<string, { getElement: () => MockElement }>;
          }
        ).seatViews;
      const seat1View: { getElement: () => MockElement } | undefined =
        internalSeatViews.get("seat-1");

      expect(seat1View).toBeDefined();
      const seatElement: MockElement | undefined = seat1View?.getElement();
      expect(seatElement?.style.fill).toBe("#00FF00");
    });
  });

  describe("B - Boundary", (): void => {
    it("should re-render new floor sections when floor:change event is emitted", (): void => {
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();

      expect(container.children).toHaveLength(1);
      let svg: MockElement = container.children[0];
      expect(svg.children).toHaveLength(1);
      expect(svg.children[0].getAttribute("class")).toContain("section-stalls");

      eventBus.emit("floor:change", { floor: 1 });

      svg = container.children[0];
      expect(svg.children).toHaveLength(2);
      expect(svg.children[0].getAttribute("class")).toContain(
        "section-amphitheater",
      );
      expect(svg.children[1].getAttribute("class")).toContain(
        "section-lower_box",
      );
    });

    it("should update highlighted seats and update element classes", (): void => {
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();

      const internalSeatViews: Map<string, { getElement: () => MockElement }> =
        (
          view as unknown as {
            seatViews: Map<string, { getElement: () => MockElement }>;
          }
        ).seatViews;
      const seat1View: { getElement: () => MockElement } | undefined =
        internalSeatViews.get("seat-1");
      const seat2View: { getElement: () => MockElement } | undefined =
        internalSeatViews.get("seat-2");

      expect(seat1View?.getElement().classList.contains("selected")).toBe(
        false,
      );
      expect(seat2View?.getElement().classList.contains("selected")).toBe(
        false,
      );

      view.highlightSeats(["seat-1"]);

      expect(seat1View?.getElement().classList.contains("selected")).toBe(true);
      expect(seat2View?.getElement().classList.contains("selected")).toBe(
        false,
      );

      view.highlightSeats([]);

      expect(seat1View?.getElement().classList.contains("selected")).toBe(
        false,
      );
      expect(seat2View?.getElement().classList.contains("selected")).toBe(
        false,
      );
    });
  });

  describe("I - Interface", (): void => {
    it("should support and implement the IView interface", (): void => {
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );

      expect(typeof view.render).toBe("function");
      expect(typeof view.destroy).toBe("function");
    });

    it("should bind and unbind event bus listeners on init and destroy", (): void => {
      const onSpy: MockInstance = vi.spyOn(eventBus, "on");
      const offSpy: MockInstance = vi.spyOn(eventBus, "off");

      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );

      expect(onSpy).toHaveBeenCalledWith("venue:updated", expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith("venue:loaded", expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith("floor:change", expect.any(Function));

      view.destroy();

      expect(offSpy).toHaveBeenCalledWith(
        "venue:updated",
        expect.any(Function),
      );
      expect(offSpy).toHaveBeenCalledWith("venue:loaded", expect.any(Function));
      expect(offSpy).toHaveBeenCalledWith("floor:change", expect.any(Function));
    });
  });

  describe("E - Exceptional", (): void => {
    it("should not throw when highlightSeats is called with non-existent seat IDs", (): void => {
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();

      expect((): void => {
        view.highlightSeats(["non-existent-seat-id"]);
      }).not.toThrow();
    });

    it("should handle active floors outside bounds by rendering zero sections", (): void => {
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();

      expect(container.children).toHaveLength(1);

      eventBus.emit("floor:change", { floor: -1 });

      const svg: MockElement = container.children[0];
      expect(svg.children).toHaveLength(0);
    });
  });

  describe("S - Simple", (): void => {
    it("should clear previous SVG container on second render call", (): void => {
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();
      expect(container.children).toHaveLength(1);

      view.render();
      expect(container.children).toHaveLength(1);
    });

    it("should clear the container and destroy subviews on destroy", (): void => {
      const view: VenueView = new VenueView(
        container as unknown as HTMLElement,
        state,
        eventBus,
      );
      view.render();

      const internalSectionViews: Map<string, { destroy: () => void }> = (
        view as unknown as {
          sectionViews: Map<string, { destroy: () => void }>;
        }
      ).sectionViews;
      const stallsSectionView: { destroy: () => void } | undefined =
        internalSectionViews.get("stalls");
      expect(stallsSectionView).toBeDefined();

      const destroySpy: MockInstance = vi.spyOn(stallsSectionView!, "destroy");

      view.destroy();

      expect(container.innerHTML).toBe("");
      expect(destroySpy).toHaveBeenCalledTimes(1);
      expect(internalSectionViews.size).toBe(0);
    });
  });
});
