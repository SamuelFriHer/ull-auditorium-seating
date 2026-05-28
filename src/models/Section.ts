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
}
