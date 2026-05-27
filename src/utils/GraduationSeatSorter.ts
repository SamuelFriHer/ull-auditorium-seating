import { Seat } from "../models/Seat";

/**
 * Handles sorting of seats using a boustrophedon (snake-like) pattern.
 */
export class GraduationSeatSorter {
  /**
   * Sorts the seats in a pool using a boustrophedon pattern.
   *
   * @param seats - The list of seats to sort.
   * @param poolKey - Key of the seat pool.
   * @returns The sorted array of seats.
   */
  public static sort(seats: Seat[], poolKey: string): Seat[] {
    const rowsOrder = GraduationSeatSorter.getRowsOrder(poolKey);
    const isBoustrophedon =
      poolKey.startsWith("stalls") || poolKey.startsWith("amphitheater");
    const sorted: Seat[] = [];

    rowsOrder.forEach((rowName: string, rowIndex: number): void => {
      const rowSeats = seats.filter((s: Seat): boolean => s.row === rowName);
      GraduationSeatSorter.sortRowSeats(rowSeats, rowIndex, isBoustrophedon);
      sorted.push(...rowSeats);
    });

    return sorted;
  }

  /**
   * Retrieves the row order sequence depending on the pool area.
   */
  private static getRowsOrder(poolKey: string): string[] {
    if (poolKey.startsWith("stalls")) {
      return [
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
      ];
    }
    if (poolKey.startsWith("amphitheater")) {
      return ["A", "B", "C", "D", "E", "F", "G", "H"];
    }
    return ["Odd", "Even"];
  }

  /**
   * Sorts seats in a single row based on their indices to implement the boustrophedon flow.
   */
  private static sortRowSeats(
    rowSeats: Seat[],
    rowIndex: number,
    isBoustrophedon: boolean,
  ): void {
    if (isBoustrophedon) {
      rowSeats.sort((a: Seat, b: Seat): number =>
        rowIndex % 2 === 0 ? b.number - a.number : a.number - b.number,
      );
    } else {
      rowSeats.sort((a: Seat, b: Seat): number => b.number - a.number);
    }
  }
}
