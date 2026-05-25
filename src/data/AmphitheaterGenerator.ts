import type { SeatDefinition } from "../types";

const AMPHITHEATER_ROWS: string[] = ["H", "G", "F", "E", "D", "C", "B", "A"];

/**
 * Calculates the Y coordinate for a given row in the Amphitheater.
 * Rows are from H (furthest back, top) to A (closest to stage, bottom).
 * Adds a corridor adjustment for rows D to A.
 *
 * @param rowName - The row label.
 * @returns The Y coordinate.
 */
function calculateAmphitheaterY(rowName: string): number {
  const rowIndex: number = AMPHITHEATER_ROWS.indexOf(rowName);
  const standardSpacing: number = rowIndex * 28;
  const corridorAdjustment: number = rowName <= "D" ? 20 : 0;
  return 202 + standardSpacing + corridorAdjustment;
}

/**
 * Generates seat definitions for a single row in the Amphitheater.
 *
 * @param rowName - The row label.
 * @param seatCount - Total number of seats in the row.
 * @param yCoord - The Y coordinate of the row.
 * @returns Array of seat definitions.
 */
function generateAmphitheaterRowSeats(
  rowName: string,
  seatCount: number,
  yCoord: number,
): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  if (rowName === "H") {
    for (let index: number = 0; index < seatCount; index++) {
      const oddNumber: number = 2 * index + 1;
      seats.push({
        id: `amphitheater-${rowName}-${oddNumber}`,
        row: rowName,
        number: oddNumber,
        x: 550 + index * 28,
        y: yCoord,
      });
    }
  } else {
    const halfCount: number = seatCount / 2;
    for (let index: number = 0; index < halfCount; index++) {
      const oddNumber: number = 2 * index + 1;
      seats.push({
        id: `amphitheater-${rowName}-${oddNumber}`,
        row: rowName,
        number: oddNumber,
        x: 550 + index * 28,
        y: yCoord,
      });

      const evenNumber: number = 2 * index + 2;
      seats.push({
        id: `amphitheater-${rowName}-${evenNumber}`,
        row: rowName,
        number: evenNumber,
        x: 500 - index * 28,
        y: yCoord,
      });
    }
  }

  return seats;
}

/**
 * Generates seat definitions for the Amphitheater section.
 * Rows A to G have 18 seats. Row H has 11 seats (only on the odd side).
 *
 * @returns Array of seat definitions for Amphitheater.
 */
export function generateAmphitheater(): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  AMPHITHEATER_ROWS.forEach((rowName: string): void => {
    const seatCount: number = rowName === "H" ? 11 : 18;
    const yCoord: number = calculateAmphitheaterY(rowName);
    seats.push(...generateAmphitheaterRowSeats(rowName, seatCount, yCoord));
  });

  return seats;
}
