import type { AppState } from "../models/AppState";
import type { EventBus } from "../events/EventBus";
import { ToolbarView } from "./ToolbarView";
import { VenueView } from "./VenueView";
import { GroupPanelView } from "./GroupPanelView";
import { FooterView } from "./FooterView";
import type { IView } from "./IView";

/**
 * Root application view coordinating and mounting all main sub-views.
 */
export class AppView implements IView {
  private readonly container: HTMLElement;
  private readonly state: AppState;
  private readonly eventBus: EventBus;

  private toolbarView: ToolbarView | undefined;
  private venueView: VenueView | undefined;
  private groupPanelView: GroupPanelView | undefined;
  private footerView: FooterView | undefined;

  /**
   * Initializes a new AppView instance.
   *
   * @param container - Root DOM element container.
   * @param state - The global application state.
   * @param eventBus - The application event bus.
   */
  constructor(container: HTMLElement, state: AppState, eventBus: EventBus) {
    this.container = container;
    this.state = state;
    this.eventBus = eventBus;
  }

  /**
   * Renders the base app layout and instantiates/renders all sub-views.
   */
  public render(): void {
    this.container.innerHTML = `
      <div class="app-layout">
        <header class="app-header" id="app-toolbar-container"></header>
        <div class="app-main-content">
          <div class="app-venue-container" id="app-venue-container"></div>
          <aside class="app-sidebar" id="app-sidebar-container"></aside>
        </div>
        <footer class="app-footer" id="app-footer-container"></footer>
      </div>
    `;

    const toolbarContainer = this.container.querySelector(
      "#app-toolbar-container",
    ) as HTMLElement;
    const venueContainer = this.container.querySelector(
      "#app-venue-container",
    ) as HTMLElement;
    const sidebarContainer = this.container.querySelector(
      "#app-sidebar-container",
    ) as HTMLElement;
    const footerContainer = this.container.querySelector(
      "#app-footer-container",
    ) as HTMLElement;

    this.toolbarView = new ToolbarView(
      toolbarContainer,
      this.state,
      this.eventBus,
    );
    this.venueView = new VenueView(venueContainer, this.state, this.eventBus);
    this.groupPanelView = new GroupPanelView(
      sidebarContainer,
      this.state,
      this.eventBus,
    );
    this.footerView = new FooterView(footerContainer);

    this.toolbarView.render();
    this.venueView.render();
    this.groupPanelView.render();
    this.footerView.render();
  }

  /**
   * Returns the instantiated ToolbarView, if rendered.
   */
  public getToolbarView(): ToolbarView | null {
    return this.toolbarView || null;
  }

  /**
   * Returns the instantiated VenueView, if rendered.
   */
  public getVenueView(): VenueView | null {
    return this.venueView || null;
  }

  /**
   * Returns the instantiated GroupPanelView, if rendered.
   */
  public getGroupPanelView(): GroupPanelView | null {
    return this.groupPanelView || null;
  }

  /**
   * Cleans up all child view nodes and empties the main container.
   */
  public destroy(): void {
    this.toolbarView?.destroy();
    this.venueView?.destroy();
    this.groupPanelView?.destroy();
    this.footerView?.destroy();

    this.toolbarView = undefined;
    this.venueView = undefined;
    this.groupPanelView = undefined;
    this.footerView = undefined;

    this.container.innerHTML = "";
  }
}
