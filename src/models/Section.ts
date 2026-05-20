import { SectionType } from "../types";
import { Seat } from "./Seat";

/**
 * Represents a distinct section within the auditorium.
 */
export class Section {
  /** The unique identifier of the section. */
  public readonly id: string;
  /** The name of the section. */
  public readonly name: string;
  /** The type of the section. */
  public readonly type: SectionType;
  /** The list of seats within this section. */
  public readonly seats: Seat[];

  /**
   * Constructs a new Section instance.
   *
   * @param id - Section identifier.
   * @param name - Section name.
   * @param type - Section type.
   * @param seats - Seats belonging to this section.
   */
  constructor(id: string, name: string, type: SectionType, seats: Seat[]) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.seats = seats;
  }

  /**
   * Finds a seat within the section by its ID.
   *
   * @param id - The seat identifier to look for.
   * @returns The matching Seat, or null if not found.
   */
  public getSeat(id: string): Seat | null {
    return this.seats.find((seat: Seat): boolean => seat.id === id) || null;
  }

  /**
   * Retrieves all seats belonging to a specific row in the section.
   *
   * @param row - The row label.
   * @returns An array of matching Seat instances.
   */
  public getSeatsInRow(row: string): Seat[] {
    return this.seats.filter((seat: Seat): boolean => seat.row === row);
  }
}
