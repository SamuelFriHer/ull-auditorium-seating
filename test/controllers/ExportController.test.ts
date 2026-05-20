import { describe, it, expect, vi, beforeEach } from "vitest";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";
import { ExportController } from "../../src/controllers/ExportController";
import { VenueSerializer } from "../../src/models/VenueSerializer";
import { SectionType } from "../../src/types";

// Mock FileReader for the Node.js vitest environment
class MockFileReader {
  public result: string = "";
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public error: Error | null = null;

  public readAsText(file: any): void {
    if (file.shouldFail) {
      if (this.onerror) {
        this.error = new Error("Mock read error");
        this.onerror();
      }
    } else {
      this.result = file.content;
      if (this.onload) {
        this.onload();
      }
    }
  }
}

vi.stubGlobal("FileReader", MockFileReader);

describe("ExportController", (): void => {
  let state: AppState;
  let eventBus: EventBus;
  let controller: ExportController;

  beforeEach((): void => {
    vi.restoreAllMocks();
    const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
    const section = new Section("sec1", "Sec 1", SectionType.PATIO_BUTACAS, [
      seat,
    ]);
    const venue = new Venue("auditorium_ull", "ULL Auditorium", [section]);
    state = new AppState(venue, ["s1"], "g1");
    eventBus = new EventBus();
    controller = new ExportController(state, eventBus);
  });

  it("should export layout to JSON with correct filename format", (): void => {
    const downloadSpy = vi
      .spyOn(VenueSerializer, "download")
      .mockImplementation((): void => {});
    controller.exportToJSON();
    expect(downloadSpy).toHaveBeenCalledWith(
      state.venue,
      "auditorium_ull_layout.json",
    );
  });

  it("should import layout from JSON and update the application state", async (): Promise<void> => {
    const importData = {
      id: "auditorium_ull",
      name: "ULL Auditorium",
      groups: [],
    };
    const mockFile = {
      content: JSON.stringify(importData),
      shouldFail: false,
    } as unknown as File;

    const dummyVenue = new Venue("auditorium_ull", "Imported Venue", []);
    const fromJSONSpy = vi
      .spyOn(VenueSerializer, "fromJSON")
      .mockReturnValue(dummyVenue);

    const loadedPromise = new Promise<void>((resolve): void => {
      eventBus.on("venue:loaded", (payload): void => {
        expect(payload.venue).toEqual(importData);
        resolve();
      });
    });

    const updatedPromise = new Promise<void>((resolve): void => {
      eventBus.on("venue:updated", (): void => {
        resolve();
      });
    });

    await controller.importFromJSON(mockFile);

    expect(fromJSONSpy).toHaveBeenCalledWith(importData);
    expect(state.venue).toBe(dummyVenue);
    expect(state.selectedSeatIds).toEqual([]);
    expect(state.activeGroupId).toBeNull();

    await Promise.all([loadedPromise, updatedPromise]);
  });

  it("should handle invalid JSON files during import", async (): Promise<void> => {
    const mockFile = {
      content: "invalid json content",
      shouldFail: false,
    } as unknown as File;

    await expect(controller.importFromJSON(mockFile)).rejects.toThrow(
      "Failed to parse JSON file",
    );
  });

  it("should handle invalid format object during import", async (): Promise<void> => {
    const mockFile = {
      content: "null",
      shouldFail: false,
    } as unknown as File;

    await expect(controller.importFromJSON(mockFile)).rejects.toThrow(
      "Invalid layout JSON format",
    );
  });

  it("should handle file reading errors during import", async (): Promise<void> => {
    const mockFile = {
      content: "",
      shouldFail: true,
    } as unknown as File;

    await expect(controller.importFromJSON(mockFile)).rejects.toThrow(
      "Mock read error",
    );
  });

  it("should trigger exportToJSON when venue:export is emitted", (): void => {
    const exportSpy = vi
      .spyOn(controller, "exportToJSON")
      .mockImplementation((): void => {});
    eventBus.emit("venue:export");
    expect(exportSpy).toHaveBeenCalled();
  });

  it("should trigger importFromJSON when venue:import is emitted", async (): Promise<void> => {
    const mockFile = {
      content: '{"id":"auditorium_ull","groups":[]}',
      shouldFail: false,
    } as unknown as File;

    const importSpy = vi
      .spyOn(controller, "importFromJSON")
      .mockResolvedValue(undefined);
    eventBus.emit("venue:import", { file: mockFile });
    expect(importSpy).toHaveBeenCalledWith(mockFile);
  });
});
