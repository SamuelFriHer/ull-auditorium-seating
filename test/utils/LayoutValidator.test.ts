import { describe, it, expect } from "vitest";
import { LayoutValidator } from "../../src/utils/LayoutValidator";
import type { VenueJSON } from "../../src/types";

describe("LayoutValidator - ZOMBIES", (): void => {
  // Z - Zero
  describe("Z - Zero", (): void => {
    it("should throw error when rawData is null or undefined", (): void => {
      expect((): void => {
        LayoutValidator.validate(null);
      }).toThrow("Invalid layout JSON: Root must be a non-null object.");

      expect((): void => {
        LayoutValidator.validate(undefined);
      }).toThrow("Invalid layout JSON: Root must be a non-null object.");
    });

    it("should throw error when rawData is not an object", (): void => {
      expect((): void => {
        LayoutValidator.validate("invalid string");
      }).toThrow("Invalid layout JSON: Root must be a non-null object.");
    });
  });

  // O - One
  describe("O - One", (): void => {
    it("should validate successfully with exactly one valid group and seat", (): void => {
      const validLayout: unknown = {
        id: "auditorium_ull",
        name: "Paraninfo",
        groups: [
          {
            id: "g1",
            label: "Grupo 1",
            color: "#6366F1",
            seatIds: ["s1"],
          },
        ],
      };

      const result: VenueJSON = LayoutValidator.validate(validLayout);
      expect(result.id).toBe("auditorium_ull");
      expect(result.groups.length).toBe(1);
    });
  });

  // M - Many
  describe("M - Many", (): void => {
    it("should validate successfully with multiple valid groups and seats", (): void => {
      const validLayout: unknown = {
        id: "auditorium_ull",
        name: "Paraninfo ULL",
        groups: [
          {
            id: "g1",
            label: "Grupo A",
            color: "#6366F1",
            seatIds: ["s1", "s2"],
          },
          {
            id: "g2",
            label: "Grupo B",
            color: "#10B981",
            seatIds: ["s3", "s4", "s5"],
          },
        ],
      };

      const result: VenueJSON = LayoutValidator.validate(validLayout);
      expect(result.groups.length).toBe(2);
      expect(result.groups[1].seatIds.length).toBe(3);
    });
  });

  // B - Boundary
  describe("B - Boundary", (): void => {
    it("should accept minimum (3 hex chars) and maximum (8 hex chars) color length", (): void => {
      const minColorLayout: unknown = {
        id: "auditorium_ull",
        name: "Paraninfo",
        groups: [{ id: "g1", label: "G", color: "#FFF", seatIds: [] }],
      };
      expect(LayoutValidator.validate(minColorLayout)).toBeDefined();

      const maxColorLayout: unknown = {
        id: "auditorium_ull",
        name: "Paraninfo",
        groups: [{ id: "g1", label: "G", color: "#FF00FFAA", seatIds: [] }],
      };
      expect(LayoutValidator.validate(maxColorLayout)).toBeDefined();
    });

    it("should accept empty groups array or group with empty seatIds array", (): void => {
      const emptyGroupsLayout: unknown = {
        id: "auditorium_ull",
        name: "Paraninfo",
        groups: [],
      };
      expect(LayoutValidator.validate(emptyGroupsLayout)).toBeDefined();

      const emptySeatsLayout: unknown = {
        id: "auditorium_ull",
        name: "Paraninfo",
        groups: [{ id: "g1", label: "G", color: "#FFF", seatIds: [] }],
      };
      expect(LayoutValidator.validate(emptySeatsLayout)).toBeDefined();
    });
  });

  // I - Interface
  describe("I - Interface", (): void => {
    it("should return the exact same object structure if validation passes", (): void => {
      const validLayout = {
        id: "auditorium_ull",
        name: "Paraninfo",
        groups: [],
      };
      const result = LayoutValidator.validate(validLayout);
      expect(result).toBe(validLayout);
    });
  });

  // E - Exceptional
  describe("E - Exceptional", (): void => {
    it("should throw error for unsupported venue ID", (): void => {
      const badLayout = { id: "unknown_venue", name: "Bad", groups: [] };
      expect((): void => {
        LayoutValidator.validate(badLayout);
      }).toThrow("Unsupported venue ID: unknown_venue");
    });

    it("should throw error for missing or empty string fields", (): void => {
      const noId = { name: "Test", groups: [] };
      expect((): void => {
        LayoutValidator.validate(noId);
      }).toThrow(
        "Invalid layout JSON: 'id' is required and must be a non-empty string.",
      );

      const emptyName = { id: "auditorium_ull", name: "  ", groups: [] };
      expect((): void => {
        LayoutValidator.validate(emptyName);
      }).toThrow(
        "Invalid layout JSON: 'name' is required and must be a non-empty string.",
      );
    });

    it("should throw error for non-array groups", (): void => {
      const badGroups = { id: "auditorium_ull", name: "Test", groups: {} };
      expect((): void => {
        LayoutValidator.validate(badGroups);
      }).toThrow(
        "Invalid layout JSON: 'groups' is required and must be an array.",
      );
    });

    it("should throw error for invalid group structure or values", (): void => {
      const badGroupType = {
        id: "auditorium_ull",
        name: "Test",
        groups: [null],
      };
      expect((): void => {
        LayoutValidator.validate(badGroupType);
      }).toThrow("Invalid layout JSON: Group must be a non-null object.");

      const missingGroupId = {
        id: "auditorium_ull",
        name: "Test",
        groups: [{ label: "G", color: "#FFF", seatIds: [] }],
      };
      expect((): void => {
        LayoutValidator.validate(missingGroupId);
      }).toThrow(
        "Invalid layout JSON: Group 'id' is required and must be a non-empty string.",
      );

      const missingGroupLabel = {
        id: "auditorium_ull",
        name: "Test",
        groups: [{ id: "g1", color: "#FFF", seatIds: [] }],
      };
      expect((): void => {
        LayoutValidator.validate(missingGroupLabel);
      }).toThrow(
        "Invalid layout JSON: Group 'label' is required and must be a non-empty string.",
      );
    });

    it("should throw error for malformed colors or injection attempts", (): void => {
      const testInjection = (color: string): void => {
        const payload = {
          id: "auditorium_ull",
          name: "Test",
          groups: [{ id: "g1", label: "G", color, seatIds: [] }],
        };
        expect((): void => {
          LayoutValidator.validate(payload);
        }).toThrow(
          "Invalid layout JSON: Group 'color' must be a valid hex color code:",
        );
      };

      testInjection("red");
      testInjection("rgb(255, 0, 0)");
      testInjection("red; background: url(http://malicious.url)");
      testInjection("#FF00FF; border: 10px solid black;");
      testInjection("#12");
      testInjection("#12345");
      testInjection("#123456789");
    });

    it("should throw error for invalid seatIds type or contents", (): void => {
      const badSeatIds = {
        id: "auditorium_ull",
        name: "Test",
        groups: [{ id: "g1", label: "G", color: "#FFF", seatIds: {} }],
      };
      expect((): void => {
        LayoutValidator.validate(badSeatIds);
      }).toThrow(
        "Invalid layout JSON: Group 'seatIds' is required and must be an array.",
      );

      const nonStringSeatIds = {
        id: "auditorium_ull",
        name: "Test",
        groups: [{ id: "g1", label: "G", color: "#FFF", seatIds: ["s1", 123] }],
      };
      expect((): void => {
        LayoutValidator.validate(nonStringSeatIds);
      }).toThrow(
        "Invalid layout JSON: Group 'seatIds' must contain only non-empty strings.",
      );

      const emptyStringSeatIds = {
        id: "auditorium_ull",
        name: "Test",
        groups: [
          { id: "g1", label: "G", color: "#FFF", seatIds: ["s1", "  "] },
        ],
      };
      expect((): void => {
        LayoutValidator.validate(emptyStringSeatIds);
      }).toThrow(
        "Invalid layout JSON: Group 'seatIds' must contain only non-empty strings.",
      );
    });
  });

  // S - Simple
  describe("S - Simple", (): void => {
    it("should pass simple valid schema and match typing requirements", (): void => {
      const raw: unknown = {
        id: "auditorium_ull",
        name: "Paraninfo de la ULL",
        groups: [],
      };
      const result: VenueJSON = LayoutValidator.validate(raw);
      expect(result.id).toBe("auditorium_ull");
      expect(result.name).toBe("Paraninfo de la ULL");
    });
  });
});
