import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppController } from "../../src/controllers/AppController";
import { SelectionController } from "../../src/controllers/SelectionController";
import { GroupController } from "../../src/controllers/GroupController";
import { ExportController } from "../../src/controllers/ExportController";

vi.mock("../../src/views/AppView", () => {
  return {
    AppView: class {
      public render = vi.fn();
      public destroy = vi.fn();
    },
  };
});

describe("AppController - ZOMBIES", (): void => {
  let container: HTMLElement;
  let controller: AppController;

  beforeEach((): void => {
    vi.clearAllMocks();
    container = {} as HTMLElement;
    controller = new AppController(container);
  });

  describe("Z - Zero", (): void => {
    it("should not render the view prior to initialization", (): void => {
      const internalObj = controller as unknown as {
        appView: { render: () => void };
      };
      const renderSpy = vi.spyOn(internalObj.appView, "render");
      expect(renderSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("O - One", (): void => {
    it("should trigger view rendering exactly once when init is called", (): void => {
      const internalObj = controller as unknown as {
        appView: { render: () => void };
      };
      const renderSpy = vi.spyOn(internalObj.appView, "render");

      controller.init();

      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("M - Many", (): void => {
    it("should construct and initialize all internal sub-controllers correctly", (): void => {
      const internalObj = controller as unknown as {
        selectionController: SelectionController;
        groupController: GroupController;
        exportController: ExportController;
      };
      expect(internalObj.selectionController).toBeInstanceOf(
        SelectionController,
      );
      expect(internalObj.groupController).toBeInstanceOf(GroupController);
      expect(internalObj.exportController).toBeInstanceOf(ExportController);
    });
  });

  describe("B - Boundary", (): void => {
    it("should verify existence with empty layout container boundary", (): void => {
      expect(controller).toBeDefined();
    });
  });

  describe("I - Interface", (): void => {
    it("should expose init method as public controller interface", (): void => {
      expect(typeof controller.init).toBe("function");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should handle multiple initialization calls safely without throwing errors", (): void => {
      expect((): void => {
        controller.init();
        controller.init();
      }).not.toThrow();
    });
  });

  describe("S - Simple", (): void => {
    it("should verify basic state initialization", (): void => {
      const internalObj = controller as unknown as {
        eventBus: unknown;
        state: unknown;
      };
      expect(internalObj.eventBus).toBeDefined();
      expect(internalObj.state).toBeDefined();
    });
  });
});
