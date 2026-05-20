import type { SeatDefinition } from "../types";

const ANFITEATRO_ROWS: string[] = ["H", "G", "F", "E", "D", "C", "B", "A"];

/**
 * Calculates the Y coordinate for a given row in the Anfiteatro.
 * Rows are from H (furthest back, top) to A (closest to stage, bottom).
 * Adds a corridor adjustment for rows D to A.
 *
 * @param rowName - The row label.
 * @returns The Y coordinate.
 */
function calculateAnfiteatroY(rowName: string): number {
  const rowIndex: number = ANFITEATRO_ROWS.indexOf(rowName);
  const standardSpacing: number = rowIndex * 20;
  const corridorAdjustment: number = rowName <= "D" ? 26 : 0;
  return 180 + standardSpacing + corridorAdjustment;
}

/**
 * Generates seat definitions for a single row in the Anfiteatro.
 *
 * @param rowName - The row label.
 * @param seatCount - Total number of seats in the row.
 * @param yCoord - The Y coordinate of the row.
 * @returns Array of seat definitions.
 */
function generateAnfiteatroRowSeats(
  rowName: string,
  seatCount: number,
  yCoord: number,
): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  if (rowName === "H") {
    for (let index: number = 0; index < seatCount; index++) {
      const oddNumber: number = 2 * index + 1;
      seats.push({
        id: `anfiteatro-${rowName}-${oddNumber}`,
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
        id: `anfiteatro-${rowName}-${oddNumber}`,
        row: rowName,
        number: oddNumber,
        x: 550 + index * 28,
        y: yCoord,
      });

      const evenNumber: number = 2 * index + 2;
      seats.push({
        id: `anfiteatro-${rowName}-${evenNumber}`,
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
 * Generates seat definitions for the Anfiteatro section.
 * Rows A to G have 18 seats. Row H has 11 seats (only on the odd side).
 *
 * @returns Array of seat definitions for Anfiteatro.
 */
export function generateAnfiteatro(): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  ANFITEATRO_ROWS.forEach((rowName: string): void => {
    const seatCount: number = rowName === "H" ? 11 : 18;
    const yCoord: number = calculateAnfiteatroY(rowName);
    seats.push(...generateAnfiteatroRowSeats(rowName, seatCount, yCoord));
  });

  return seats;
}
