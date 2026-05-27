import { describe, it, expect } from "vitest";
import { ColorUtils } from "../../src/utils/ColorUtils";
import { type RGB } from "../../src/types";

describe("ColorUtils - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should return the first palette color deterministic for index 0", (): void => {
      const color: string = ColorUtils.generateColor(0);
      expect(color).toBe("#6366F1");
    });

    it("should convert a black 6-character hex value to zero rgb structure", (): void => {
      const rgb: RGB = ColorUtils.hexToRgb("000000");
      expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("should classify black as dark / non-light", (): void => {
      expect(ColorUtils.isLight("#000000")).toBe(false);
    });
  });

  describe("O - One", (): void => {
    it("should return the second palette color deterministic for index 1", (): void => {
      const color: string = ColorUtils.generateColor(1);
      expect(color).toBe("#10B981");
    });

    it("should convert white 3-character hex to maximum rgb structure", (): void => {
      const rgb: RGB = ColorUtils.hexToRgb("#fff");
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("should classify white as light", (): void => {
      expect(ColorUtils.isLight("#ffffff")).toBe(true);
    });
  });

  describe("M - Many", (): void => {
    it("should wrap around the palette using modulo logic for index 10", (): void => {
      const color0: string = ColorUtils.generateColor(0);
      const color10: string = ColorUtils.generateColor(10);
      expect(color10).toBe(color0);
    });

    it("should convert 6-character hex with # prefix", (): void => {
      const rgb: RGB = ColorUtils.hexToRgb("#ffffff");
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("should convert 3-character hex without # prefix", (): void => {
      const rgb: RGB = ColorUtils.hexToRgb("abc");
      expect(rgb).toEqual({ r: 170, g: 187, b: 204 });
    });

    it("should identify custom colors based on relative luminance threshold", (): void => {
      expect(ColorUtils.isLight("#ffff00")).toBe(true);
      expect(ColorUtils.isLight("#000064")).toBe(false);
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

  describe("E - Exceptional", (): void => {
    it("should throw an error for invalid hex length", (): void => {
      expect((): void => {
        ColorUtils.hexToRgb("#ffff");
      }).toThrow("Invalid hex color length");
    });

    it("should throw an error for invalid characters", (): void => {
      expect((): void => {
        ColorUtils.hexToRgb("xyzxyz");
      }).toThrow("Invalid hex color characters");
    });

    it("should throw an error for trailing invalid characters", (): void => {
      expect((): void => {
        ColorUtils.hexToRgb("00000G");
      }).toThrow("Invalid hex color characters");
    });

    it("should throw an error for hex strings with invalid characters in 3-char format", (): void => {
      expect((): void => {
        ColorUtils.hexToRgb("ffg");
      }).toThrow("Invalid hex color characters");
    });
  });
});
