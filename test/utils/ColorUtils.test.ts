import { describe, it, expect } from "vitest";
import { ColorUtils } from "../../src/utils/ColorUtils";

describe("ColorUtils - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should return the first palette color deterministic for index 0", (): void => {
      const color: string = ColorUtils.generateColor(0);
      expect(color).toBe("#6366F1");
    });
  });

  describe("O - One", (): void => {
    it("should return the second palette color deterministic for index 1", (): void => {
      const color: string = ColorUtils.generateColor(1);
      expect(color).toBe("#10B981");
    });
  });

  describe("M - Many", (): void => {
    it("should wrap around the palette using modulo logic for index 10", (): void => {
      const color0: string = ColorUtils.generateColor(0);
      const color10: string = ColorUtils.generateColor(10);
      expect(color10).toBe(color0);
    });
  });

  describe("B - Boundary", (): void => {
    it("should handle negative index and fallback to zero index", (): void => {
      const colorNeg: string = ColorUtils.generateColor(-5);
      expect(colorNeg).toBe("#6366F1");
    });

    it("should handle floating point index and floor it", (): void => {
      const colorFloat: string = ColorUtils.generateColor(1.7);
      expect(colorFloat).toBe("#10B981");
    });
  });

  describe("I - Interface", (): void => {
    it("should return a string matching hex color regex format", (): void => {
      const color: string = ColorUtils.generateColor(0);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
