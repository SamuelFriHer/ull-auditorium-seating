import { describe, it, expect, vi, beforeEach } from "vitest";
import { SectionView } from "../../src/views/SectionView";
import { Section } from "../../src/models/Section";
import { Seat } from "../../src/models/Seat";
import { SectionType } from "../../src/types";
import { EventBus } from "../../src/events/EventBus";

/** Mock class simulating SVG elements to run view tests without a real browser DOM. */
class MockSVGElement {
  public attributes: Record<string, string> = {};
  public innerHTML = "";
  public children: MockSVGElement[] = [];
  private listeners: Record<string, Array<(e: unknown) => void>> = {};

  /** Sets attribute values representing layout configurations. */
  public setAttribute = (n: string, v: string): void => {
    this.attributes[n] = v;
  };

  /** Retrieves layout and metadata attributes. */
  public getAttribute = (n: string): string | null =>
    this.attributes[n] ?? null;

  /** Stubs SVG child appending for seat nested views. */
  public appendChild = (c: MockSVGElement): void => {
    this.children.push(c);
  };

  /** Mock to verify element cleanup on destruction. */
  public remove: () => void = vi.fn();

  /** Stub pointer capture to test drag initiation. */
  public releasePointerCapture: (pId: number) => void = vi.fn();

  /** Registers event listeners for pointer interaction tests. */
  public addEventListener = (t: string, cb: (e: unknown) => void): void => {
    (this.listeners[t] ||= []).push(cb);
  };

  /** Unregisters event listeners for lifecycle testing. */
  public removeEventListener = (t: string, cb: (e: unknown) => void): void => {
    const idx = (this.listeners[t] || []).indexOf(cb);
    if (idx !== -1) this.listeners[t].splice(idx, 1);
  };

  /** Simulates browser events to trigger registered listeners. */
  public trigger = (t: string, e: unknown): void => {
    this.listeners[t]?.forEach((cb: (e: unknown) => void): void => cb(e));
  };
}

describe("SectionView - ZOMBIES", (): void => {
  let section: Section;
  let container: MockSVGElement;
  let eventBus: EventBus;
  let view: SectionView;
  let windowListeners: Record<string, Array<() => void>>;

  const createView = (s: Section): SectionView =>
    new SectionView(s, container as unknown as SVGElement, eventBus);

  beforeEach((): void => {
    vi.clearAllMocks();
    windowListeners = {};
    globalThis.document = {
      createElementNS: vi
        .fn()
        .mockImplementation((): MockSVGElement => new MockSVGElement()),
    } as unknown as Document;

    globalThis.window = {
      addEventListener: vi
        .fn()
        .mockImplementation((t: string, cb: () => void): void => {
          (windowListeners[t] ||= []).push(cb);
        }),
      removeEventListener: vi
        .fn()
        .mockImplementation((t: string, cb: () => void): void => {
          const idx = (windowListeners[t] || []).indexOf(cb);
          if (idx !== -1) windowListeners[t].splice(idx, 1);
        }),
    } as unknown as Window & typeof globalThis;

    section = new Section("sec-1", "Stalls", SectionType.STALLS, [
      new Seat("seat-1", "A", 1, "sec-1", 10, 20),
      new Seat("seat-2", "A", 2, "sec-1", 30, 20),
    ]);
    container = new MockSVGElement();
    eventBus = new EventBus();
    view = createView(section);
  });

  describe("Z - Zero", (): void => {
    it("should handle zero seats gracefully", (): void => {
      const emptySec = new Section("sec-0", "Empty", SectionType.STALLS, []);
      const emptyView = createView(emptySec);
      emptyView.render();
      const el = (emptyView as unknown as { element: MockSVGElement }).element;
      expect(el.children).toHaveLength(0);
      expect(emptyView.getSeatView("seat-1")).toBeNull();
    });
  });

  describe("O - One", (): void => {
    it("should render one seat successfully", (): void => {
      const singleSec = new Section("sec-1", "Stalls", SectionType.STALLS, [
        section.seats[0],
      ]);
      const singleView = createView(singleSec);
      singleView.render();
      expect(singleView.getSeatView("seat-1")).not.toBeNull();
      expect(singleView.getSeatView("seat-2")).toBeNull();
    });
  });

  describe("M - Many", (): void => {
    it("should render multiple seats and track view mapping", (): void => {
      view.render();
      expect(view.getSeatView("seat-1")).not.toBeNull();
      expect(view.getSeatView("seat-2")).not.toBeNull();
      expect(container.children).toHaveLength(1);
    });
  });

  describe("B - Boundary", (): void => {
    it("should handle click and drag event sequences", (): void => {
      view.render();
      const el = (view as unknown as { element: MockSVGElement }).element;
      const emitSpy = vi.spyOn(eventBus, "emit");

      const target1 = new MockSVGElement();
      target1.setAttribute("data-seat-id", "seat-1");
      el.trigger("pointerdown", { button: 0, target: target1, pointerId: 1 });
      expect(emitSpy).toHaveBeenCalledWith("seat:drag-start", {
        seatId: "seat-1",
      });

      windowListeners["pointerup"]?.forEach((cb: () => void): void => cb());
      expect(emitSpy).toHaveBeenCalledWith("seat:drag-end", undefined);
      expect(emitSpy).toHaveBeenCalledWith("seat:click", { seatId: "seat-1" });

      emitSpy.mockClear();

      el.trigger("pointerdown", { button: 0, target: target1, pointerId: 1 });
      const target2 = new MockSVGElement();
      target2.setAttribute("data-seat-id", "seat-2");
      el.trigger("pointerover", { target: target2 });
      expect(emitSpy).toHaveBeenCalledWith("seat:drag-over", {
        seatId: "seat-2",
      });

      windowListeners["pointerup"]?.forEach((cb: () => void): void => cb());
      expect(emitSpy).toHaveBeenCalledWith("seat:drag-end", undefined);
      expect(emitSpy).not.toHaveBeenCalledWith(
        "seat:click",
        expect.any(Object),
      );
    });
  });

  describe("I - Interface", (): void => {
    it("should support required properties and methods", (): void => {
      expect(typeof view.render).toBe("function");
      expect(typeof view.destroy).toBe("function");
      expect(typeof view.getSeatView).toBe("function");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should safely ignore right clicks and hover duplicates", (): void => {
      view.render();
      const el = (view as unknown as { element: MockSVGElement }).element;
      const emitSpy = vi.spyOn(eventBus, "emit");

      const seatMock = new MockSVGElement();
      seatMock.setAttribute("data-seat-id", "seat-1");

      el.trigger("pointerdown", { button: 1, target: seatMock });
      expect(emitSpy).not.toHaveBeenCalled();

      el.trigger("pointerover", { target: seatMock });
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe("S - Simple", (): void => {
    it("should destroy views and remove nodes", (): void => {
      view.render();
      const el = (view as unknown as { element: MockSVGElement }).element;
      view.destroy();
      expect(el.remove).toHaveBeenCalled();
      expect(view.getSeatView("seat-1")).toBeNull();
    });
  });
});
