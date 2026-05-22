import type { SeatDefinition } from "../types";

/**
 * Generates seat definitions for the Palco Bajo section.
 * Palco Bajo has 32 seats: 16 on the odd side (right) and 16 on the even side (left).
 *
 * @returns Array of seat definitions for Palco Bajo.
 */
export function generatePalcoBajo(): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  for (let index: number = 0; index < 16; index++) {
    const oddNumber: number = 2 * index + 1;
    seats.push({
      id: `palco_bajo-Impar-${oddNumber}`,
      row: "Impar",
      number: oddNumber,
      x: 910,
      y: 670 - index * 28,
    });

    const evenNumber: number = 2 * index + 2;
    seats.push({
      id: `palco_bajo-Par-${evenNumber}`,
      row: "Par",
      number: evenNumber,
      x: 140,
      y: 670 - index * 28,
    });
  }

  return seats;
}

/**
 * Generates seat definitions for the Palco Alto section.
 * Palco Alto has 38 seats: 19 on the odd side (right) and 19 on the even side (left).
 *
 * @returns Array of seat definitions for Palco Alto.
 */
export function generatePalcoAlto(): SeatDefinition[] {
  const seats: SeatDefinition[] = [];

  for (let index: number = 0; index < 19; index++) {
    const oddNumber: number = 2 * index + 1;
    seats.push({
      id: `palco_alto-Impar-${oddNumber}`,
      row: "Impar",
      number: oddNumber,
      x: 910,
      y: 670 - index * 28,
    });

    const evenNumber: number = 2 * index + 2;
    seats.push({
      id: `palco_alto-Par-${evenNumber}`,
      row: "Par",
      number: evenNumber,
      x: 140,
      y: 670 - index * 28,
    });
  }

  return seats;
}
