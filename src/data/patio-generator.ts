import type { SeatDefinition } from "../types";

const PATIO_ROWS: string[] = [
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
 * Calculates the Y coordinate for a given row in the Patio de Butacas.
 * Rows are from Q (furthest back, top) to A (closest to stage, bottom).
 * Adds a corridor adjustment for rows L to A.
 *
 * @param rowName - The row label.
 * @returns The Y coordinate.
 */
function calculatePatioY(rowName: string): number {
  const rowIndex: number = PATIO_ROWS.indexOf(rowName);
  const standardSpacing: number = rowIndex * 28;
  const corridorAdjustment: number = rowName <= "L" ? 20 : 0;
  return 202 + standardSpacing + corridorAdjustment;
}

/**
 * Generates the seat definitions for a single Patio de Butacas row.
 *
 * @param rowName - The row label.
 * @param seatCount - Total number of seats in the row.
 * @param yCoord - The Y coordinate of the row.
 * @returns Array of seat definitions.
 */
function generateRowSeats(
  rowName: string,
  seatCount: number,
  yCoord: number,
): SeatDefinition[] {
  const seats: SeatDefinition[] = [];
  const halfCount: number = seatCount / 2;

  for (let index: number = 0; index < halfCount; index++) {
    const oddNumber: number = 2 * index + 1;
    seats.push({
      id: `patio_butacas-${rowName}-${oddNumber}`,
      row: rowName,
      number: oddNumber,
      x: 550 + index * 28,
      y: yCoord,
    });

    const evenNumber: number = 2 * index + 2;
    seats.push({
      id: `patio_butacas-${rowName}-${evenNumber}`,
      row: rowName,
      number: evenNumber,
      x: 500 - index * 28,
      y: yCoord,
    });
  }

  return seats;
}

/**
 * Generates seat definitions for the Patio de Butacas section.
 * Row A has 14 seats, Row B has 22 seats, and Rows C to Q have 24 seats.
 * Odd seats are positioned on the right side, even seats on the left.
 *
 * @returns Array of seat definitions for Patio de Butacas.
 */
export function generatePatioButacas(): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  PATIO_ROWS.forEach((rowName: string): void => {
    const seatCount: number = rowName === "A" ? 14 : rowName === "B" ? 22 : 24;
    const yCoord: number = calculatePatioY(rowName);
    seats.push(...generateRowSeats(rowName, seatCount, yCoord));
  });

  return seats;
}
