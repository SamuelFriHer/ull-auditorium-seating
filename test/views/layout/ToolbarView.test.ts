import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockInstance } from "vitest";
import { ToolbarView } from "../../../src/views/layout/ToolbarView";
import { AppState } from "../../../src/models/AppState";
import { EventBus } from "../../../src/events/EventBus";
import { Venue } from "../../../src/models/Venue";

/**
 * Mock representation of an HTML element for testing DOM operations in Node.
 */
class MockElement {
  public id: string;
  public classList: {
    classes: Set<string>;
    add: (className: string) => void;
    remove: (className: string) => void;
    contains: (className: string) => boolean;
  };
  public attributes: Record<string, string> = {};
  public eventListeners: Record<string, ((event?: unknown) => void)[]> = {};
  public files: File[] = [];
  public disabled: boolean = false;
  public textContent: string = "";

  private internalInnerHTML: string = "";
  private elementsMap: Record<string, MockElement> = {};
  private floorButtons: MockElement[] = [];

  constructor(id: string = "", classes: string[] = []) {
    this.id = id;
    const classesSet: Set<string> = new Set<string>(classes);
    this.classList = {
      classes: classesSet,
      add: (className: string): void => {
        classesSet.add(className);
      },
      remove: (className: string): void => {
        classesSet.delete(className);
      },
      contains: (className: string): boolean => {
        return classesSet.has(className);
      },
    };
  }

  public get innerHTML(): string {
    return this.internalInnerHTML;
  }

  public set innerHTML(val: string) {
    this.internalInnerHTML = val;
    this.elementsMap = {};
    this.floorButtons = [];
    this.parseInnerHTML(val);
  }

  public addEventListener(
    eventType: string,
    callback: (event?: unknown) => void,
  ): void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(callback);
  }

  public trigger(eventType: string, event?: unknown): void {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].forEach(
        (callback: (e?: unknown) => void): void => {
          callback(event);
        },
      );
    }
  }

  public setAttribute(name: string, value: string): void {
    this.attributes[name] = value;
  }

  public getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  public querySelector(selector: string): MockElement | null {
    if (selector.startsWith("#")) {
      const id: string = selector.slice(1);
      if (!this.elementsMap[id]) {
        this.elementsMap[id] = new MockElement(id);
      }
      return this.elementsMap[id];
    }
    return null;
  }

  public querySelectorAll(selector: string): MockElement[] {
    if (selector === ".btn-floor") {
      if (this.floorButtons.length === 0) {
        this.floorButtons = [
          new MockElement("", ["btn-floor"]),
          new MockElement("", ["btn-floor"]),
          new MockElement("", ["btn-floor"]),
        ];
        this.floorButtons[0].setAttribute("data-floor", "0");
        this.floorButtons[1].setAttribute("data-floor", "1");
        this.floorButtons[2].setAttribute("data-floor", "2");
      }
      return this.floorButtons;
    }
    return [];
  }

  private parseInnerHTML(html: string): void {
    this.parseToggleGraduation(html);
    this.parseClearSelection(html);
    this.parseUnassignSeats(html);
    this.parseFloorButtons(html);
  }

  private parseToggleGraduation(html: string): void {
    const toggleGraduation: MockElement | null = this.querySelector(
      "#btn-toggle-graduation",
    );
    if (toggleGraduation) {
      const match: RegExpMatchArray | null = html.match(
        /class="btn-toggle-graduation\s*([^"]*)"/,
      );
      if (match) {
        const classesStr: string = match[1];
        if (classesStr.includes("active")) {
          toggleGraduation.classList.add("active");
          toggleGraduation.setAttribute("aria-pressed", "true");
        } else {
          toggleGraduation.classList.remove("active");
          toggleGraduation.setAttribute("aria-pressed", "false");
        }
      }
    }
  }

  private parseClearSelection(html: string): void {
    const clearSelection: MockElement | null = this.querySelector(
      "#btn-clear-selection",
    );
    if (clearSelection) {
      const match: RegExpMatchArray | null = html.match(
        /<button id="btn-clear-selection"[^>]*>/,
      );
      if (match) {
        const tag: string = match[0];
        clearSelection.disabled = tag.includes("disabled");
      }
      const textMatch: RegExpMatchArray | null = html.match(
        /Limpiar Selección \((\d+)\)/,
      );
      if (textMatch) {
        clearSelection.textContent = `Limpiar Selección (${textMatch[1]})`;
      }
    }
  }

  private parseUnassignSeats(html: string): void {
    const unassignSeats: MockElement | null = this.querySelector(
      "#btn-unassign-seats",
    );
    if (unassignSeats) {
      const match: RegExpMatchArray | null = html.match(
        /<button id="btn-unassign-seats"[^>]*>/,
      );
      if (match) {
        const tag: string = match[0];
        unassignSeats.disabled = tag.includes("disabled");
      }
    }
  }

  private parseFloorButtons(html: string): void {
    const floorButtons: MockElement[] = this.querySelectorAll(".btn-floor");
    floorButtons.forEach((btn: MockElement, idx: number): void => {
      const regex: RegExp = new RegExp(
        `<button class="btn-floor\\s+([^"]*)"\\s+data-floor="${idx}"`,
      );
      const match: RegExpMatchArray | null = html.match(regex);
      if (match) {
        const classesStr: string = match[1];
        if (classesStr.includes("active")) {
          btn.classList.add("active");
          btn.setAttribute("aria-pressed", "true");
        } else {
          btn.classList.remove("active");
          btn.setAttribute("aria-pressed", "false");
        }
      }
    });
  }
}

describe("ToolbarView - ZOMBIES", (): void => {
  let containerElement: MockElement;
  let venueModel: Venue;
  let appStateInstance: AppState;
  let eventBusInstance: EventBus;
  let toolbarViewInstance: ToolbarView;

  beforeEach((): void => {
    containerElement = new MockElement();
    venueModel = new Venue("venue-test", "ULL Seating", []);
    appStateInstance = new AppState(venueModel);
    eventBusInstance = new EventBus();
    toolbarViewInstance = new ToolbarView(
      containerElement as unknown as HTMLElement,
      appStateInstance,
      eventBusInstance,
    );
  });

  describe("Z - Zero", (): void => {
    it("should disable clear selection and unassign buttons when zero seats are selected", (): void => {
      appStateInstance.selectedSeatIds = [];
      appStateInstance.isGraduationMode = false;

      toolbarViewInstance.render();

      const clearButton: MockElement | null = containerElement.querySelector(
        "#btn-clear-selection",
      );
      const unassignButton: MockElement | null = containerElement.querySelector(
        "#btn-unassign-seats",
      );

      expect(clearButton).toBeDefined();
      expect(clearButton?.disabled).toBe(true);
      expect(unassignButton).toBeDefined();
      expect(unassignButton?.disabled).toBe(true);
    });

    it("should render logo and default active floor as 0", (): void => {
      appStateInstance.activeFloor = 0;

      toolbarViewInstance.render();

      const floorButtons: MockElement[] =
        containerElement.querySelectorAll(".btn-floor");
      expect(floorButtons).toHaveLength(3);
      expect(floorButtons[0].classList.contains("active")).toBe(true);
      expect(floorButtons[1].classList.contains("active")).toBe(false);
      expect(floorButtons[2].classList.contains("active")).toBe(false);
    });
  });

  describe("O - One", (): void => {
    it("should enable action buttons and update text when one seat is selected", (): void => {
      appStateInstance.selectedSeatIds = ["seat-1"];
      appStateInstance.isGraduationMode = false;

      toolbarViewInstance.render();

      const clearButton: MockElement | null = containerElement.querySelector(
        "#btn-clear-selection",
      );
      const unassignButton: MockElement | null = containerElement.querySelector(
        "#btn-unassign-seats",
      );

      expect(clearButton?.disabled).toBe(false);
      expect(clearButton?.textContent).toBe("Limpiar Selección (1)");
      expect(unassignButton?.disabled).toBe(false);
    });

    it("should emit graduation toggle event when graduation button is clicked", (): void => {
      appStateInstance.isGraduationMode = false;
      let emittedActiveState: boolean = false;
      let eventCalled: boolean = false;

      eventBusInstance.on(
        "graduation:toggle",
        (payload: { active: boolean }): void => {
          eventCalled = true;
          emittedActiveState = payload.active;
        },
      );

      toolbarViewInstance.render();
      const toggleButton: MockElement | null = containerElement.querySelector(
        "#btn-toggle-graduation",
      );
      toggleButton?.trigger("click");

      expect(eventCalled).toBe(true);
      expect(emittedActiveState).toBe(true);
    });
  });

  describe("M - Many", (): void => {
    it("should enable action buttons and show correct count when five seats are selected", (): void => {
      appStateInstance.selectedSeatIds = [
        "seat-1",
        "seat-2",
        "seat-3",
        "seat-4",
        "seat-5",
      ];
      appStateInstance.isGraduationMode = false;

      toolbarViewInstance.render();

      const clearButton: MockElement | null = containerElement.querySelector(
        "#btn-clear-selection",
      );
      expect(clearButton?.disabled).toBe(false);
      expect(clearButton?.textContent).toBe("Limpiar Selección (5)");
    });

    it("should emit selection:clear when clear button is clicked", (): void => {
      appStateInstance.selectedSeatIds = ["seat-1", "seat-2"];
      let clearEventEmitted: boolean = false;

      eventBusInstance.on("selection:clear", (): void => {
        clearEventEmitted = true;
      });

      toolbarViewInstance.render();
      const clearButton: MockElement | null = containerElement.querySelector(
        "#btn-clear-selection",
      );
      clearButton?.trigger("click");

      expect(clearEventEmitted).toBe(true);
    });

    it("should emit group:unassign with the selected seat IDs when unassign button is clicked", (): void => {
      appStateInstance.selectedSeatIds = ["seat-1", "seat-2"];
      let unassignedSeatIds: string[] = [];

      eventBusInstance.on(
        "group:unassign",
        (payload: { seatIds: string[] }): void => {
          unassignedSeatIds = payload.seatIds;
        },
      );

      toolbarViewInstance.render();
      const unassignButton: MockElement | null = containerElement.querySelector(
        "#btn-unassign-seats",
      );
      unassignButton?.trigger("click");

      expect(unassignedSeatIds).toEqual(["seat-1", "seat-2"]);
    });

    it("should emit floor:change with the clicked floor when a floor button is clicked", (): void => {
      let changedFloor: number = -1;

      eventBusInstance.on(
        "floor:change",
        (payload: { floor: number }): void => {
          changedFloor = payload.floor;
        },
      );

      toolbarViewInstance.render();
      const floorButtons: MockElement[] =
        containerElement.querySelectorAll(".btn-floor");
      floorButtons[2].trigger("click");

      expect(changedFloor).toBe(2);
    });
  });

  describe("B - Boundary", (): void => {
    it("should disable clear selection and unassign buttons when graduation mode is active, even if seats are selected", (): void => {
      appStateInstance.selectedSeatIds = ["seat-1", "seat-2"];
      appStateInstance.isGraduationMode = true;

      toolbarViewInstance.render();

      const clearButton: MockElement | null = containerElement.querySelector(
        "#btn-clear-selection",
      );
      const unassignButton: MockElement | null = containerElement.querySelector(
        "#btn-unassign-seats",
      );
      const toggleButton: MockElement | null = containerElement.querySelector(
        "#btn-toggle-graduation",
      );

      expect(clearButton?.disabled).toBe(true);
      expect(unassignButton?.disabled).toBe(true);
      expect(toggleButton?.classList.contains("active")).toBe(true);
      expect(toggleButton?.getAttribute("aria-pressed")).toBe("true");
    });

    it("should highlight the second floor button as active when activeFloor is 1", (): void => {
      appStateInstance.activeFloor = 1;

      toolbarViewInstance.render();

      const floorButtons: MockElement[] =
        containerElement.querySelectorAll(".btn-floor");
      expect(floorButtons[0].classList.contains("active")).toBe(false);
      expect(floorButtons[1].classList.contains("active")).toBe(true);
      expect(floorButtons[2].classList.contains("active")).toBe(false);
    });

    it("should highlight the third floor button as active when activeFloor is 2", (): void => {
      appStateInstance.activeFloor = 2;

      toolbarViewInstance.render();

      const floorButtons: MockElement[] =
        containerElement.querySelectorAll(".btn-floor");
      expect(floorButtons[0].classList.contains("active")).toBe(false);
      expect(floorButtons[1].classList.contains("active")).toBe(false);
      expect(floorButtons[2].classList.contains("active")).toBe(true);
    });
  });

  describe("I - Interface", (): void => {
    it("should implement interface and expose render and destroy methods", (): void => {
      expect(typeof toolbarViewInstance.render).toBe("function");
      expect(typeof toolbarViewInstance.destroy).toBe("function");
    });

    it("should subscribe to event bus on initialization and unsubscribe on destroy", (): void => {
      const onSpy: MockInstance = vi.spyOn(eventBusInstance, "on");
      const offSpy: MockInstance = vi.spyOn(eventBusInstance, "off");

      const secondaryToolbar: ToolbarView = new ToolbarView(
        containerElement as unknown as HTMLElement,
        appStateInstance,
        eventBusInstance,
      );

      expect(onSpy).toHaveBeenCalledWith("venue:updated", expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith("floor:change", expect.any(Function));

      secondaryToolbar.destroy();

      expect(offSpy).toHaveBeenCalledWith(
        "venue:updated",
        expect.any(Function),
      );
      expect(offSpy).toHaveBeenCalledWith("floor:change", expect.any(Function));
    });
  });

  describe("E - Exceptional", (): void => {
    it("should not emit venue:import if file input change is triggered without a selected file", (): void => {
      let isImportEmitted: boolean = false;

      eventBusInstance.on("venue:import", (): void => {
        isImportEmitted = true;
      });

      toolbarViewInstance.render();
      const importInput: MockElement | null = containerElement.querySelector(
        "#input-import-layout",
      );
      if (importInput) {
        importInput.files = [];
      }
      importInput?.trigger("change");

      expect(isImportEmitted).toBe(false);
    });

    it("should handle event reactive updates when venue:updated is emitted on eventBus", (): void => {
      appStateInstance.selectedSeatIds = [];
      toolbarViewInstance.render();

      const clearButtonBefore: MockElement | null =
        containerElement.querySelector("#btn-clear-selection");
      expect(clearButtonBefore?.disabled).toBe(true);

      appStateInstance.selectedSeatIds = ["seat-1"];
      eventBusInstance.emit("venue:updated", undefined);

      const clearButtonAfter: MockElement | null =
        containerElement.querySelector("#btn-clear-selection");
      expect(clearButtonAfter?.disabled).toBe(false);
    });

    it("should update state and render when floor:change is emitted from eventBus", (): void => {
      toolbarViewInstance.render();
      expect(appStateInstance.activeFloor).toBe(0);

      eventBusInstance.emit("floor:change", { floor: 1 });

      expect(appStateInstance.activeFloor).toBe(1);
      const floorButtons: MockElement[] =
        containerElement.querySelectorAll(".btn-floor");
      expect(floorButtons[1].classList.contains("active")).toBe(true);
    });
  });

  describe("S - Simple", (): void => {
    it("should clear the container innerHTML when destroy is called", (): void => {
      toolbarViewInstance.render();
      expect(containerElement.innerHTML).not.toBe("");

      toolbarViewInstance.destroy();
      expect(containerElement.innerHTML).toBe("");
    });

    it("should emit venue:export when export layout button is clicked", (): void => {
      let exportEventEmitted: boolean = false;

      eventBusInstance.on("venue:export", (): void => {
        exportEventEmitted = true;
      });

      toolbarViewInstance.render();
      const exportButton: MockElement | null =
        containerElement.querySelector("#btn-export-layout");
      exportButton?.trigger("click");

      expect(exportEventEmitted).toBe(true);
    });

    it("should emit venue:import with the file object when a file is selected for import", (): void => {
      let importedFile: File | null = null;
      const mockImportFile: File = {
        name: "test-layout.json",
      } as unknown as File;

      eventBusInstance.on("venue:import", (payload: { file: File }): void => {
        importedFile = payload.file;
      });

      toolbarViewInstance.render();
      const importInput: MockElement | null = containerElement.querySelector(
        "#input-import-layout",
      );
      if (importInput) {
        importInput.files = [mockImportFile];
      }
      importInput?.trigger("change");

      expect(importedFile).toBe(mockImportFile);
    });
  });
});
