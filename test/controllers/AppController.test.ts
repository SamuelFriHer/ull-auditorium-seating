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

describe("AppController", (): void => {
  let container: HTMLElement;
  let controller: AppController;

  beforeEach((): void => {
    vi.clearAllMocks();
    container = {} as HTMLElement;
    controller = new AppController(container);
  });

  it("should initialize and construct internal MVC structures", (): void => {
    expect(controller).toBeDefined();

    const internalObj = controller as unknown as {
      eventBus: unknown;
      state: unknown;
      selectionController: SelectionController;
      groupController: GroupController;
      exportController: ExportController;
      appView: unknown;
    };
    expect(internalObj.eventBus).toBeDefined();
    expect(internalObj.state).toBeDefined();
    expect(internalObj.selectionController).toBeInstanceOf(SelectionController);
    expect(internalObj.groupController).toBeInstanceOf(GroupController);
    expect(internalObj.exportController).toBeInstanceOf(ExportController);
    expect(internalObj.appView).toBeDefined();
  });

  it("should trigger view rendering when init is called", (): void => {
    const internalObj = controller as unknown as {
      appView: { render: () => void };
    };
    const renderSpy = vi.spyOn(internalObj.appView, "render");

    controller.init();

    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it("should call bindEvents during initialization", (): void => {
    // Spy on the prototype before instantiating a new controller
    // because bindEvents is called in the constructor.
    const bindEventsSpy = vi.spyOn(
      AppController.prototype as any,
      "bindEvents",
    );

    // Create a new instance to trigger the constructor
    new AppController({} as HTMLElement);

    expect(bindEventsSpy).toHaveBeenCalledTimes(1);
  });

  it("should not throw when bindEvents is called", (): void => {
    // Currently, bindEvents is empty and serves as a placeholder.
    // This test ensures it doesn't crash if called manually, setting up a skeleton for future logic.
    expect(() => {
      (controller as any).bindEvents();
    }).not.toThrow();
  });
});
