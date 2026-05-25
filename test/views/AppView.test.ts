import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppView } from "../../src/views/AppView";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";

vi.mock("../../src/views/ToolbarView", () => {
  return {
    ToolbarView: class {
      public render = vi.fn();
      public destroy = vi.fn();
    },
  };
});

vi.mock("../../src/views/VenueView", () => {
  return {
    VenueView: class {
      public render = vi.fn();
      public destroy = vi.fn();
    },
  };
});

vi.mock("../../src/views/GroupPanelView", () => {
  return {
    GroupPanelView: class {
      public render = vi.fn();
      public destroy = vi.fn();
    },
  };
});

vi.mock("../../src/views/FooterView", () => {
  return {
    FooterView: class {
      public render = vi.fn();
      public destroy = vi.fn();
    },
  };
});

class MockElement {
  public innerHTML: string = "";
  public querySelector = vi
    .fn()
    .mockImplementation((): MockElement => new MockElement());
}

describe("AppView - ZOMBIES", (): void => {
  let container: HTMLElement;
  let state: AppState;
  let eventBus: EventBus;
  let view: AppView;

  beforeEach((): void => {
    vi.clearAllMocks();
    container = new MockElement() as unknown as HTMLElement;
    state = new AppState();
    eventBus = new EventBus();
    view = new AppView(container, state, eventBus);
  });

  describe("Z - Zero", (): void => {
    it("should return null for all child views before initial render", (): void => {
      expect(view.getToolbarView()).toBeNull();
      expect(view.getVenueView()).toBeNull();
      expect(view.getGroupPanelView()).toBeNull();
    });

    it("should reset container innerHTML to empty on destroy", (): void => {
      view.render();
      view.destroy();
      expect(container.innerHTML).toBe("");
    });
  });

  describe("O - One", (): void => {
    it("should instantiate child views on render", (): void => {
      view.render();
      expect(view.getToolbarView()).not.toBeNull();
      expect(view.getVenueView()).not.toBeNull();
      expect(view.getGroupPanelView()).not.toBeNull();
    });
  });

  describe("M - Many", (): void => {
    it("should inject layout divs and render child views", (): void => {
      view.render();
      expect(container.innerHTML).toContain("app-layout");
      expect(container.innerHTML).toContain("app-toolbar-container");
      expect(container.innerHTML).toContain("app-venue-container");
      expect(container.innerHTML).toContain("app-sidebar-container");
      expect(container.innerHTML).toContain("app-footer-container");

      expect(view.getToolbarView()?.render).toHaveBeenCalled();
      expect(view.getVenueView()?.render).toHaveBeenCalled();
      expect(view.getGroupPanelView()?.render).toHaveBeenCalled();
    });
  });

  describe("B - Boundary", (): void => {
    it("should clean references to null after calling destroy", (): void => {
      view.render();
      view.destroy();
      expect(view.getToolbarView()).toBeNull();
      expect(view.getVenueView()).toBeNull();
      expect(view.getGroupPanelView()).toBeNull();
    });
  });

  describe("I - Interface", (): void => {
    it("should export required methods and getters of view structure", (): void => {
      expect(typeof view.render).toBe("function");
      expect(typeof view.destroy).toBe("function");
      expect(typeof view.getToolbarView).toBe("function");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should handle calling destroy on an unrendered view safely", (): void => {
      expect((): void => {
        view.destroy();
      }).not.toThrow();
    });
  });

  describe("S - Simple", (): void => {
    it("should call destroy on instantiated child views", (): void => {
      view.render();
      const toolbar = view.getToolbarView();
      const venue = view.getVenueView();
      const groupPanel = view.getGroupPanelView();

      view.destroy();
      expect(toolbar?.destroy).toHaveBeenCalled();
      expect(venue?.destroy).toHaveBeenCalled();
      expect(groupPanel?.destroy).toHaveBeenCalled();
    });
  });
});
