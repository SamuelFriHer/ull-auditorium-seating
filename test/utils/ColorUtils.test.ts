import { describe, it, expect } from "vitest";
import { ColorUtils } from "../../src/utils/ColorUtils";
import { type RGB } from "../../src/types";

describe("ColorUtils", (): void => {
  describe("generateColor", (): void => {
    it("should return a hex color starting with #", (): void => {
      const color: string = ColorUtils.generateColor(0);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("should return deterministic colors for given indices", (): void => {
      const color0: string = ColorUtils.generateColor(0);
      const color1: string = ColorUtils.generateColor(1);
      expect(color0).toBe("#6366F1");
      expect(color1).toBe("#10B981");
    });

    it("should wrap around the palette using modulo", (): void => {
      const color0: string = ColorUtils.generateColor(0);
      const color10: string = ColorUtils.generateColor(10);
      expect(color10).toBe(color0);
    });

    it("should handle negative indices and floating point numbers", (): void => {
      const colorNeg: string = ColorUtils.generateColor(-5);
      const colorFloat: string = ColorUtils.generateColor(1.7);
      expect(colorNeg).toBe("#6366F1"); // Math.max(0) -> index 0
      expect(colorFloat).toBe("#10B981"); // Math.floor(1.7) -> index 1
    });
  });

  describe("hexToRgb", (): void => {
    it("should convert 6-character hex with #", (): void => {
      const rgb: RGB = ColorUtils.hexToRgb("#ffffff");
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("should convert 6-character hex without #", (): void => {
      const rgb: RGB = ColorUtils.hexToRgb("000000");
      expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("should convert 3-character hex with #", (): void => {
      const rgb: RGB = ColorUtils.hexToRgb("#fff");
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("should convert 3-character hex without #", (): void => {
      const rgb: RGB = ColorUtils.hexToRgb("abc");
      expect(rgb).toEqual({ r: 170, g: 187, b: 204 }); // aa, bb, cc
    });

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
  });

  describe("isLight", (): void => {
    it("should correctly identify white as light", (): void => {
      expect(ColorUtils.isLight("#ffffff")).toBe(true);
    });

    it("should correctly identify black as dark", (): void => {
      expect(ColorUtils.isLight("#000000")).toBe(false);
    });

    it("should identify custom colors correctly based on relative luminance threshold", (): void => {
      // Yellow (255, 255, 0) -> luminance = 0.299*255 + 0.587*255 = 225.93 > 128 (light)
      expect(ColorUtils.isLight("#ffff00")).toBe(true);
      // Dark Blue (0, 0, 100) -> luminance = 0.114*100 = 11.4 < 128 (dark)
      expect(ColorUtils.isLight("#000064")).toBe(false);
    });
  });
});
