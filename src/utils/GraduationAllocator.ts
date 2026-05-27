import { Venue } from "../models/Venue";
import { Seat } from "../models/Seat";
import { Section } from "../models/Section";
import { GraduationGuestGroup } from "../models/GraduationGuestGroup";
import { GraduationSeatSorter } from "./GraduationSeatSorter";
import { GraduationLocationLabeler } from "./GraduationLocationLabeler";

/**
 * Handles calculations and allocations for Graduation Mode seating.
 */
export class GraduationAllocator {
  /**
   * Stalls rows reserved for students.
   */
  private static readonly STUDENT_ROWS: string[] = [
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

    const allocated: string[] = [];
    for (const row of GraduationAllocator.STUDENT_ROWS) {
      const seats = stalls
        .getSeatsInRow(row)
        .filter((s: Seat): boolean => !s.isDisabled);
      allocated.push(...GraduationAllocator.getHalfRow(seats, true));
      if (allocated.length >= studentCount) break;
      allocated.push(...GraduationAllocator.getHalfRow(seats, false));
      if (allocated.length >= studentCount) break;
    }

    return allocated;
  }

  /**
   * Filters and sorts seats belonging to a half-row block.
   */
  private static getHalfRow(seats: Seat[], isOdd: boolean): string[] {
    return seats
      .filter((s: Seat): boolean => (s.number % 2 !== 0) === isOdd)
      .sort((a: Seat, b: Seat): number => a.number - b.number)
      .map((s: Seat): string => s.id);
  }

  /**
   * Segments all remaining free seats into guest groups of size G.
   *
   * @param venue - The active venue.
   * @param teacherIds - Teacher seat IDs.
   * @param studentIds - Student seat IDs.
   * @param guestCount - Number of guests per student.
   * @returns Array of GraduationGuestGroup.
   */
  public static allocateGuestGroups(
    venue: Venue,
    teacherIds: string[],
    studentIds: string[],
    guestCount: number,
  ): GraduationGuestGroup[] {
    if (guestCount <= 0) return [];

    const excluded = new Set<string>([...teacherIds, ...studentIds]);
    const pools = GraduationAllocator.partitionFreeSeats(venue, excluded);
    const groups: GraduationGuestGroup[] = [];
    const labelCounts = new Map<string, number>();

    for (const [poolKey, seats] of Object.entries(pools)) {
      const sortedSeats = GraduationSeatSorter.sort(seats, poolKey);
      GraduationAllocator.processPool(
        poolKey,
        sortedSeats,
        guestCount,
        groups,
        labelCounts,
      );
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

    venue.sections.forEach((section: Section): void => {
      section.seats.forEach((seat: Seat): void => {
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
   * Processes a single seat pool to form guest groups.
   */
  private static processPool(
    poolKey: string,
    sortedSeats: Seat[],
    guestCount: number,
    groups: GraduationGuestGroup[],
    labelCounts: Map<string, number>,
  ): void {
    let index = 0;
    while (index < sortedSeats.length) {
      const chunk = sortedSeats.slice(index, index + guestCount);
      index += guestCount;

      const firstSeat = chunk[0];
      if (!firstSeat) break;

      const prefix = GraduationLocationLabeler.getLocationPrefix(firstSeat);
      const count = (labelCounts.get(prefix) || 0) + 1;
      labelCounts.set(prefix, count);

      const id = `graduation_guest_${poolKey}_group_${Date.now()}_${Math.floor(
        Math.random() * 1000,
      )}_${groups.length}`;
      const provisionalLabel = `${prefix} ${count}`;
      const seatIds = chunk.map((s: Seat): string => s.id);

      groups.push(new GraduationGuestGroup(id, provisionalLabel, seatIds));
    }
  }
}
