import { describe, it, expect, beforeEach } from "vitest";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { SeatGroup } from "../../src/models/SeatGroup";
import { OrlaGuestGroup } from "../../src/models/OrlaGuestGroup";
import { SeatColorResolver } from "../../src/utils/SeatColorResolver";
import { SectionType, SelectionMode } from "../../src/types";

describe("SeatColorResolver - ZOMBIES", (): void => {
  let venue: Venue;
  let state: AppState;

  beforeEach((): void => {
    const seats: Seat[] = [
      new Seat("stalls-A-1", "A", 1, "stalls", 10, 20),
      new Seat("stalls-A-2", "A", 2, "stalls", 20, 20),
      new Seat("stalls-B-1", "B", 1, "stalls", 10, 40),
      new Seat("stalls-B-2", "B", 2, "stalls", 20, 40),
      new Seat("stalls-B-3", "B", 3, "stalls", 30, 40),
      new Seat("stalls-B-4", "B", 4, "stalls", 40, 40),
    ];
    const section: Section = new Section(
      "stalls",
      "Patio",
      SectionType.STALLS,
      seats,
    );
    venue = new Venue("v1", "Venue", [section]);
    state = new AppState(venue, [], null, SelectionMode.NONE, 0);
  });

  describe("Z - Zero", (): void => {
    it("should return null when there are zero seat groups in standard mode", (): void => {
      state.isOrlaMode = false;
      venue.groups = [];
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      const seat: Seat = venue.sections[0].seats[2];
      expect(resolver.resolveColor(seat)).toBeNull();
    });

    it("should return null for students/guests when counts and groups are zero in Orla mode", (): void => {
      state.isOrlaMode = true;
      state.orlaStudentCount = 0;
      state.orlaGuestGroups = [];
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      const seat: Seat = venue.sections[0].seats[2];
      expect(resolver.resolveColor(seat)).toBeNull();
    });
  });

  describe("O - One", (): void => {
    it("should resolve color for one seat in a group in standard mode", (): void => {
      state.isOrlaMode = false;
      venue.groups = [
        new SeatGroup("g1", "Group 1", "#FF0000", ["stalls-B-1"]),
      ];
      venue.sections[0].seats[2].groupId = "g1";
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      const seat: Seat = venue.sections[0].seats[2];
      expect(resolver.resolveColor(seat)).toBe("#FF0000");
    });

    it("should resolve color for one seat in a guest group in Orla mode", (): void => {
      state.isOrlaMode = true;
      state.orlaStudentCount = 0;
      state.orlaGuestGroups = [
        new OrlaGuestGroup("gg1", "Group 1", ["stalls-B-2"], false),
      ];
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      const seat: Seat = venue.sections[0].seats[3];
      expect(resolver.resolveColor(seat)).toBe("var(--color-orla-guest-free)");
    });
  });

  describe("M - Many", (): void => {
    it("should resolve colors correctly when there are multiple groups", (): void => {
      state.isOrlaMode = false;
      venue.groups = [
        new SeatGroup("g1", "Group 1", "#FF0000", ["stalls-B-1"]),
        new SeatGroup("g2", "Group 2", "#00FF00", ["stalls-B-2"]),
      ];
      venue.sections[0].seats[2].groupId = "g1";
      venue.sections[0].seats[3].groupId = "g2";
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      expect(resolver.resolveColor(venue.sections[0].seats[2])).toBe("#FF0000");
      expect(resolver.resolveColor(venue.sections[0].seats[3])).toBe("#00FF00");
    });
  });

  describe("B - Boundary", (): void => {
    it("should return correct css variables for teacher, student, free, and occupied colors", (): void => {
      state.isOrlaMode = true;
      state.orlaStudentCount = 2;
      state.orlaGuestGroups = [
        new OrlaGuestGroup("gg1", "Group 1", ["stalls-B-2"], false),
        new OrlaGuestGroup("gg2", "Group 2", ["stalls-B-4"], true),
      ];
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      expect(resolver.resolveColor(venue.sections[0].seats[0])).toBe(
        "var(--color-orla-teacher)",
      );
      expect(resolver.resolveColor(venue.sections[0].seats[2])).toBe(
        "var(--color-orla-student)",
      );
      expect(resolver.resolveColor(venue.sections[0].seats[3])).toBe(
        "var(--color-orla-guest-free)",
      );
      expect(resolver.resolveColor(venue.sections[0].seats[5])).toBe(
        "var(--color-orla-guest-occupied)",
      );
    });
  });

  describe("I - Interface", (): void => {
    it("should have a resolveColor public method returning string or null", (): void => {
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      expect(typeof resolver.resolveColor).toBe("function");
      const seat: Seat = venue.sections[0].seats[0];
      const result: string | null = resolver.resolveColor(seat);
      expect(result === null || typeof result === "string").toBe(true);
    });
  });

  describe("E - Exceptional", (): void => {
    it("should return null when seat group ID is not defined in the venue groups", (): void => {
      state.isOrlaMode = false;
      venue.sections[0].seats[2].groupId = "non-existent";
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      const seat: Seat = venue.sections[0].seats[2];
      expect(resolver.resolveColor(seat)).toBeNull();
    });

    it("should return null for an unallocated seat in Orla mode", (): void => {
      state.isOrlaMode = true;
      state.orlaStudentCount = 0;
      state.orlaGuestGroups = [];
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      const seat: Seat = venue.sections[0].seats[2];
      expect(resolver.resolveColor(seat)).toBeNull();
    });
  });

  describe("S - Simple", (): void => {
    it("should resolve teacher seat color in Orla mode", (): void => {
      state.isOrlaMode = true;
      const resolver: SeatColorResolver = new SeatColorResolver(state);
      const seat: Seat = venue.sections[0].seats[0];
      expect(resolver.resolveColor(seat)).toBe("var(--color-orla-teacher)");
    });
  });
});
