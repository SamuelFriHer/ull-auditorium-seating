import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeatView } from "../../src/views/SeatView";
import { Seat } from "../../src/models/Seat";

class MockClassList {
  private classes = new Set<string>();
  add(c: string) {
    this.classes.add(c);
  }
  remove(c: string) {
    this.classes.delete(c);
  }
  contains(c: string) {
    return this.classes.has(c);
  }
}

class MockElement {
  public style: any = {};
  public classList = new MockClassList();
  public attributes = new Map<string, string>();
  public innerHTML = "";
  public textContent = "";
  public children: MockElement[] = [];
  public removeCalled = false;

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  getAttribute(name: string) {
    return this.attributes.get(name) || null;
  }
  appendChild(child: MockElement) {
    this.children.push(child);
  }
  remove() {
    this.removeCalled = true;
  }
}

describe("SeatView", (): void => {
  let mockElement: MockElement;
  let mockTitleElement: MockElement;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal("document", {
      createElementNS: vi.fn((ns: string, tag: string) => {
        const el = new MockElement();
        el.setAttribute("data-tag", tag);
        if (tag === "rect") {
          mockElement = el;
        } else if (tag === "title") {
          mockTitleElement = el;
        }
        return el;
      }),
    });
  });

  it("should initialize correct properties", (): void => {
    const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
    const view = new SeatView(seat);

    expect(document.createElementNS).toHaveBeenCalledWith(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    expect(view.getElement()).toBeDefined();

    const element = view.getElement() as unknown as MockElement;
    expect(element.getAttribute("data-seat-id")).toBe("s1");
  });

  it("should render seat element and title correctly", (): void => {
    const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
    const view = new SeatView(seat);

    view.render();

    const element = view.getElement() as unknown as MockElement;
    expect(element.getAttribute("class")).toBe("seat");
    expect(element.getAttribute("x")).toBe("10");
    expect(element.getAttribute("y")).toBe("20");
    expect(element.getAttribute("width")).toBe("18");
    expect(element.getAttribute("height")).toBe("18");
    expect(element.getAttribute("rx")).toBe("3");
    expect(element.getAttribute("ry")).toBe("3");

    // Check innerHTML cleared
    expect(element.innerHTML).toBe("");

    // Check title element
    expect(document.createElementNS).toHaveBeenCalledWith(
      "http://www.w3.org/2000/svg",
      "title",
    );
    expect(mockTitleElement.textContent).toBe("Fila A, Asiento 1");
    expect(element.children).toContain(mockTitleElement);
  });

  it("should set selected state correctly", (): void => {
    const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
    const view = new SeatView(seat);

    view.setSelected(true);
    const element = view.getElement() as unknown as MockElement;
    expect(element.classList.contains("selected")).toBe(true);

    view.setSelected(false);
    expect(element.classList.contains("selected")).toBe(false);
  });

  it("should set group color correctly", (): void => {
    const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
    const view = new SeatView(seat);

    view.setGroupColor("#FF0000");
    const element = view.getElement() as unknown as MockElement;
    expect(element.style.fill).toBe("#FF0000");
    expect(element.classList.contains("assigned")).toBe(true);

    view.setGroupColor(null);
    expect(element.style.fill).toBe("");
    expect(element.classList.contains("assigned")).toBe(false);
  });

  it("should remove element from DOM on destroy", (): void => {
    const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
    const view = new SeatView(seat);

    const element = view.getElement() as unknown as MockElement;
    expect(element.removeCalled).toBe(false);

    view.destroy();
    expect(element.removeCalled).toBe(true);
  });
});
