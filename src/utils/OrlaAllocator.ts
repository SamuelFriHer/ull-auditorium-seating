import { Venue } from "../models/Venue";
import { Seat } from "../models/Seat";
import { OrlaGuestGroup } from "../models/OrlaGuestGroup";

/**
 * Handles calculations and allocations for Orla Mode seating.
 */
export class OrlaAllocator {
  /**
   * Identifies seats reserved for teachers (Row A of Stalls).
   *
   * @param venue - The active venue.
   * @returns Array of seat IDs.
   */
  public static getTeacherSeatIds(venue: Venue): string[] {
    const stalls = venue.getSection("stalls");
    if (!stalls) return [];
    return stalls.seats
      .filter((s: Seat): boolean => s.row === "A" && !s.isDisabled)
      .map((s: Seat): string => s.id);
  }

  /**
   * Allocates seats for students in half-row increments from Row B.
   *
   * @param venue - The active venue.
   * @param studentCount - Number of students.
   * @returns Array of seat IDs.
   */
  public static getStudentSeatIds(
    venue: Venue,
    studentCount: number,
  ): string[] {
    const stalls = venue.getSection("stalls");
    if (!stalls || studentCount <= 0) return [];

    const rows = [
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
    const allocated: string[] = [];

    for (const row of rows) {
      const seats = stalls.getSeatsInRow(row).filter((s) => !s.isDisabled);
      allocated.push(...OrlaAllocator.getHalfRow(seats, true));
      if (allocated.length >= studentCount) break;
      allocated.push(...OrlaAllocator.getHalfRow(seats, false));
      if (allocated.length >= studentCount) break;
    }

    return allocated;
  }

  /**
   * Filters and sorts seats belonging to a half-row block.
   */
  private static getHalfRow(seats: Seat[], isOdd: boolean): string[] {
    return seats
      .filter((s): boolean => (s.number % 2 !== 0) === isOdd)
      .sort((a, b): number => a.number - b.number)
      .map((s): string => s.id);
  }

  /**
   * Segments all remaining free seats into guest groups of size G.
   *
   * @param venue - The active venue.
   * @param teacherIds - Teacher seat IDs.
   * @param studentIds - Student seat IDs.
   * @param guestCount - Number of guests per student.
   * @returns Array of OrlaGuestGroup.
   */
  public static allocateGuestGroups(
    venue: Venue,
    teacherIds: string[],
    studentIds: string[],
    guestCount: number,
  ): OrlaGuestGroup[] {
    if (guestCount <= 0) return [];

    const excluded = new Set<string>([...teacherIds, ...studentIds]);
    const pools = OrlaAllocator.partitionFreeSeats(venue, excluded);
    const groups: OrlaGuestGroup[] = [];
    const labelCounts = new Map<string, number>();

    for (const [poolKey, seats] of Object.entries(pools)) {
      const sortedSeats = OrlaAllocator.sortSeatsBoustrophedon(seats, poolKey);
      let index = 0;
      while (index < sortedSeats.length) {
        const chunk = sortedSeats.slice(index, index + guestCount);
        index += guestCount;

        const firstSeat = chunk[0];
        if (!firstSeat) break;

        const prefix = OrlaAllocator.getLocationPrefix(firstSeat);
        const count = labelCounts.get(prefix) || 0;
        labelCounts.set(prefix, count + 1);

        const id = `orla_guest_${poolKey}_group_${Date.now()}_${Math.floor(
          Math.random() * 1000,
        )}_${groups.length}`;
        const provisionalLabel = `${prefix} ${count + 1}`;
        const seatIds = chunk.map((s): string => s.id);

        groups.push(new OrlaGuestGroup(id, provisionalLabel, seatIds));
      }
    }

    return groups;
  }

  /**
   * Partitions the usable free seats into independent pools.
   */
  private static partitionFreeSeats(
    venue: Venue,
    excluded: Set<string>,
  ): Record<string, Seat[]> {
    const pools: Record<string, Seat[]> = {};

    venue.sections.forEach((section): void => {
      section.seats.forEach((seat): void => {
        if (!seat.isDisabled && !excluded.has(seat.id)) {
          const side = seat.number % 2 !== 0 ? "Odd" : "Even";
          const key = `${section.id}-${side}`;
          if (!pools[key]) pools[key] = [];
          pools[key].push(seat);
        }
      });
    });

    return pools;
  }

  /**
   * Sorts the seats in a pool using a boustrophedon (snake-like) pattern.
   */
  private static sortSeatsBoustrophedon(
    seats: Seat[],
    poolKey: string,
  ): Seat[] {
    const isStalls = poolKey.startsWith("stalls");
    const isAmphi = poolKey.startsWith("amphitheater");
    const rowsOrder = isStalls
      ? [
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
        ]
      : isAmphi
        ? ["A", "B", "C", "D", "E", "F", "G", "H"]
        : ["Odd", "Even"];

    const sorted: Seat[] = [];
    rowsOrder.forEach((rowName, rowIndex): void => {
      const rowSeats = seats.filter((s): boolean => s.row === rowName);
      if (isStalls || isAmphi) {
        rowSeats.sort((a, b) =>
          rowIndex % 2 === 0 ? b.number - a.number : a.number - b.number,
        );
      } else {
        rowSeats.sort((a, b) => b.number - a.number);
      }
      sorted.push(...rowSeats);
    });

    return sorted;
  }

  /**
   * Formulates a location prefix string in Spanish.
   */
  private static getLocationPrefix(seat: Seat): string {
    const sideText = seat.number % 2 !== 0 ? "Impar" : "Par";
    switch (seat.sectionId) {
      case "stalls":
        return `Patio Fila ${seat.row} ${sideText}`;
      case "amphitheater":
        return `Anfiteatro Fila ${seat.row} ${sideText}`;
      case "lower_box":
        return `Palco Bajo ${sideText}`;
      case "upper_box":
        return `Palco Alto ${sideText}`;
      default:
        return `Zona Desconocida`;
    }
  }
}
