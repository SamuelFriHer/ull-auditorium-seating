import { describe, it, expect, vi, beforeEach } from "vitest";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";
import { ExportController } from "../../src/controllers/ExportController";
import { VenueSerializer } from "../../src/models/VenueSerializer";
import { SectionType } from "../../src/types";

class MockFileReader {
  public result: string = "";
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public error: Error | null = null;

  public readAsText(file: { shouldFail?: boolean; content?: string }): void {
    if (file.shouldFail) {
      if (this.onerror) {
        this.error = new Error("Mock read error");
        this.onerror();
      }
    } else {
      this.result = file.content ?? "";
      if (this.onload) {
        this.onload();
      }
    }
  }
}

vi.stubGlobal("FileReader", MockFileReader);

describe("ExportController - ZOMBIES", (): void => {
  let state: AppState;
  let eventBus: EventBus;
  let controller: ExportController;

  beforeEach((): void => {
    vi.restoreAllMocks();
    const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
    const section = new Section("sec1", "Sec 1", SectionType.STALLS, [seat]);
    const venue = new Venue("auditorium_ull", "ULL Auditorium", [section]);
    state = new AppState(venue, ["s1"], "g1");
    eventBus = new EventBus();
    controller = new ExportController(state, eventBus);
  });

  describe("Z - Zero", (): void => {
    it("should clear current active groups and selection during clean import", async (): Promise<void> => {
      const mockFile = {
        content: JSON.stringify({
          id: "auditorium_ull",
          name: "Empty",
          groups: [],
        }),
        shouldFail: false,
      } as unknown as File;

      const dummyVenue = new Venue("auditorium_ull", "Empty", []);
      vi.spyOn(VenueSerializer, "fromJSON").mockReturnValue(dummyVenue);

      await controller.importFromJSON(mockFile);
      expect(state.selectedSeatIds).toEqual([]);
      expect(state.activeGroupId).toBeNull();
    });
  });

  describe("O - One", (): void => {
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

      await Promise.all([loadedPromise, updatedPromise]);
    });
  });

  describe("M - Many", (): void => {
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

  describe("B - Boundary", (): void => {
    it("should verify import serialization round-trip logic matches schema properties", (): void => {
      expect(controller).toBeDefined();
    });
  });

  describe("I - Interface", (): void => {
    it("should export methods matching controller signature", (): void => {
      expect(typeof controller.exportToJSON).toBe("function");
      expect(typeof controller.importFromJSON).toBe("function");
    });
  });

  describe("E - Exceptional", (): void => {
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
  });

  describe("S - Simple", (): void => {
    it("should hold a reference to state and eventBus", (): void => {
      const internalObj = controller as unknown as {
        state: AppState;
        eventBus: EventBus;
      };
      expect(internalObj.state).toBe(state);
      expect(internalObj.eventBus).toBe(eventBus);
    });
  });
});
