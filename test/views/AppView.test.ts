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

/**
 * Simple mock of a DOM element to allow the View to be instantiated
 * and render to run without a full DOM environment like JSDOM.
 */
class MockElement {
  innerHTML: string = "";
  querySelector = vi.fn().mockImplementation(() => new MockElement());
}

describe("AppView", (): void => {
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

  it("should return null for child views before render", (): void => {
    expect(view.getToolbarView()).toBeNull();
    expect(view.getVenueView()).toBeNull();
    expect(view.getGroupPanelView()).toBeNull();
  });

  it("should render child views and expose them via getters", (): void => {
    view.render();

    // Verify DOM structure
    expect(container.innerHTML).toContain("app-layout");
    expect(container.innerHTML).toContain("app-toolbar-container");
    expect(container.innerHTML).toContain("app-venue-container");
    expect(container.innerHTML).toContain("app-sidebar-container");
    expect(container.innerHTML).toContain("app-footer-container");

    // Verify getters
    const toolbar = view.getToolbarView();
    const venue = view.getVenueView();
    const groupPanel = view.getGroupPanelView();

    expect(toolbar).not.toBeNull();
    expect(venue).not.toBeNull();
    expect(groupPanel).not.toBeNull();

    // Verify render was called on children
    expect(toolbar?.render).toHaveBeenCalled();
    expect(venue?.render).toHaveBeenCalled();
    expect(groupPanel?.render).toHaveBeenCalled();
    // (FooterView render is also called but not exposed via getter in AppView,
    // so we can't easily assert on it without importing the mock class itself,
    // but verifying the structure and other views is sufficient for coverage).
  });

  it("should call destroy on child views and clear container", (): void => {
    view.render();

    const toolbar = view.getToolbarView();
    const venue = view.getVenueView();
    const groupPanel = view.getGroupPanelView();

    view.destroy();

    expect(toolbar?.destroy).toHaveBeenCalled();
    expect(venue?.destroy).toHaveBeenCalled();
    expect(groupPanel?.destroy).toHaveBeenCalled();

    expect(container.innerHTML).toBe("");
    expect(view.getToolbarView()).toBeNull();
    expect(view.getVenueView()).toBeNull();
    expect(view.getGroupPanelView()).toBeNull();
  });
});
