import { AppState } from "../models/AppState";
import { EventBus } from "../events/EventBus";
import { SelectionController } from "./SelectionController";
import { GroupController } from "./GroupController";
import { ExportController } from "./ExportController";
import { AppView } from "../views/AppView";
import { VenueDefinitionLoader } from "../utils/VenueDefinitionLoader";

/**
 * Main application controller orchestrating the MVC components.
 */
export class AppController {
  private readonly state: AppState;
  private readonly eventBus: EventBus;
  private readonly selectionController: SelectionController;
  private readonly groupController: GroupController;
  private readonly exportController: ExportController;
  private readonly appView: AppView;

  /**
   * Initializes a new AppController instance.
   *
   * @param container - Root DOM element container for the application.
   */
  constructor(container: HTMLElement) {
    this.eventBus = new EventBus();
    const venue = VenueDefinitionLoader.loadAuditorium();
    this.state = new AppState(venue);

    this.selectionController = new SelectionController(
      this.state,
      this.eventBus,
    );
    this.groupController = new GroupController(this.state, this.eventBus);
    this.exportController = new ExportController(this.state, this.eventBus);
    this.appView = new AppView(container, this.state, this.eventBus);

    this.bindEvents();
  }

  /**
   * Starts the application by rendering the root view.
   */
  public init(): void {
    this.appView.render();
  }

  /**
   * Binds global application event listeners.
   */
  private bindEvents(): void {
    // Sub-controllers handle event bus events directly.
    // This hook is kept for future central orchestrations.
  }
}
