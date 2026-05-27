import { describe, it, expect } from "vitest";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { SectionType } from "../../src/types";
import { GraduationAllocator } from "../../src/utils/GraduationAllocator";

describe("GraduationAllocator - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should return empty array for 0 students", (): void => {
      const seats = [new Seat("stalls-B-1", "B", 1, "stalls", 0, 0)];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);
      expect(GraduationAllocator.getStudentSeatIds(venue, 0)).toEqual([]);
    });

    it("should return empty array for 0 guests", (): void => {
      const seats = [new Seat("stalls-B-1", "B", 1, "stalls", 0, 0)];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);
      expect(GraduationAllocator.allocateGuestGroups(venue, [], [], 0)).toEqual(
        [],
      );
    });

    it("should return empty array for teachers when stalls section has no seats", (): void => {
      const section = new Section("stalls", "Patio", SectionType.STALLS, []);
      const venue = new Venue("v1", "Venue", [section]);
      expect(GraduationAllocator.getTeacherSeatIds(venue)).toEqual([]);
    });
  });

  describe("O - One", (): void => {
    it("should allocate complete block when requesting one student", (): void => {
      const seats = [
        new Seat("stalls-B-1", "B", 1, "stalls", 0, 0),
        new Seat("stalls-B-3", "B", 3, "stalls", 0, 0),
      ];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);
      expect(GraduationAllocator.getStudentSeatIds(venue, 1)).toEqual([
        "stalls-B-1",
        "stalls-B-3",
      ]);
    });

    it("should allocate guest groups of size one", (): void => {
      const seats = [new Seat("stalls-B-2", "B", 2, "stalls", 0, 0)];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);
      const groups = GraduationAllocator.allocateGuestGroups(venue, [], [], 1);
      expect(groups.length).toBe(1);
      expect(groups[0].seatIds).toEqual(["stalls-B-2"]);
    });
  });

  describe("M - Many", (): void => {
    it("should allocate student seats in half-row blocks, odd first", (): void => {
      const seats = [
        new Seat("stalls-B-1", "B", 1, "stalls", 0, 0),
        new Seat("stalls-B-3", "B", 3, "stalls", 0, 0),
        new Seat("stalls-B-21", "B", 21, "stalls", 0, 0), // Disabled
        new Seat("stalls-B-2", "B", 2, "stalls", 0, 0),
        new Seat("stalls-B-4", "B", 4, "stalls", 0, 0),
        new Seat("stalls-C-1", "C", 1, "stalls", 0, 0),
      ];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);

      const students2 = GraduationAllocator.getStudentSeatIds(venue, 2);
      expect(students2).toEqual(["stalls-B-1", "stalls-B-3"]);

      const students3 = GraduationAllocator.getStudentSeatIds(venue, 3);
      expect(students3).toEqual([
        "stalls-B-1",
        "stalls-B-3",
        "stalls-B-2",
        "stalls-B-4",
      ]);
    });

    it("should segment remaining free seats into G-sized groups with boustrophedon order and sequential labels", (): void => {
      const seats = [
        new Seat("stalls-B-1", "B", 1, "stalls", 0, 0),
        new Seat("stalls-B-3", "B", 3, "stalls", 0, 0),
        new Seat("stalls-B-5", "B", 5, "stalls", 0, 0),
        new Seat("stalls-C-3", "C", 3, "stalls", 0, 0),
        new Seat("stalls-C-1", "C", 1, "stalls", 0, 0),
      ];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);

      const teacherIds: string[] = [];
      const studentIds = ["stalls-B-1"];

      const groups = GraduationAllocator.allocateGuestGroups(
        venue,
        teacherIds,
        studentIds,
        2,
      );

      expect(groups.length).toBe(2);
      expect(groups[0].seatIds).toEqual(["stalls-B-5", "stalls-B-3"]);
      expect(groups[0].provisionalLabel).toBe("Patio Fila B Impar 1");

      expect(groups[1].seatIds).toEqual(["stalls-C-1", "stalls-C-3"]);
      expect(groups[1].provisionalLabel).toBe("Patio Fila C Impar 1");
    });
  });

  describe("B - Boundary", (): void => {
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

      const groups = GraduationAllocator.allocateGuestGroups(venue, [], [], 1);
      expect(groups.length).toBe(3);
      expect(groups[0].seatIds).toEqual(["lower_box-Odd-5"]);
      expect(groups[1].seatIds).toEqual(["lower_box-Odd-3"]);
      expect(groups[2].seatIds).toEqual(["lower_box-Odd-1"]);
    });

    it("should sort amphitheater outside-in for even row index and inside-out for odd row index", (): void => {
      const seats = [
        new Seat("amphitheater-A-1", "A", 1, "amphitheater", 0, 0),
        new Seat("amphitheater-A-3", "A", 3, "amphitheater", 0, 0),
        new Seat("amphitheater-B-1", "B", 1, "amphitheater", 0, 0),
        new Seat("amphitheater-B-3", "B", 3, "amphitheater", 0, 0),
      ];
      const section = new Section(
        "amphitheater",
        "Anfiteatro",
        SectionType.AMPHITHEATER,
        seats,
      );
      const venue = new Venue("v1", "Venue", [section]);

      const groups = GraduationAllocator.allocateGuestGroups(venue, [], [], 2);
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

  describe("I - Interface", (): void => {
    it("should possess required static allocation methods", (): void => {
      expect(typeof GraduationAllocator.getTeacherSeatIds).toBe("function");
      expect(typeof GraduationAllocator.getStudentSeatIds).toBe("function");
      expect(typeof GraduationAllocator.allocateGuestGroups).toBe("function");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should not disable seats in other sections", (): void => {
      const seatAmphi = new Seat("s1", "B", 21, "amphitheater", 0, 0);
      expect(seatAmphi.isDisabled).toBe(false);
    });

    it("should return empty arrays when stalls section is completely missing", (): void => {
      const venue = new Venue("v1", "Venue", []);
      expect(GraduationAllocator.getTeacherSeatIds(venue)).toEqual([]);
      expect(GraduationAllocator.getStudentSeatIds(venue, 5)).toEqual([]);
    });
  });

  describe("S - Simple", (): void => {
    it("should reserve Row A in stalls for teachers", (): void => {
      const seats = [
        new Seat("stalls-A-1", "A", 1, "stalls", 0, 0),
        new Seat("stalls-A-2", "A", 2, "stalls", 0, 0),
        new Seat("stalls-B-1", "B", 1, "stalls", 0, 0),
      ];
      const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
      const venue = new Venue("v1", "Venue", [section]);

      const teachers = GraduationAllocator.getTeacherSeatIds(venue);
      expect(teachers).toEqual(["stalls-A-1", "stalls-A-2"]);
    });
  });
});
