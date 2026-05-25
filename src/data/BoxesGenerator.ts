import type { SeatDefinition } from "../types";

/**
 * Generates seat definitions for the Lower Box section.
 * Lower Box has 32 seats: 16 on the odd side (right) and 16 on the even side (left).
 *
 * @returns Array of seat definitions for Lower Box.
 */
export function generateLowerBox(): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  for (let index: number = 0; index < 16; index++) {
    const oddNumber: number = 2 * index + 1;
    seats.push({
      id: `lower_box-Odd-${oddNumber}`,
      row: "Odd",
      number: oddNumber,
      x: 910,
      y: 670 - index * 28,
    });

    const evenNumber: number = 2 * index + 2;
    seats.push({
      id: `lower_box-Even-${evenNumber}`,
      row: "Even",
      number: evenNumber,
      x: 140,
      y: 670 - index * 28,
    });
  }

  return seats;
}

/**
 * Generates seat definitions for the Upper Box section.
 * Upper Box has 38 seats: 19 on the odd side (right) and 19 on the even side (left).
 *
 * @returns Array of seat definitions for Upper Box.
 */
export function generateUpperBox(): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  for (let index: number = 0; index < 19; index++) {
    const oddNumber: number = 2 * index + 1;
    seats.push({
      id: `upper_box-Odd-${oddNumber}`,
      row: "Odd",
      number: oddNumber,
      x: 910,
      y: 670 - index * 28,
    });

    const evenNumber: number = 2 * index + 2;
    seats.push({
      id: `upper_box-Even-${evenNumber}`,
      row: "Even",
      number: evenNumber,
      x: 140,
      y: 670 - index * 28,
    });
  }

  return seats;
}
