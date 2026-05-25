import type { SeatDefinition } from "../types";

const STALLS_ROWS: string[] = [
  "Q",
  "P",
  "O",
  "N",
  "M",
  "L",
  "K",
  "J",
  "I",
  "H",
  "G",
  "F",
  "E",
  "D",
  "C",
  "B",
  "A",
];

/**
 * Calculates the Y coordinate for a given row in the Stalls.
 * Rows are from Q (furthest back, top) to A (closest to stage, bottom).
 * Adds a corridor adjustment for rows L to A.
 *
 * @param rowName - The row label.
 * @returns The Y coordinate.
 */
function calculateStallsY(rowName: string): number {
  const rowIndex: number = STALLS_ROWS.indexOf(rowName);
  const standardSpacing: number = rowIndex * 28;
  const corridorAdjustment: number = rowName <= "L" ? 20 : 0;
  return 202 + standardSpacing + corridorAdjustment;
}

/**
 * Generates the seat definitions for a single Stalls row.
 *
 * @param rowName - The row label.
 * @param seatCount - Total number of seats in the row.
 * @param maxSeatCount - Maximum number of seats in any row of this section.
 * @param yCoord - The Y coordinate of the row.
 * @returns Array of seat definitions.
 */
function generateRowSeats(
  rowName: string,
  seatCount: number,
  maxSeatCount: number,
  yCoord: number,
): SeatDefinition[] {
  const seats: SeatDefinition[] = [];
  const halfCount: number = seatCount / 2;
  const seatWidth: number = 28;
  const xOffset: number = ((maxSeatCount - seatCount) * seatWidth) / 4;

  for (let index: number = 0; index < halfCount; index++) {
    const oddNumber: number = 2 * index + 1;
    seats.push({
      id: `stalls-${rowName}-${oddNumber}`,
      row: rowName,
      number: oddNumber,
      x: 550 + index * seatWidth + xOffset,
      y: yCoord,
    });

    const evenNumber: number = 2 * index + 2;
    seats.push({
      id: `stalls-${rowName}-${evenNumber}`,
      row: rowName,
      number: evenNumber,
      x: 500 - index * seatWidth - xOffset,
      y: yCoord,
    });
  }

  return seats;
}

/**
 * Generates seat definitions for the Stalls section.
 * Row A has 14 seats, Row B has 22 seats, and Rows C to Q have 24 seats.
 * Odd seats are positioned on the right side, even seats on the left.
 *
 * @returns Array of seat definitions for Stalls.
 */
export function generateStalls(): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  const seatCounts: number[] = STALLS_ROWS.map((rowName: string): number =>
    rowName === "A" ? 14 : rowName === "B" ? 22 : 24,
  );
  const maxSeatCount: number = Math.max(...seatCounts);

  STALLS_ROWS.forEach((rowName: string): void => {
    const seatCount: number = rowName === "A" ? 14 : rowName === "B" ? 22 : 24;
    const yCoord: number = calculateStallsY(rowName);
    seats.push(...generateRowSeats(rowName, seatCount, maxSeatCount, yCoord));
  });

  return seats;
}
