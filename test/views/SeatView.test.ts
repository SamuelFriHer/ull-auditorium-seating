import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeatView } from "../../src/views/SeatView";
import { Seat } from "../../src/models/Seat";

/**
 * Mock representation of an SVG Element for testing in a Node environment.
 */
class MockSVGElement {
  public attributes: Record<string, string> = {};
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
  public innerHTML: string = "";
  public textContent: string = "";
  public children: MockSVGElement[] = [];

  /**
   * Sets the value of an attribute on the mock SVG element.
   *
   * @param name - The name of the attribute.
   * @param value - The value to set.
   */
  public setAttribute(name: string, value: string): void {
    this.attributes[name] = value;
  }

  /**
   * Gets the value of an attribute from the mock SVG element.
   *
   * @param name - The name of the attribute.
   * @returns The attribute value, or null if it does not exist.
   */
  public getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  /**
   * Appends a child to the mock SVG element.
   *
   * @param child - The child element to append.
   */
  public appendChild(child: MockSVGElement): void {
    this.children.push(child);
  }

  /**
   * Mock function to simulate removing the element.
   */
  public remove: () => void = vi.fn();
}

describe("SeatView - ZOMBIES", (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
    globalThis.document = {
      createElementNS: vi.fn().mockImplementation((): MockSVGElement => {
        return new MockSVGElement();
      }),
    } as unknown as Document;
  });

  describe("Z - Zero", (): void => {
    it("should initialize element without rendering coordinates or details", (): void => {
      const seat: Seat = new Seat("seat-1", "A", 1, "sec-1", 10, 20);
      const seatView: SeatView = new SeatView(seat);
      const element: MockSVGElement =
        seatView.getElement() as unknown as MockSVGElement;

      expect(element.getAttribute("class")).toBeNull();
      expect(element.getAttribute("x")).toBeNull();
      expect(element.getAttribute("width")).toBeNull();
    });
  });

  describe("O - One", (): void => {
    it("should render properties correctly for a single seat", (): void => {
      const seat: Seat = new Seat("seat-1", "A", 1, "sec-1", 10, 20);
      const seatView: SeatView = new SeatView(seat);
      seatView.render();
      const element: MockSVGElement =
        seatView.getElement() as unknown as MockSVGElement;

      expect(element.getAttribute("class")).toBe("seat");
      expect(element.getAttribute("x")).toBe("10");
      expect(element.getAttribute("y")).toBe("20");
      expect(element.getAttribute("width")).toBe("18");
      expect(element.getAttribute("height")).toBe("18");
      expect(element.getAttribute("data-seat-id")).toBe("seat-1");
      expect(element.children).toHaveLength(1);

      const titleElement: MockSVGElement | undefined = element.children[0];
      expect(titleElement).toBeDefined();
      expect(titleElement?.textContent).toBe("Fila A, Asiento 1");
    });
  });

  describe("M - Many", (): void => {
    it("should render properties correctly for multiple coordinates and labels", (): void => {
      const seatA: Seat = new Seat("seat-1", "A", 5, "sec-1", 15, 25);
      const seatB: Seat = new Seat("seat-2", "B", 10, "sec-1", 30, 40);

      const viewA: SeatView = new SeatView(seatA);
      const viewB: SeatView = new SeatView(seatB);

      viewA.render();
      viewB.render();

      const elementA: MockSVGElement =
        viewA.getElement() as unknown as MockSVGElement;
      const elementB: MockSVGElement =
        viewB.getElement() as unknown as MockSVGElement;

      expect(elementA.getAttribute("x")).toBe("15");
      expect(elementA.getAttribute("y")).toBe("25");
      expect(elementA.children[0]?.textContent).toBe("Fila A, Asiento 5");

      expect(elementB.getAttribute("x")).toBe("30");
      expect(elementB.getAttribute("y")).toBe("40");
      expect(elementB.children[0]?.textContent).toBe("Fila B, Asiento 10");
    });
  });

  describe("B - Boundary", (): void => {
    it("should map special row labels (Even, Odd) to localized Spanish text in tooltip", (): void => {
      const seatEven: Seat = new Seat("seat-even", "Even", 2, "sec-1", 0, 0);
      const seatOdd: Seat = new Seat("seat-odd", "Odd", 3, "sec-1", 0, 0);

      const viewEven: SeatView = new SeatView(seatEven);
      const viewOdd: SeatView = new SeatView(seatOdd);

      viewEven.render();
      viewOdd.render();

      const elementEven: MockSVGElement =
        viewEven.getElement() as unknown as MockSVGElement;
      const elementOdd: MockSVGElement =
        viewOdd.getElement() as unknown as MockSVGElement;

      expect(elementEven.children[0]?.textContent).toBe("Fila Par, Asiento 2");
      expect(elementOdd.children[0]?.textContent).toBe("Fila Impar, Asiento 3");
    });
  });

  describe("I - Interface", (): void => {
    it("should implement the required IView interface and public methods", (): void => {
      const seat: Seat = new Seat("seat-1", "A", 1, "sec-1", 0, 0);
      const seatView: SeatView = new SeatView(seat);

      expect(typeof seatView.render).toBe("function");
      expect(typeof seatView.destroy).toBe("function");
      expect(typeof seatView.getElement).toBe("function");
      expect(typeof seatView.setSelected).toBe("function");
      expect(typeof seatView.setGroupColor).toBe("function");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should handle null and reset values for group color", (): void => {
      const seat: Seat = new Seat("seat-1", "A", 1, "sec-1", 0, 0);
      const seatView: SeatView = new SeatView(seat);
      const element: MockSVGElement =
        seatView.getElement() as unknown as MockSVGElement;

      seatView.setGroupColor("#FF0000");
      expect(element.style.fill).toBe("#FF0000");
      expect(element.classList.contains("assigned")).toBe(true);

      seatView.setGroupColor(null);
      expect(element.style.fill).toBe("");
      expect(element.classList.contains("assigned")).toBe(false);
    });

    it("should toggle selection states correctly", (): void => {
      const seat: Seat = new Seat("seat-1", "A", 1, "sec-1", 0, 0);
      const seatView: SeatView = new SeatView(seat);
      const element: MockSVGElement =
        seatView.getElement() as unknown as MockSVGElement;

      seatView.setSelected(true);
      expect(element.classList.contains("selected")).toBe(true);

      seatView.setSelected(false);
      expect(element.classList.contains("selected")).toBe(false);
    });
  });

  describe("S - Simple", (): void => {
    it("should call remove method on SVG element when destroy is called", (): void => {
      const seat: Seat = new Seat("seat-1", "A", 1, "sec-1", 0, 0);
      const seatView: SeatView = new SeatView(seat);
      const element: MockSVGElement =
        seatView.getElement() as unknown as MockSVGElement;

      seatView.destroy();
      expect(element.remove).toHaveBeenCalledTimes(1);
    });
  });
});
