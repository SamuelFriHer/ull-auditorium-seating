import { type RGB } from "../types";

/**
 * Utility functions for generating, converting, and analyzing hex colors.
 */
export class ColorUtils {
  /** Curated palette of distinguishable premium hex colors. */
  private static readonly PALETTE: string[] = [
    "#6366F1", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#F43F5E", // Rose
    "#06B6D4", // Cyan
    "#8B5CF6", // Violet
    "#14B8A6", // Teal
    "#F97316", // Orange
    "#0EA5E9", // Sky
    "#EC4899", // Pink
  ];

  /**
   * Generates a hex color code from a curated palette of premium colors.
   *
   * @param index - The index used to select a color from the palette.
   * @returns A hex color string starting with `#`.
   */
  public static generateColor(index: number): string {
    const validIndex: number = Math.max(0, Math.floor(index));
    return this.PALETTE[validIndex % this.PALETTE.length] || "#6366F1";
  }

  /**
   * Converts a hex color string to its RGB representation.
   *
   * @param hex - Hex color string (e.g., "#FFF", "#FFFFFF", "FFF", "FFFFFF").
   * @returns An RGB object containing r, g, and b values.
   * @throws Error if the hex string is invalid.
   */
  public static hexToRgb(hex: string): RGB {
    let cleanHex: string = hex.trim().replace(/^#/, "");

    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split("")
        .map((char: string): string => char + char)
        .join("");
    }

    if (cleanHex.length !== 6) {
      throw new Error(`Invalid hex color length: ${hex}`);
    }

    const num: number = parseInt(cleanHex, 16);
    if (isNaN(num)) {
      throw new Error(`Invalid hex color characters: ${hex}`);
    }

    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  /**
   * Determines if a color is light based on relative luminance.
   *
   * @param hex - The hex color string to analyze.
   * @returns True if the color is light, false otherwise.
   */
  public static isLight(hex: string): boolean {
    const rgb: RGB = this.hexToRgb(hex);
    const luminance: number = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    return luminance > 128;
  }
}
