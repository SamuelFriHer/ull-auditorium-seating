import { describe, it, expect, vi, beforeEach } from "vitest";
import { GroupPanelView } from "../../../src/views/groups/GroupPanelView";
import { SeatGroup } from "../../../src/models/SeatGroup";
import { AppState } from "../../../src/models/AppState";
import { Venue } from "../../../src/models/Venue";
import { EventBus } from "../../../src/events/EventBus";

// Keep track of created GroupItemView mock elements to assert on them in tests
let mockGroupItemElements: MockElement[] = [];

vi.mock("../../../src/views/groups/GroupItemView", () => {
  return {
    GroupItemView: class MockGroupItemView {
      private readonly element: MockElement;
      constructor(group: SeatGroup, state: AppState) {
        this.element = new MockElement(`group-item-${group.id}`);
        this.element.classList.add("group-item");
        this.element.setAttribute("data-group-id", group.id);

        const info: MockElement = new MockElement(`info-${group.id}`);
        info.classList.add("group-info");
        this.element.appendChild(info);

        if (state && state.activeGroupId === group.id) {
          this.element.classList.add("active");
          info.setAttribute("aria-pressed", "true");
        }

        mockGroupItemElements.push(this.element);
      }
      public getElement(): MockElement {
        return this.element;
      }
    },
  };
});

/**
 * Mock representation of an HTML element for testing DOM operations in Node.
 */
class MockElement {
  public id: string;
  public className: string = "";
  public value: string = "";
  public classList: {
    classes: Set<string>;
    add: (c: string) => void;
    remove: (c: string) => void;
    contains: (c: string) => boolean;
  };
  public attributes: Record<string, string> = {};
  public children: MockElement[] = [];
  public parent: MockElement | null = null;
  public eventListeners: Record<string, ((event?: unknown) => void)[]> = {};

  constructor(id: string = "") {
    this.id = id;
    const classes: Set<string> = new Set<string>();
    this.classList = {
      classes,
      add: (c: string): void => {
        classes.add(c);
        this.className = Array.from(classes).join(" ");
      },
      remove: (c: string): void => {
        classes.delete(c);
        this.className = Array.from(classes).join(" ");
      },
      contains: (c: string): boolean => classes.has(c),
    };
  }

  public get innerHTML(): string {
    return "";
  }

  public set innerHTML(val: string) {
    if (val === "") {
      this.children = [];
    }
  }

  public appendChild(child: MockElement): void {
    child.parent = this;
    this.children.push(child);
  }

  public setAttribute(name: string, value: string): void {
    this.attributes[name] = value;
  }

  public getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  public addEventListener(
    event: string,
    callback: (event?: unknown) => void,
  ): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  public trigger(event: string, eventData?: unknown): void {
    if (this.eventListeners[event]) {
      for (const cb of this.eventListeners[event]) {
        cb(eventData);
      }
    }
  }

  public querySelector(selector: string): MockElement | null {
    if (selector.startsWith("#")) {
      const targetId: string = selector.slice(1);
      return this.findChildById(targetId) || this.createAndAppend(targetId);
    }
    if (selector.startsWith(".")) {
      const targetClass: string = selector.slice(1);
      return this.findChildByClass(targetClass);
    }
    return null;
  }

  private findChildById(id: string): MockElement | null {
    const search = (node: MockElement): MockElement | null => {
      if (node.id === id) return node;
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
      return null;
    };
    return search(this);
  }

  private findChildByClass(className: string): MockElement | null {
    const search = (node: MockElement): MockElement | null => {
      if (node.classList.contains(className)) return node;
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
      return null;
    };
    return search(this);
  }

  private createAndAppend(id: string): MockElement {
    const newElem: MockElement = new MockElement(id);
    this.appendChild(newElem);
    return newElem;
  }
}

describe("GroupPanelView - ZOMBIES", (): void => {
  let container: MockElement;
  let state: AppState;
  let eventBus: EventBus;
  let venue: Venue;
  let view: GroupPanelView;

  beforeEach((): void => {
    vi.clearAllMocks();
    mockGroupItemElements = [];
    container = new MockElement("panel-container");
    venue = new Venue("venue-123", "Test Auditorium", []);
    state = new AppState(venue);
    eventBus = new EventBus();
    view = new GroupPanelView(
      container as unknown as HTMLElement,
      state,
      eventBus,
    );
  });

  describe("Z - Zero", (): void => {
    it("should initialize and render with empty state message when no groups exist", (): void => {
      const innerHTMLSpy = vi.spyOn(container, "innerHTML", "set");
      view.render();

      expect(innerHTMLSpy).toHaveBeenCalled();
      const lastHtmlSet: string =
        innerHTMLSpy.mock.calls[innerHTMLSpy.mock.calls.length - 1][0];
      expect(lastHtmlSet).toContain("Gestión de Grupos");
      expect(lastHtmlSet).toContain("No hay grupos creados.");
    });
  });

  describe("O - One", (): void => {
    it("should render a single seat group by instantiating and appending GroupItemView", (): void => {
      const group: SeatGroup = new SeatGroup("grp-1", "Vip A", "#112233", []);
      venue.groups.push(group);

      const innerHTMLSpy = vi.spyOn(container, "innerHTML", "set");
      view.render();

      const lastHtmlSet: string =
        innerHTMLSpy.mock.calls[innerHTMLSpy.mock.calls.length - 1][0];
      expect(lastHtmlSet).not.toContain("No hay grupos creados.");

      const listContainer: MockElement | null =
        container.querySelector("#groups-list");
      expect(listContainer).toBeDefined();
      expect(listContainer?.children.length).toBe(1);

      const itemElem: MockElement = listContainer?.children[0] as MockElement;
      expect(itemElem.id).toBe("group-item-grp-1");
      expect(itemElem.classList.contains("group-item")).toBe(true);
    });

    it("should mark single group element active if activeGroupId matches its ID on render", (): void => {
      const group: SeatGroup = new SeatGroup("grp-1", "Vip A", "#112233", []);
      venue.groups.push(group);
      state.activeGroupId = "grp-1";

      view.render();
      view.setActiveGroup("grp-1");

      const itemElem: MockElement | undefined = mockGroupItemElements.find(
        (el: MockElement) => el.getAttribute("data-group-id") === "grp-1",
      );
      expect(itemElem).toBeDefined();
      expect(itemElem?.classList.contains("active")).toBe(true);

      const infoElem: MockElement | null =
        itemElem?.querySelector(".group-info") ?? null;
      expect(infoElem).toBeDefined();
      expect(infoElem?.getAttribute("aria-pressed")).toBe("true");
    });
  });

  describe("M - Many", (): void => {
    it("should render all groups when multiple exist in the state", (): void => {
      const g1: SeatGroup = new SeatGroup("grp-1", "Grp 1", "#112233", []);
      const g2: SeatGroup = new SeatGroup("grp-2", "Grp 2", "#445566", []);
      venue.groups.push(g1, g2);

      view.render();

      const listContainer: MockElement | null =
        container.querySelector("#groups-list");
      expect(listContainer?.children.length).toBe(2);
      expect(listContainer?.children[0].id).toBe("group-item-grp-1");
      expect(listContainer?.children[1].id).toBe("group-item-grp-2");
    });

    it("should update classList active and aria-pressed attributes when switching active group", (): void => {
      const g1: SeatGroup = new SeatGroup("grp-1", "Grp 1", "#112233", []);
      const g2: SeatGroup = new SeatGroup("grp-2", "Grp 2", "#445566", []);
      venue.groups.push(g1, g2);

      view.render();

      const itemElem1: MockElement | undefined = mockGroupItemElements.find(
        (el: MockElement) => el.getAttribute("data-group-id") === "grp-1",
      );
      const itemElem2: MockElement | undefined = mockGroupItemElements.find(
        (el: MockElement) => el.getAttribute("data-group-id") === "grp-2",
      );

      expect(itemElem1).toBeDefined();
      expect(itemElem2).toBeDefined();

      // Switch active group to grp-1
      view.setActiveGroup("grp-1");
      expect(itemElem1?.classList.contains("active")).toBe(true);
      expect(
        itemElem1?.querySelector(".group-info")?.getAttribute("aria-pressed"),
      ).toBe("true");
      expect(itemElem2?.classList.contains("active")).toBe(false);

      // Switch active group to grp-2
      view.setActiveGroup("grp-2");
      expect(itemElem1?.classList.contains("active")).toBe(false);
      expect(
        itemElem1?.querySelector(".group-info")?.getAttribute("aria-pressed"),
      ).toBe("false");
      expect(itemElem2?.classList.contains("active")).toBe(true);
      expect(
        itemElem2?.querySelector(".group-info")?.getAttribute("aria-pressed"),
      ).toBe("true");
    });
  });

  describe("B - Boundary", (): void => {
    it("should clean up event listeners and empty container when destroy is called", (): void => {
      const eventBusOffSpy = vi.spyOn(eventBus, "off");
      const innerHTMLSpy = vi.spyOn(container, "innerHTML", "set");

      view.destroy();

      expect(eventBusOffSpy).toHaveBeenCalledWith(
        "venue:updated",
        expect.any(Function),
      );
      expect(eventBusOffSpy).toHaveBeenCalledWith(
        "venue:loaded",
        expect.any(Function),
      );
      expect(eventBusOffSpy).toHaveBeenCalledWith(
        "group:active-change",
        expect.any(Function),
      );
      expect(innerHTMLSpy).toHaveBeenCalledWith("");
    });
  });

  describe("I - Interface", (): void => {
    it("should implement interface functions of IView", (): void => {
      expect(typeof view.render).toBe("function");
      expect(typeof view.destroy).toBe("function");
      expect(typeof view.renderGroup).toBe("function");
      expect(typeof view.setActiveGroup).toBe("function");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should not throw error when setActiveGroup receives non-existent group ID", (): void => {
      const g1: SeatGroup = new SeatGroup("grp-1", "Grp 1", "#112233", []);
      venue.groups.push(g1);
      view.render();

      expect((): void => {
        view.setActiveGroup("non-existent-id");
      }).not.toThrow();
    });

    it("should not emit group:create event when submit is triggered with empty/whitespace group name", (): void => {
      view.render();
      let eventPayload: unknown = null;
      eventBus.on("group:create", (payload: unknown): void => {
        eventPayload = payload;
      });

      const nameInput: MockElement | null =
        container.querySelector("#group-name-input");
      if (nameInput) {
        nameInput.value = "   ";
      }

      const form: MockElement | null =
        container.querySelector("#create-group-form");
      const preventDefaultMock = vi.fn();
      form?.trigger("submit", { preventDefault: preventDefaultMock });

      expect(preventDefaultMock).toHaveBeenCalled();
      expect(eventPayload).toBeNull();
    });
  });

  describe("S - Simple", (): void => {
    it("should emit group:create with correct name and color when form is submitted with valid inputs", (): void => {
      view.render();
      let eventPayload: { label: string; color?: string } | null = null;
      eventBus.on(
        "group:create",
        (payload: { label: string; color?: string }): void => {
          eventPayload = payload;
        },
      );

      const nameInput: MockElement | null =
        container.querySelector("#group-name-input");
      const colorInput: MockElement | null =
        container.querySelector("#group-color-input");

      if (nameInput) {
        nameInput.value = "Special Group";
      }
      if (colorInput) {
        colorInput.value = "#ffa500";
      }

      const form: MockElement | null =
        container.querySelector("#create-group-form");
      const preventDefaultMock = vi.fn();
      form?.trigger("submit", { preventDefault: preventDefaultMock });

      expect(preventDefaultMock).toHaveBeenCalled();
      expect(eventPayload).toEqual({
        label: "Special Group",
        color: "#ffa500",
      });
    });

    it("should trigger render when eventBus emits venue:updated or venue:loaded", (): void => {
      const renderSpy = vi.spyOn(view, "render");

      eventBus.emit("venue:updated");
      expect(renderSpy).toHaveBeenCalledTimes(1);

      eventBus.emit("venue:loaded", {
        venue: {
          id: "venue-123",
          name: "Test Auditorium",
          groups: [],
        },
      });
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it("should call setActiveGroup when eventBus emits group:active-change", (): void => {
      const activeChangeSpy = vi.spyOn(view, "setActiveGroup");

      eventBus.emit("group:active-change", { id: "grp-123" });
      expect(activeChangeSpy).toHaveBeenCalledWith("grp-123");
    });
  });
});
