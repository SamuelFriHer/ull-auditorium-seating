import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { VenueSerializer } from "../../src/models/VenueSerializer";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { SeatGroup } from "../../src/models/SeatGroup";
import { GraduationGuestGroup } from "../../src/models/GraduationGuestGroup";
import { GraduationAllocator } from "../../src/utils/GraduationAllocator";
import { VenueDefinitionLoader } from "../../src/utils/VenueDefinitionLoader";
import type { VenueJSON, SeatGroupJSON } from "../../src/types";

/**
 * Sets up global stubs for browser APIs used in download functionality.
 */
function setupDownloadStubs(mockLink: {
  href: string;
  download: string;
  click: () => void;
}): {
  mockDocument: Document;
  mockCreate: () => string;
  mockRevoke: (url: string) => void;
} {
  const mockDocument = {
    createElement: vi.fn().mockReturnValue(mockLink),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  } as unknown as Document;

  const mockCreate: () => string = vi.fn().mockReturnValue("blob:mock-url");
  const mockRevoke: (url: string) => void = vi.fn();

  vi.stubGlobal("document", mockDocument);
  vi.stubGlobal("URL", {
    createObjectURL: mockCreate,
    revokeObjectURL: mockRevoke,
  });

  return { mockDocument, mockCreate, mockRevoke };
}

describe("VenueSerializer - ZOMBIES", (): void => {
  beforeEach((): void => {
    vi.restoreAllMocks();
  });

  afterEach((): void => {
    vi.unstubAllGlobals();
  });

  describe("Z - Zero", (): void => {
    it("should serialize a venue with zero groups to JSON with empty groups array", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      venue.groups.length = 0;
      const json: VenueJSON = VenueSerializer.toJSON(venue);
      expect(json.groups).toEqual([]);
      expect(json.id).toBe("auditorium_ull");
    });

    it("should serialize zero groups in graduation mode when students and teachers counts are zero", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      venue.groups.length = 0;
      const state: AppState = new AppState(venue);
      state.isGraduationMode = true;
      state.graduationStudentCount = 0;
      state.graduationGuestGroups = [];

      vi.spyOn(GraduationAllocator, "getTeacherSeatIds").mockReturnValue([]);
      vi.spyOn(GraduationAllocator, "getStudentSeatIds").mockReturnValue([]);

      const json: VenueJSON = VenueSerializer.toJSON(venue, state);
      expect(json.groups).toEqual([]);
    });

    it("should restore a venue with zero groups from JSON correctly", (): void => {
      const payload: VenueJSON = {
        id: "auditorium_ull",
        name: "ULL Auditorium",
        groups: [],
      };
      const venue: Venue = VenueSerializer.fromJSON(payload);
      expect(venue.id).toBe("auditorium_ull");
      expect(venue.groups).toHaveLength(0);
    });
  });

  describe("O - One", (): void => {
    it("should serialize one seat group in standard mode", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      venue.groups.length = 0;
      const seatId: string = venue.sections[0].seats[0].id;
      const group: SeatGroup = new SeatGroup("vip", "VIP Area", "#FFD700");
      venue.groups.push(group);
      venue.assignSeatsToGroup([seatId], "vip");

      const json: VenueJSON = VenueSerializer.toJSON(venue);
      expect(json.groups).toHaveLength(1);
      expect(json.groups[0].id).toBe("vip");
      expect(json.groups[0].label).toBe("VIP Area");
      expect(json.groups[0].color).toBe("#FFD700");
      expect(json.groups[0].seatIds).toEqual([seatId]);
    });

    it("should deserialize one seat group in standard mode", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      const seatId: string = venue.sections[0].seats[0].id;
      const payload: VenueJSON = {
        id: "auditorium_ull",
        name: "ULL Auditorium",
        groups: [
          {
            id: "vip",
            label: "VIP Area",
            color: "#FFD700",
            seatIds: [seatId],
          },
        ],
      };
      const deserialized: Venue = VenueSerializer.fromJSON(payload);
      expect(deserialized.groups).toHaveLength(1);
      expect(deserialized.groups[0].id).toBe("vip");
      expect(deserialized.getSeat(seatId)?.groupId).toBe("vip");
    });

    it("should serialize exactly one teacher group in graduation mode", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      const state: AppState = new AppState(venue);
      state.isGraduationMode = true;
      state.graduationStudentCount = 0;

      vi.spyOn(GraduationAllocator, "getTeacherSeatIds").mockReturnValue([
        "stalls-1-1",
      ]);
      vi.spyOn(GraduationAllocator, "getStudentSeatIds").mockReturnValue([]);

      const json: VenueJSON = VenueSerializer.toJSON(venue, state);
      expect(json.groups).toHaveLength(1);
      expect(json.groups[0].id).toBe("graduation_teachers");
      expect(json.groups[0].label).toBe("Docentes");
      expect(json.groups[0].color).toBe("#10B981");
      expect(json.groups[0].seatIds).toEqual(["stalls-1-1"]);
    });

    it("should serialize exactly one student group in graduation mode", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      const state: AppState = new AppState(venue);
      state.isGraduationMode = true;
      state.graduationStudentCount = 2;

      vi.spyOn(GraduationAllocator, "getTeacherSeatIds").mockReturnValue([]);
      vi.spyOn(GraduationAllocator, "getStudentSeatIds").mockReturnValue([
        "stalls-2-1",
        "stalls-2-2",
      ]);

      const json: VenueJSON = VenueSerializer.toJSON(venue, state);
      expect(json.groups).toHaveLength(1);
      expect(json.groups[0].id).toBe("graduation_students");
      expect(json.groups[0].label).toBe("Estudiantes");
      expect(json.groups[0].color).toBe("#F59E0B");
      expect(json.groups[0].seatIds).toEqual(["stalls-2-1", "stalls-2-2"]);
    });

    it("should serialize one unoccupied guest group in graduation mode", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      const state: AppState = new AppState(venue);
      state.isGraduationMode = true;
      state.graduationStudentCount = 0;

      const guestGroup: GraduationGuestGroup = new GraduationGuestGroup(
        "g-student1",
        "Invitados de Alumno 1",
        ["stalls-3-1"],
        false,
      );
      state.graduationGuestGroups = [guestGroup];

      vi.spyOn(GraduationAllocator, "getTeacherSeatIds").mockReturnValue([]);
      vi.spyOn(GraduationAllocator, "getStudentSeatIds").mockReturnValue([]);

      const json: VenueJSON = VenueSerializer.toJSON(venue, state);
      expect(json.groups).toHaveLength(1);
      expect(json.groups[0].id).toBe("g-student1");
      expect(json.groups[0].label).toBe("Invitados de Alumno 1");
      expect(json.groups[0].color).toBe("#3B82F6");
      expect(json.groups[0].seatIds).toEqual(["stalls-3-1"]);
    });

    it("should serialize one occupied guest group in graduation mode", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      const state: AppState = new AppState(venue);
      state.isGraduationMode = true;
      state.graduationStudentCount = 0;

      const guestGroup: GraduationGuestGroup = new GraduationGuestGroup(
        "g-student1",
        "Invitados de Alumno 1",
        ["stalls-3-1"],
        true,
      );
      state.graduationGuestGroups = [guestGroup];

      vi.spyOn(GraduationAllocator, "getTeacherSeatIds").mockReturnValue([]);
      vi.spyOn(GraduationAllocator, "getStudentSeatIds").mockReturnValue([]);

      const json: VenueJSON = VenueSerializer.toJSON(venue, state);
      expect(json.groups).toHaveLength(1);
      expect(json.groups[0].color).toBe("#EF4444");
    });
  });

  describe("M - Many", (): void => {
    it("should serialize and deserialize multiple groups in standard mode", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      venue.groups.length = 0;
      const seatId1: string = venue.sections[0].seats[0].id;
      const seatId2: string = venue.sections[0].seats[1].id;
      const group1: SeatGroup = new SeatGroup("vip", "VIP Area", "#FFD700");
      const group2: SeatGroup = new SeatGroup(
        "general",
        "General Area",
        "#C0C0C0",
      );
      venue.groups.push(group1, group2);
      venue.assignSeatsToGroup([seatId1], "vip");
      venue.assignSeatsToGroup([seatId2], "general");

      const json: VenueJSON = VenueSerializer.toJSON(venue);
      const deserialized: Venue = VenueSerializer.fromJSON(json);

      expect(deserialized.groups).toHaveLength(2);
      expect(deserialized.getSeat(seatId1)?.groupId).toBe("vip");
      expect(deserialized.getSeat(seatId2)?.groupId).toBe("general");
    });

    it("should serialize multiple teachers, students, and guest groups in graduation mode", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      const state: AppState = new AppState(venue);
      state.isGraduationMode = true;

      vi.spyOn(GraduationAllocator, "getTeacherSeatIds").mockReturnValue([
        "stalls-1-1",
      ]);
      vi.spyOn(GraduationAllocator, "getStudentSeatIds").mockReturnValue([
        "stalls-2-1",
      ]);

      const g1: GraduationGuestGroup = new GraduationGuestGroup(
        "g1",
        "Guests 1",
        ["stalls-3-1"],
        false,
      );
      const g2: GraduationGuestGroup = new GraduationGuestGroup(
        "g2",
        "Guests 2",
        ["stalls-4-1"],
        true,
      );
      state.graduationGuestGroups = [g1, g2];

      const json: VenueJSON = VenueSerializer.toJSON(venue, state);
      const ids: string[] = json.groups.map((g: SeatGroupJSON): string => g.id);

      expect(ids).toContain("graduation_teachers");
      expect(ids).toContain("graduation_students");
      expect(ids).toContain("g1");
      expect(ids).toContain("g2");
    });
  });

  describe("B - Boundary", (): void => {
    it("should throw an error when deserializing a venue with an unsupported ID", (): void => {
      const payload: VenueJSON = {
        id: "invalid_id",
        name: "Invalid Venue",
        groups: [],
      };

      expect((): void => {
        VenueSerializer.fromJSON(payload);
      }).toThrowError("Unsupported venue ID: invalid_id");
    });

    it("should skip serialization of guest groups that have zero seat IDs assigned", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      const state: AppState = new AppState(venue);
      state.isGraduationMode = true;

      const guestGroup: GraduationGuestGroup = new GraduationGuestGroup(
        "g-empty",
        "Empty Guests",
        [],
        false,
      );
      state.graduationGuestGroups = [guestGroup];

      vi.spyOn(GraduationAllocator, "getTeacherSeatIds").mockReturnValue([]);
      vi.spyOn(GraduationAllocator, "getStudentSeatIds").mockReturnValue([]);

      const json: VenueJSON = VenueSerializer.toJSON(venue, state);
      expect(json.groups).toHaveLength(0);
    });
  });

  describe("I - Interface", (): void => {
    it("should conform to the expected VenueJSON and SeatGroupJSON schemas", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      venue.groups.length = 0;
      const seatId: string = venue.sections[0].seats[0].id;
      const group: SeatGroup = new SeatGroup("vip", "VIP Area", "#FFD700");
      venue.groups.push(group);
      venue.assignSeatsToGroup([seatId], "vip");

      const json: VenueJSON = VenueSerializer.toJSON(venue);
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("name");
      expect(json).toHaveProperty("groups");
      expect(json.groups[0]).toHaveProperty("id");
      expect(json.groups[0]).toHaveProperty("label");
      expect(json.groups[0]).toHaveProperty("color");
      expect(json.groups[0]).toHaveProperty("seatIds");
    });

    it("should return a reconstructed Venue instance from deserialization", (): void => {
      const payload: VenueJSON = {
        id: "auditorium_ull",
        name: "ULL Auditorium",
        groups: [],
      };
      const venue: Venue = VenueSerializer.fromJSON(payload);
      expect(venue).toBeInstanceOf(Venue);
    });
  });

  describe("S - Simple / Scenario", (): void => {
    it("should perform standard exporting and importing symmetrically for a loaded layout", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      venue.groups.length = 0;
      const seatId1: string = venue.sections[0].seats[0].id;
      const seatId2: string = venue.sections[0].seats[1].id;
      const testGroup: SeatGroup = new SeatGroup("tg", "Test Group", "#FF0000");
      venue.groups.push(testGroup);
      venue.assignSeatsToGroup([seatId1, seatId2], "tg");

      const json: VenueJSON = VenueSerializer.toJSON(venue);
      const deserialized: Venue = VenueSerializer.fromJSON(json);

      expect(deserialized.id).toBe(venue.id);
      expect(deserialized.name).toBe(venue.name);
      expect(deserialized.groups).toHaveLength(1);
      expect(deserialized.getSeat(seatId1)?.groupId).toBe("tg");
      expect(deserialized.getSeat(seatId2)?.groupId).toBe("tg");
    });

    it("should trigger browser download of the venue JSON payload", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      venue.groups.length = 0;

      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      const stubs = setupDownloadStubs(mockLink);

      VenueSerializer.download(venue, "test-filename.json");

      expect(stubs.mockCreate).toHaveBeenCalled();
      expect(stubs.mockDocument.createElement).toHaveBeenCalledWith("a");
      expect(mockLink.href).toBe("blob:mock-url");
      expect(mockLink.download).toBe("test-filename.json");
      expect(stubs.mockDocument.body.appendChild).toHaveBeenCalledWith(
        mockLink,
      );
      expect(mockLink.click).toHaveBeenCalled();
      expect(stubs.mockDocument.body.removeChild).toHaveBeenCalledWith(
        mockLink,
      );
      expect(stubs.mockRevoke).toHaveBeenCalledWith("blob:mock-url");
    });
  });
});
