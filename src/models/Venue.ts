import { Section } from "./Section";
import { SeatGroup } from "./SeatGroup";
import { Seat } from "./Seat";

/**
 * Represents the complete auditorium venue containing sections and seat groups.
 */
export class Venue {
  /** Unique identifier of the venue. */
  public readonly id: string;
  /** Name of the venue. */
  public readonly name: string;
  /** The sections within the venue. */
  public readonly sections: Section[];
  /** The seating groups defined in the venue. */
  public readonly groups: SeatGroup[];

  /**
   * Constructs a new Venue instance.
   *
   * @param id - Venue identifier.
   * @param name - Venue name.
   * @param sections - Sections of the venue.
   * @param groups - Initial seating groups.
   */
  constructor(
    id: string,
    name: string,
    sections: Section[],
    groups: SeatGroup[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.sections = sections;
    this.groups = groups;
  }

  /**
   * Finds a seat by its ID within any section of the venue.
   *
   * @param id - Seat identifier.
   * @returns The matching Seat, or null if not found.
   */
  public getSeat(id: string): Seat | null {
    for (const section of this.sections) {
      const seat = section.getSeat(id);
      if (seat) {
        return seat;
      }
    }
    return null;
  }

  /**
   * Finds a section by its ID.
   *
   * @param id - Section identifier.
   * @returns The matching Section, or null if not found.
   */
  public getSection(id: string): Section | null {
    return this.sections.find((sec: Section): boolean => sec.id === id) || null;
  }

  /**
   * Finds a seat group by its ID.
   *
   * @param id - Group identifier.
   * @returns The matching SeatGroup, or null if not found.
   */
  public getGroup(id: string): SeatGroup | null {
    return (
      this.groups.find((group: SeatGroup): boolean => group.id === id) || null
    );
  }

  /**
   * Assigns a list of seats to a specific seating group.
   *
   * @param seatIds - List of seat IDs to assign.
   * @param gid - The target group identifier.
   */
  public assignSeatsToGroup(seatIds: string[], gid: string): void {
    const targetGroup = this.getGroup(gid);
    if (!targetGroup) {
      return;
    }

    this.unassignSeats(seatIds);

    for (const id of seatIds) {
      const seat = this.getSeat(id);
      if (seat) {
        seat.groupId = gid;
        if (!targetGroup.seatIds.includes(id)) {
          targetGroup.seatIds.push(id);
        }
      }
    }
  }

  /**
   * Removes assignment from a list of seats.
   *
   * @param seatIds - List of seat IDs to unassign.
   */
  public unassignSeats(seatIds: string[]): void {
    for (const id of seatIds) {
      const seat = this.getSeat(id);
      if (seat && seat.groupId) {
        const previousGroup = this.getGroup(seat.groupId);
        if (previousGroup) {
          previousGroup.seatIds = previousGroup.seatIds.filter(
            (sId: string): boolean => sId !== id,
          );
        }
        seat.groupId = null;
      }
    }
  }
}
