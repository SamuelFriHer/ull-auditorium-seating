import { AppState } from "../models/AppState";
import { EventBus } from "../events/EventBus";
import { VenueSerializer } from "../models/VenueSerializer";
import type { VenueJSON } from "../types";

/**
 * Controller responsible for exporting and importing venue layout configurations.
 */
export class ExportController {
  private readonly state: AppState;
  private readonly eventBus: EventBus;

  /**
   * Initializes a new ExportController instance and binds event listeners.
   *
   * @param state - The global application state.
   * @param eventBus - The shared application event bus.
   */
  constructor(state: AppState, eventBus: EventBus) {
    this.state = state;
    this.eventBus = eventBus;

    this.subscribeToEvents();
  }

  /**
   * Exports the current venue layout to a JSON file downloaded in the browser.
   */
  public exportToJSON(): void {
    const filename = `${this.state.venue.id}_layout.json`;
    VenueSerializer.download(this.state.venue, filename, this.state);
  }

  /**
   * Imports a venue layout from a JSON file, updates state, and notifies listeners.
   *
   * @param file - The JSON layout configuration file.
   * @returns A promise that resolves when the import completes.
   */
  public importFromJSON(file: File): Promise<void> {
    return new Promise((resolve, reject): void => {
      const reader = new FileReader();

      reader.onload = (): void => {
        try {
          const text = reader.result as string;
          const data = JSON.parse(text) as VenueJSON;

          if (!data || typeof data !== "object") {
            throw new Error("Invalid layout JSON format");
          }

          const newVenue = VenueSerializer.fromJSON(data);
          this.state.venue = newVenue;
          this.state.selectedSeatIds = [];
          this.state.activeGroupId = null;

          this.eventBus.emit("venue:loaded", { venue: data });
          this.eventBus.emit("venue:updated");
          resolve();
        } catch (error) {
          if (error instanceof SyntaxError) {
            reject(new Error(`Failed to parse JSON file: ${error.message}`));
          } else if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error("An unknown error occurred during JSON import."));
          }
        }
      };

      reader.onerror = (): void => {
        reject(reader.error || new Error("Failed to read layout file."));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Subscribes the controller to related events on the shared event bus.
   */
  private subscribeToEvents(): void {
    this.eventBus.on("venue:export", (): void => {
      this.exportToJSON();
    });

    this.eventBus.on("venue:import", (payload: { file: File }): void => {
      this.importFromJSON(payload.file).catch((error: Error): void => {
        console.error("Failed to import venue layout:", error);
      });
    });
  }
}
