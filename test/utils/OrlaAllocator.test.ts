import { describe, it, expect } from "vitest";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { SectionType } from "../../src/types";
import { OrlaAllocator } from "../../src/utils/OrlaAllocator";

describe("OrlaAllocator & Seat Disabled Logic", (): void => {
  describe("Seat Disabled Rules", (): void => {
    it("should identify B21 and B22 in stalls as disabled", (): void => {
      const seatB21 = new Seat("s1", "B", 21, "stalls", 0, 0);
      const seatB22 = new Seat("s2", "B", 22, "stalls", 0, 0);
      const seatB20 = new Seat("s3", "B", 20, "stalls", 0, 0);

      expect(seatB21.isDisabled).toBe(true);
      expect(seatB22.isDisabled).toBe(true);
      expect(seatB20.isDisabled).toBe(false);
    });

    it("should identify C23 and D24 in stalls as disabled", (): void => {
      const seatC23 = new Seat("s1", "C", 23, "stalls", 0, 0);
      const seatD24 = new Seat("s2", "D", 24, "stalls", 0, 0);
      const seatC22 = new Seat("s3", "C", 22, "stalls", 0, 0);

      expect(seatC23.isDisabled).toBe(true);
      expect(seatD24.isDisabled).toBe(true);
      expect(seatC22.isDisabled).toBe(false);
    });

    it("should not disable seats in other sections", (): void => {
      const seatAmphi = new Seat("s1", "B", 21, "amphitheater", 0, 0);
      expect(seatAmphi.isDisabled).toBe(false);
    });
  });

  describe("Teacher Allocations", (): void => {
    it("should reserve Row A in stalls for teachers", (): void => {
      const seats = [
        new Seat("stalls-A-1", "A", 1, "stalls", 0, 0),
        new Seat("stalls-A-2", "A", 2, "stalls", 0, 0),
        new Seat("stalls-B-1", "B", 1, "stalls", 0, 0),
      ];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);

      const teachers = OrlaAllocator.getTeacherSeatIds(venue);
      expect(teachers).toEqual(["stalls-A-1", "stalls-A-2"]);
    });
  });

  describe("Student Allocations", (): void => {
    it("should allocate student seats in half-row blocks, odd first", (): void => {
      const seats = [
        new Seat("stalls-B-1", "B", 1, "stalls", 0, 0), // Odd B
        new Seat("stalls-B-3", "B", 3, "stalls", 0, 0), // Odd B
        new Seat("stalls-B-21", "B", 21, "stalls", 0, 0), // Disabled
        new Seat("stalls-B-2", "B", 2, "stalls", 0, 0), // Even B
        new Seat("stalls-B-4", "B", 4, "stalls", 0, 0), // Even B
        new Seat("stalls-C-1", "C", 1, "stalls", 0, 0), // Odd C
      ];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);

      // Requesting 2 students: should fit in B Odd side (contains B1 and B3)
      const students2 = OrlaAllocator.getStudentSeatIds(venue, 2);
      expect(students2).toEqual(["stalls-B-1", "stalls-B-3"]);

      // Requesting 3 students: B Odd side (2 seats) is not enough, so should allocate B Even side (B2, B4) too, total 4 seats allocated
      const students3 = OrlaAllocator.getStudentSeatIds(venue, 3);
      expect(students3).toEqual([
        "stalls-B-1",
        "stalls-B-3",
        "stalls-B-2",
        "stalls-B-4",
      ]);
    });
  });

  describe("Guest Group Allocations", (): void => {
    it("should segment remaining free seats into G-sized groups with boustrophedon order and sequential labels", (): void => {
      const seats = [
        new Seat("stalls-B-1", "B", 1, "stalls", 0, 0), // Odd B (student)
        new Seat("stalls-B-3", "B", 3, "stalls", 0, 0), // Odd B
        new Seat("stalls-B-5", "B", 5, "stalls", 0, 0), // Odd B
        new Seat("stalls-C-3", "C", 3, "stalls", 0, 0), // Odd C
        new Seat("stalls-C-1", "C", 1, "stalls", 0, 0), // Odd C
      ];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);

      const teacherIds: string[] = [];
      const studentIds = ["stalls-B-1"]; // B-1 is occupied by student

      // Remaining seats: B-3, B-5, C-1, C-3
      // Stalls-Odd sorting (stage to back):
      // Row B: B-3, B-5 (rowIndex 0: even, so sorted descending/outside-in: B-5, B-3)
      // Row C: C-1, C-3 (rowIndex 1: odd, so sorted ascending/inside-out: C-1, C-3)
      // Overall list: B-5, B-3, C-1, C-3
      const groups = OrlaAllocator.allocateGuestGroups(
        venue,
        teacherIds,
        studentIds,
        2, // Group size G = 2
      );

      expect(groups.length).toBe(2);
      expect(groups[0].seatIds).toEqual(["stalls-B-5", "stalls-B-3"]);
      expect(groups[0].provisionalLabel).toBe("Patio Fila B Impar 1");

      expect(groups[1].seatIds).toEqual(["stalls-C-1", "stalls-C-3"]);
      expect(groups[1].provisionalLabel).toBe("Patio Fila C Impar 1");
    });

    it("should sort boxes descending (highest to lowest seat number)", (): void => {
      const seats = [
        new Seat("lower_box-Odd-1", "Odd", 1, "lower_box", 0, 0),
        new Seat("lower_box-Odd-5", "Odd", 5, "lower_box", 0, 0),
        new Seat("lower_box-Odd-3", "Odd", 3, "lower_box", 0, 0),
      ];
      const section = new Section(
        "lower_box",
        "Palco Bajo",
        SectionType.BOX,
        seats,
      );
      const venue = new Venue("v1", "Venue", [section]);

      const groups = OrlaAllocator.allocateGuestGroups(venue, [], [], 1);
      expect(groups.length).toBe(3);
      expect(groups[0].seatIds).toEqual(["lower_box-Odd-5"]);
      expect(groups[1].seatIds).toEqual(["lower_box-Odd-3"]);
      expect(groups[2].seatIds).toEqual(["lower_box-Odd-1"]);
    });

    it("should sort amphitheater outside-in for even row index and inside-out for odd row index", (): void => {
      const seats = [
        new Seat("amphitheater-A-1", "A", 1, "amphitheater", 0, 0), // Row A (index 0, even) -> outside-in (descending)
        new Seat("amphitheater-A-3", "A", 3, "amphitheater", 0, 0),
        new Seat("amphitheater-B-1", "B", 1, "amphitheater", 0, 0), // Row B (index 1, odd) -> inside-out (ascending)
        new Seat("amphitheater-B-3", "B", 3, "amphitheater", 0, 0),
      ];
      const section = new Section(
        "amphitheater",
        "Anfiteatro",
        SectionType.AMPHITHEATER,
        seats,
      );
      const venue = new Venue("v1", "Venue", [section]);

      const groups = OrlaAllocator.allocateGuestGroups(venue, [], [], 2);
      expect(groups.length).toBe(2);
      expect(groups[0].seatIds).toEqual([
        "amphitheater-A-3",
        "amphitheater-A-1",
      ]);
      expect(groups[1].seatIds).toEqual([
        "amphitheater-B-1",
        "amphitheater-B-3",
      ]);
    });
  });
});
