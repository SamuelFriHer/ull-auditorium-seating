/**
 * Utility functions for generating hex colors.
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
}
