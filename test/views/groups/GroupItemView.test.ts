import { describe, it, expect, vi, beforeEach } from "vitest";
import { GroupItemView } from "../../../src/views/groups/GroupItemView";
import { SeatGroup } from "../../../src/models/SeatGroup";
import { AppState } from "../../../src/models/AppState";
import { Venue } from "../../../src/models/Venue";
import { EventBus } from "../../../src/events/EventBus";

/**
 * Mock representation of an HTML Element for DOM operations in Node.
 */
class MockElement {
  public className: string = "";
  public textContent: string = "";
  public attributes: Record<string, string> = {};
  public style: { borderLeft?: string } = {};
  public disabled: boolean = false;
  private internalInnerHTML: string = "";

  public classList = {
    classes: new Set<string>(),
    add: (name: string): void => {
      this.classList.classes.add(name);
    },
    remove: (name: string): void => {
      this.classList.classes.delete(name);
    },
    contains: (name: string): boolean => {
      return this.classList.classes.has(name);
    },
  };

  public eventListeners: Record<string, ((event?: unknown) => void)[]> = {};
  public children: Record<string, MockElement> = {};

  constructor(isChild: boolean = false) {
    if (!isChild) {
      this.children[".group-label"] = new MockElement(true);
      this.children[".group-count"] = new MockElement(true);
      this.children[".group-info"] = new MockElement(true);
      this.children[".btn-assign-seats"] = new MockElement(true);
      this.children[".btn-delete-group"] = new MockElement(true);
    }
  }

  public get innerHTML(): string {
    return this.internalInnerHTML;
  }

  public set innerHTML(val: string) {
    this.internalInnerHTML = val;
    this.parseInnerHTML(val);
  }

  /**
   * Sets attribute on mock element.
   */
  public setAttribute(name: string, value: string): void {
    this.attributes[name] = value;
  }

  /**
   * Gets attribute from mock element.
   */
  public getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  /**
   * Queries child elements by selector matching pre-populated children.
   */
  public querySelector(selector: string): MockElement | null {
    return this.children[selector] ?? null;
  }

  /**
   * Registers a mock event listener callback.
   */
  public addEventListener(
    event: string,
    callback: (event?: unknown) => void,
  ): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Triggers the mock event callbacks.
   */
  public trigger(event: string, eventData?: unknown): void {
    if (this.eventListeners[event]) {
      for (const cb of this.eventListeners[event]) {
        cb(eventData);
      }
    }
  }

  /**
   * Parses basic innerHTML templates to populate child attributes.
   */
  private parseInnerHTML(html: string): void {
    const assignBtnBlock = html.match(
      /<button class="btn-assign-seats"([^>]*)>/,
    );
    if (assignBtnBlock) {
      const attributesStr = assignBtnBlock[1];
      const assignBtn = this.querySelector(".btn-assign-seats");
      if (assignBtn) {
        const titleMatch = attributesStr.match(/title="([^"]*)"/);
        if (titleMatch) {
          assignBtn.setAttribute("title", titleMatch[1]);
        }
        assignBtn.disabled = attributesStr.includes("disabled");
      }
    }

    const infoBlock = html.match(/<div class="group-info"([^>]*)>/);
    if (infoBlock) {
      const attributesStr = infoBlock[1];
      const infoBtn = this.querySelector(".group-info");
      if (infoBtn) {
        const ariaPressedMatch = attributesStr.match(/aria-pressed="([^"]*)"/);
        if (ariaPressedMatch) {
          infoBtn.setAttribute("aria-pressed", ariaPressedMatch[1]);
        }
      }
    }
  }
}

describe("GroupItemView - ZOMBIES", (): void => {
  let mockVenue: Venue;
  let mockState: AppState;
  let mockEventBus: EventBus;

  beforeEach((): void => {
    vi.clearAllMocks();
    mockVenue = new Venue("venue-1", "Test Venue", []);
    mockState = new AppState(mockVenue);
    mockEventBus = new EventBus();

    globalThis.document = {
      createElement: vi.fn().mockImplementation((tag: string): MockElement => {
        if (tag === "div") {
          return new MockElement();
        }
        throw new Error(`Unexpected tag: ${tag}`);
      }),
    } as unknown as Document;

    globalThis.window = {
      confirm: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  describe("Z - Zero", (): void => {
    it("should initialize view properly when group and state selection are empty", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", []);
      mockState.selectedSeatIds = [];
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;

      expect(element.className).toBe("group-item");
      expect(element.getAttribute("data-group-id")).toBe("group-1");
      expect(element.classList.contains("active")).toBe(false);
      expect(element.style.borderLeft).toBe("4px solid #FF0000");

      const labelSpan = element.querySelector(".group-label");
      expect(labelSpan?.textContent).toBe("VIP");

      const assignBtn = element.querySelector(".btn-assign-seats");
      expect(assignBtn?.getAttribute("title")).toBe(
        "Selecciona butacas primero",
      );
    });
  });

  describe("O - One", (): void => {
    it("should display correct content when one seat is selected", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", [
        "seat-1",
      ]);
      mockState.selectedSeatIds = ["seat-2"];
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;

      const assignBtn = element.querySelector(".btn-assign-seats");
      expect(assignBtn?.getAttribute("title")).toBe("Asignar seleccionados");
    });

    it("should mark element active if activeGroupId matches group ID", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", [
        "seat-1",
      ]);
      mockState.activeGroupId = "group-1";
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;

      expect(element.classList.contains("active")).toBe(true);
    });
  });

  describe("M - Many", (): void => {
    it("should toggle active group when clicking info area", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", [
        "seat-1",
      ]);
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;
      const infoArea = element.querySelector(".group-info");

      let activeChangePayload: { id: string | null } | null = null;
      mockEventBus.on(
        "group:active-change",
        (payload: { id: string | null }): void => {
          activeChangePayload = payload;
        },
      );

      infoArea?.trigger("click");
      expect(activeChangePayload).toEqual({ id: "group-1" });
    });

    it("should deactivate group if active group is clicked again", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", [
        "seat-1",
      ]);
      mockState.activeGroupId = "group-1";
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;
      const infoArea = element.querySelector(".group-info");

      let activeChangePayload: { id: string | null } | null = null;
      mockEventBus.on(
        "group:active-change",
        (payload: { id: string | null }): void => {
          activeChangePayload = payload;
        },
      );

      infoArea?.trigger("click");
      expect(activeChangePayload).toEqual({ id: null });
    });

    it("should toggle active group via Enter or Space keydown events", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", [
        "seat-1",
      ]);
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;
      const infoArea = element.querySelector(".group-info");

      let activeChangeCalls = 0;
      mockEventBus.on("group:active-change", (): void => {
        activeChangeCalls++;
      });

      const preventDefault = vi.fn();
      infoArea?.trigger("keydown", { key: "Enter", preventDefault });
      infoArea?.trigger("keydown", { key: " ", preventDefault });

      expect(activeChangeCalls).toBe(2);
      expect(preventDefault).toHaveBeenCalledTimes(2);
    });

    it("should emit group:assign with selected seats when assign button is clicked", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", [
        "seat-1",
      ]);
      mockState.selectedSeatIds = ["seat-2", "seat-3"];
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;
      const assignBtn = element.querySelector(".btn-assign-seats");

      let assignPayload: { seatIds: string[]; groupId: string } | null = null;
      mockEventBus.on(
        "group:assign",
        (payload: { seatIds: string[]; groupId: string }): void => {
          assignPayload = payload;
        },
      );

      const stopPropagation = vi.fn();
      assignBtn?.trigger("click", { stopPropagation });

      expect(stopPropagation).toHaveBeenCalled();
      expect(assignPayload).toEqual({
        seatIds: ["seat-2", "seat-3"],
        groupId: "group-1",
      });
    });
  });

  describe("B - Boundary", (): void => {
    it("should handle initialization with many seats assigned to the group", (): void => {
      const seatIds = Array.from({ length: 50 }, (_, i) => `seat-${i}`);
      const group: SeatGroup = new SeatGroup(
        "group-1",
        "VIP",
        "#FF0000",
        seatIds,
      );
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;

      // GroupItemView generates HTML using innerHTML which contains this.group.seatIds.length
      expect(element.innerHTML).toContain("50 butacas");
    });
  });

  describe("I - Interface", (): void => {
    it("should expose getElement method returning the correct element", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", []);
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      expect(view.getElement()).toBeDefined();
    });
  });

  describe("E - Exceptional", (): void => {
    it("should ignore keydown events with unsupported keys on info area", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", []);
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;
      const infoArea = element.querySelector(".group-info");

      let activeChangeEmitted = false;
      mockEventBus.on("group:active-change", (): void => {
        activeChangeEmitted = true;
      });

      const preventDefault = vi.fn();
      infoArea?.trigger("keydown", { key: "Escape", preventDefault });

      expect(activeChangeEmitted).toBe(false);
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it("should not delete group if confirmation dialog is rejected", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", []);
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;
      const deleteBtn = element.querySelector(".btn-delete-group");

      vi.spyOn(window, "confirm").mockReturnValue(false);

      let deleteEmitted = false;
      mockEventBus.on("group:delete", (): void => {
        deleteEmitted = true;
      });

      const stopPropagation = vi.fn();
      deleteBtn?.trigger("click", { stopPropagation });

      expect(stopPropagation).toHaveBeenCalled();
      expect(window.confirm).toHaveBeenCalled();
      expect(deleteEmitted).toBe(false);
    });
  });

  describe("S - Simple", (): void => {
    it("should emit group:delete when delete button is clicked and confirmed", (): void => {
      const group: SeatGroup = new SeatGroup("group-1", "VIP", "#FF0000", []);
      const view: GroupItemView = new GroupItemView(
        group,
        mockState,
        mockEventBus,
      );
      const element = view.getElement() as unknown as MockElement;
      const deleteBtn = element.querySelector(".btn-delete-group");

      vi.spyOn(window, "confirm").mockReturnValue(true);

      let deletedGroupId: string | null = null;
      mockEventBus.on("group:delete", (payload: { id: string }): void => {
        deletedGroupId = payload.id;
      });

      const stopPropagation = vi.fn();
      deleteBtn?.trigger("click", { stopPropagation });

      expect(stopPropagation).toHaveBeenCalled();
      expect(window.confirm).toHaveBeenCalled();
      expect(deletedGroupId).toBe("group-1");
    });
  });
});
