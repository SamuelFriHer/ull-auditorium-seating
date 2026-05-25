import { describe, it, expect } from "vitest";
import {
  getSectionIdsForFloor,
  calculateVenueViewBox,
} from "../../src/utils/LayoutUtils";
import { Section } from "../../src/models/Section";
import { Seat } from "../../src/models/Seat";
import { SectionType } from "../../src/types";

describe("LayoutUtils - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should return empty list for unknown floors", (): void => {
      const sectionIds: string[] = getSectionIdsForFloor(99);
      expect(sectionIds).toEqual([]);
    });

    it("should return default viewBox when sections array is empty", (): void => {
      const viewBox: string = calculateVenueViewBox([]);
      expect(viewBox).toBe("0 0 1050 720");
    });

    it("should return default viewBox when sections have no seats", (): void => {
      const section = new Section(
        "sec1",
        "Section 1",
        SectionType.PATIO_BUTACAS,
        [],
      );
      const viewBox: string = calculateVenueViewBox([section]);
      expect(viewBox).toBe("0 0 1050 720");
    });
  });

  describe("O - One", (): void => {
    it("should return correct section IDs for floor 0 containing one section", (): void => {
      const sectionIds: string[] = getSectionIdsForFloor(0);
      expect(sectionIds).toEqual(["patio_butacas"]);
    });

    it("should return correct section IDs for floor 2 containing one section", (): void => {
      const sectionIds: string[] = getSectionIdsForFloor(2);
      expect(sectionIds).toEqual(["palco_alto"]);
    });
  });

  describe("M - Many", (): void => {
    it("should return correct section IDs for floor 1 containing many sections", (): void => {
      const sectionIds: string[] = getSectionIdsForFloor(1);
      expect(sectionIds).toEqual(["anfiteatro", "palco_bajo"]);
    });
  });

  describe("B - Boundary", (): void => {
    it("should calculate correct viewBox enclosing all seats with padding boundary", (): void => {
      const seat1 = new Seat("seat1", "A", 1, "sec1", 100, 200);
      const seat2 = new Seat("seat2", "A", 2, "sec1", 200, 300);
      const section = new Section(
        "sec1",
        "Section 1",
        SectionType.PATIO_BUTACAS,
        [seat1, seat2],
      );

      const viewBox: string = calculateVenueViewBox([section]);
      // minX = 100, maxX = 200 + 18 = 218. Width = 118. Padding = 24. x = 100 - 24 = 76. Width with padding = 118 + 48 = 166.
      // minY = 200, maxY = 300 + 18 = 318. Height = 118. Padding = 24. y = 200 - 24 = 176. Height with padding = 118 + 48 = 166.
      expect(viewBox).toBe("76 176 166 166");
    });
  });

  describe("I - Interface", (): void => {
    it("should conform to return type signatures of helper functions", (): void => {
      const sectionIds: unknown = getSectionIdsForFloor(0);
      const viewBox: unknown = calculateVenueViewBox([]);
      expect(Array.isArray(sectionIds)).toBe(true);
      expect(typeof viewBox).toBe("string");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should handle invalid negative floor safely by returning empty list", (): void => {
      const sectionIds: string[] = getSectionIdsForFloor(-1);
      expect(sectionIds).toEqual([]);
    });
  });
});
