import { describe, it, expect } from "vitest";
import { Seat } from "../../src/models/Seat";
import { SeatGroup } from "../../src/models/SeatGroup";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { VenueSerializer } from "../../src/models/VenueSerializer";
import { VenueDefinitionLoader } from "../../src/utils/VenueDefinitionLoader";
import { SectionType, SelectionMode } from "../../src/types";

describe("Seat Model", (): void => {
  it("should initialize correct properties", (): void => {
    const seat = new Seat("s1", "A", 1, "sec1", 10, 20);
    expect(seat.id).toBe("s1");
    expect(seat.row).toBe("A");
    expect(seat.number).toBe(1);
    expect(seat.sectionId).toBe("sec1");
    expect(seat.x).toBe(10);
    expect(seat.y).toBe(20);
    expect(seat.groupId).toBeNull();
  });
});

describe("Section Model", (): void => {
  it("should look up seats and rows correctly", (): void => {
    const s1 = new Seat("s1", "A", 1, "sec1", 10, 20);
    const s2 = new Seat("s2", "A", 3, "sec1", 30, 20);
    const s3 = new Seat("s3", "B", 1, "sec1", 10, 40);
    const section = new Section(
      "sec1",
      "Section 1",
      SectionType.PATIO_BUTACAS,
      [s1, s2, s3],
    );

    expect(section.getSeat("s2")).toBe(s2);
    expect(section.getSeat("s4")).toBeNull();
    expect(section.getSeatsInRow("A")).toEqual([s1, s2]);
    expect(section.getSeatsInRow("B")).toEqual([s3]);
  });
});

describe("Venue and Seating Grouping Logic", (): void => {
  it("should correctly assign and unassign seats to groups", (): void => {
    const s1 = new Seat("s1", "A", 1, "sec1", 10, 20);
    const s2 = new Seat("s2", "A", 3, "sec1", 30, 20);
    const section = new Section(
      "sec1",
      "Section 1",
      SectionType.PATIO_BUTACAS,
      [s1, s2],
    );
    const group1 = new SeatGroup("g1", "Group 1", "#FF0000");
    const group2 = new SeatGroup("g2", "Group 2", "#00FF00");
    const venue = new Venue("v1", "Venue 1", [section], [group1, group2]);

    venue.assignSeatsToGroup(["s1", "s2"], "g1");
    expect(s1.groupId).toBe("g1");
    expect(s2.groupId).toBe("g1");
    expect(group1.seatIds).toEqual(["s1", "s2"]);

    venue.assignSeatsToGroup(["s1"], "g2");
    expect(s1.groupId).toBe("g2");
    expect(group2.seatIds).toEqual(["s1"]);
    expect(group1.seatIds).toEqual(["s2"]);

    venue.unassignSeats(["s1", "s2"]);
    expect(s1.groupId).toBeNull();
    expect(s2.groupId).toBeNull();
    expect(group1.seatIds).toHaveLength(0);
    expect(group2.seatIds).toHaveLength(0);
  });
});

describe("Venue Definition Loader & VenueSerializer", (): void => {
  it("should load the Paraninfo venue and serialize/deserialize symmetrically", (): void => {
    const venue = VenueDefinitionLoader.loadParaninfo();
    expect(venue.id).toBe("paraninfo_ull");
    expect(venue.name).toContain("Universidad de La Laguna");

    const group1 = new SeatGroup("g1", "VIP", "#FFD700");
    venue.groups.push(group1);

    const seatId1 = venue.sections[0]?.seats[0]?.id;
    const seatId2 = venue.sections[0]?.seats[1]?.id;
    expect(seatId1).toBeDefined();
    expect(seatId2).toBeDefined();

    if (seatId1 && seatId2) {
      venue.assignSeatsToGroup([seatId1, seatId2], "g1");

      const serialized = VenueSerializer.toJSON(venue);
      expect(serialized.id).toBe("paraninfo_ull");
      expect(serialized.groups).toHaveLength(1);
      expect(serialized.groups[0]?.seatIds).toEqual([seatId1, seatId2]);

      const deserialized = VenueSerializer.fromJSON(serialized);
      expect(deserialized.id).toBe("paraninfo_ull");
      expect(deserialized.groups).toHaveLength(1);
      expect(deserialized.groups[0]?.label).toBe("VIP");

      const deserializedSeat1 = deserialized.getSeat(seatId1);
      expect(deserializedSeat1).not.toBeNull();
      expect(deserializedSeat1?.groupId).toBe("g1");
    }
  });
});

describe("AppState Model", (): void => {
  it("should construct and hold reference variables", (): void => {
    const venue = VenueDefinitionLoader.loadParaninfo();
    const appState = new AppState(venue, ["s1"], "g1", SelectionMode.DRAG);
    expect(appState.venue).toBe(venue);
    expect(appState.selectedSeatIds).toEqual(["s1"]);
    expect(appState.activeGroupId).toBe("g1");
    expect(appState.selectionMode).toBe(SelectionMode.DRAG);
  });
});
