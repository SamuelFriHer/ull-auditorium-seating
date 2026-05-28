import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppView } from "../../src/views/AppView";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";
import { ToolbarView } from "../../src/views/layout/ToolbarView";
import { VenueView } from "../../src/views/venue/VenueView";
import { GroupPanelView } from "../../src/views/groups/GroupPanelView";

const mockToolbar = {
  render: vi.fn(),
  destroy: vi.fn(),
};

const mockVenue = {
  render: vi.fn(),
  destroy: vi.fn(),
};

const mockGroupPanel = {
  render: vi.fn(),
  destroy: vi.fn(),
};

const mockFooter = {
  render: vi.fn(),
  destroy: vi.fn(),
};

vi.mock("../../src/views/layout/ToolbarView", () => ({
  ToolbarView: vi.fn().mockImplementation(
    class {
      public render = mockToolbar.render;
      public destroy = mockToolbar.destroy;
    },
  ),
}));

vi.mock("../../src/views/venue/VenueView", () => ({
  VenueView: vi.fn().mockImplementation(
    class {
      public render = mockVenue.render;
      public destroy = mockVenue.destroy;
    },
  ),
}));

vi.mock("../../src/views/groups/GroupPanelView", () => ({
  GroupPanelView: vi.fn().mockImplementation(
    class {
      public render = mockGroupPanel.render;
      public destroy = mockGroupPanel.destroy;
    },
  ),
}));

vi.mock("../../src/views/layout/FooterView", () => ({
  FooterView: vi.fn().mockImplementation(
    class {
      public render = mockFooter.render;
      public destroy = mockFooter.destroy;
    },
  ),
}));

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
    it("should reset container innerHTML to empty on destroy", (): void => {
      view.render();
      view.destroy();
      expect(container.innerHTML).toBe("");
    });
  });

  describe("O - One", (): void => {
    it("should instantiate child views on render", (): void => {
      view.render();
      expect(ToolbarView).toHaveBeenCalled();
      expect(VenueView).toHaveBeenCalled();
      expect(GroupPanelView).toHaveBeenCalled();
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

      expect(mockToolbar.render).toHaveBeenCalled();
      expect(mockVenue.render).toHaveBeenCalled();
      expect(mockGroupPanel.render).toHaveBeenCalled();
    });
  });

  describe("I - Interface", (): void => {
    it("should export required methods of view structure", (): void => {
      expect(typeof view.render).toBe("function");
      expect(typeof view.destroy).toBe("function");
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
      view.destroy();
      expect(mockToolbar.destroy).toHaveBeenCalled();
      expect(mockVenue.destroy).toHaveBeenCalled();
      expect(mockGroupPanel.destroy).toHaveBeenCalled();
    });
  });
});
