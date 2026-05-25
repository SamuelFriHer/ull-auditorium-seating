import { describe, it, expect } from "vitest";
import { Seat } from "../../src/models/Seat";
import { SeatGroup } from "../../src/models/SeatGroup";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { VenueSerializer } from "../../src/models/VenueSerializer";
import { VenueDefinitionLoader } from "../../src/utils/VenueDefinitionLoader";
import { SectionType, SelectionMode } from "../../src/types";

describe("Models - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should return null when searching for non-existing seat", (): void => {
      const section = new Section("sec1", "Sec 1", SectionType.STALLS, []);
      expect(section.getSeat("s4")).toBeNull();
    });

    it("should empty seat group lists when unassigning all seats", (): void => {
      const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
      const group = new SeatGroup("g1", "Group 1", "#FF0000");
      const section = new Section("sec1", "Sec 1", SectionType.STALLS, [seat]);
      const venue = new Venue("v1", "Venue 1", [section], [group]);

      venue.assignSeatsToGroup(["s1"], "g1");
      venue.unassignSeats(["s1"]);

      expect(seat.groupId).toBeNull();
      expect(group.seatIds).toHaveLength(0);
    });
  });

  describe("O - One", (): void => {
    it("should correctly initialize properties for one seat", (): void => {
      const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
      expect(seat.id).toBe("s1");
      expect(seat.row).toBe("A");
      expect(seat.number).toBe(1);
      expect(seat.sectionId).toBe("sec1");
      expect(seat.x).toBe(10);
      expect(seat.y).toBe(20);
      expect(seat.groupId).toBeNull();
    });

    it("should find the single seat in a row", (): void => {
      const seat = new Seat("s3", "B", 1, "sec1", 10, 40);
      const section = new Section("sec1", "Sec 1", SectionType.STALLS, [seat]);
      expect(section.getSeatsInRow("B")).toEqual([seat]);
    });
  });

  describe("M - Many", (): void => {
    it("should retrieve multiple seats in a row", (): void => {
      const s1 = new Seat("s1", "A", 1, "sec1", 10, 20);
      const s2 = new Seat("s2", "A", 3, "sec1", 30, 20);
      const section = new Section("sec1", "Sec 1", SectionType.STALLS, [
        s1,
        s2,
      ]);
      expect(section.getSeatsInRow("A")).toEqual([s1, s2]);
    });

    it("should assign and transition seats between multiple groups", (): void => {
      const s1 = new Seat("s1", "A", 1, "sec1", 10, 20);
      const s2 = new Seat("s2", "A", 3, "sec1", 30, 20);
      const section = new Section("sec1", "Sec 1", SectionType.STALLS, [
        s1,
        s2,
      ]);
      const group1 = new SeatGroup("g1", "Group 1", "#FF0000");
      const group2 = new SeatGroup("g2", "Group 2", "#00FF00");
      const venue = new Venue("v1", "Venue 1", [section], [group1, group2]);

      venue.assignSeatsToGroup(["s1", "s2"], "g1");
      expect(s1.groupId).toBe("g1");
      expect(s2.groupId).toBe("g1");

      venue.assignSeatsToGroup(["s1"], "g2");
      expect(s1.groupId).toBe("g2");
      expect(group2.seatIds).toEqual(["s1"]);
      expect(group1.seatIds).toEqual(["s2"]);
    });
  });

  describe("B - Boundary", (): void => {
    it("should correctly serialize and deserialize a venue symmetrically", (): void => {
      const venue = VenueDefinitionLoader.loadAuditorium();
      const group = new SeatGroup("g1", "VIP", "#FFD700");
      venue.groups.push(group);

      const seatId = venue.sections[0]?.seats[0]?.id;
      expect(seatId).toBeDefined();

      if (seatId) {
        venue.assignSeatsToGroup([seatId], "g1");
        const json = VenueSerializer.toJSON(venue);
        const deserialized = VenueSerializer.fromJSON(json);

        expect(deserialized.id).toBe("auditorium_ull");
        expect(deserialized.groups).toHaveLength(1);
        expect(deserialized.getSeat(seatId)?.groupId).toBe("g1");
      }
    });
  });

  describe("I - Interface", (): void => {
    it("should define models that conform to expected signatures and structures", (): void => {
      const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
      const section = new Section("sec1", "Sec 1", SectionType.STALLS, [seat]);
      const venue = new Venue("v1", "Venue 1", [section]);

      expect(seat).toBeInstanceOf(Seat);
      expect(section).toBeInstanceOf(Section);
      expect(venue).toBeInstanceOf(Venue);
    });
  });

  describe("E - Exceptional", (): void => {
    it("should handle invalid seat query gracefully and return null", (): void => {
      const section = new Section("sec1", "Sec 1", SectionType.STALLS, []);
      expect(section.getSeat("")).toBeNull();
      expect(section.getSeat("non-existent-id")).toBeNull();
    });
  });

  describe("S - Simple", (): void => {
    it("should construct AppState and hold initial reference variables", (): void => {
      const venue = VenueDefinitionLoader.loadAuditorium();
      const state = new AppState(venue, ["s1"], "g1", SelectionMode.DRAG);
      expect(state.venue).toBe(venue);
      expect(state.selectedSeatIds).toEqual(["s1"]);
      expect(state.activeGroupId).toBe("g1");
      expect(state.selectionMode).toBe(SelectionMode.DRAG);
    });
  });
});
