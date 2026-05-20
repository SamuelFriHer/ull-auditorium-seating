/**
 * Represents a group of seats with a label and color.
 */
export class SeatGroup {
  /** The unique identifier of the seat group. */
  public readonly id: string;
  /** The human-readable label of the group. */
  public label: string;
  /** The color of the group (hex/css value). */
  public color: string;
  /** The list of seat IDs belonging to this group. */
  public seatIds: string[];

  /**
   * Constructs a new SeatGroup instance.
   *
   * @param id - Unique identifier.
   * @param label - Group label.
   * @param color - Group color representation.
   * @param seatIds - List of seat IDs.
   */
  constructor(
    id: string,
    label: string,
    color: string,
    seatIds: string[] = [],
  ) {
    this.id = id;
    this.label = label;
    this.color = color;
    this.seatIds = seatIds;
  }
}
