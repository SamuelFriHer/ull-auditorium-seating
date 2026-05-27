/**
 * Represents a single seat in the venue.
 */
export class Seat {
  /** The unique identifier of the seat. */
  public readonly id: string;
  /** The row label of the seat. */
  public readonly row: string;
  /** The number of the seat. */
  public readonly number: number;
  /** The ID of the section this seat belongs to. */
  public readonly sectionId: string;
  /** The X coordinate for visualization. */
  public readonly x: number;
  /** The Y coordinate for visualization. */
  public readonly y: number;
  /** The ID of the group this seat is assigned to, or null if unassigned. */
  public groupId: string | null;
  /** Whether the seat is structurally disabled. */
  public readonly isDisabled: boolean;

  /**
   * Constructs a new Seat instance.
   *
   * @param id - Unique identifier.
   * @param row - Row label.
   * @param number - Seat number.
   * @param sectionId - Parent section identifier.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param groupId - Associated group identifier.
   */
  constructor(
    id: string,
    row: string,
    number: number,
    sectionId: string,
    x: number,
    y: number,
    groupId: string | null = null,
  ) {
    this.id = id;
    this.row = row;
    this.number = number;
    this.sectionId = sectionId;
    this.x = x;
    this.y = y;
    this.groupId = groupId;
    this.isDisabled = Seat.checkDisabled(sectionId, row, number);
  }

  /**
   * Checks if a seat is structurally disabled in the Paraninfo venue.
   */
  private static checkDisabled(
    sectionId: string,
    row: string,
    num: number,
  ): boolean {
    if (sectionId !== "stalls") {
      return false;
    }
    if (row === "B" && (num === 21 || num === 22)) {
      return true;
    }
    if ((row === "C" || row === "D") && (num === 23 || num === 24)) {
      return true;
    }
    return false;
  }
}
