/**
 * Represents a group of guests associated with a student in Orla Mode.
 */
export class OrlaGuestGroup {
  /** Unique identifier of the guest group. */
  public readonly id: string;
  /** The provisional location-based label of the group. */
  public readonly provisionalLabel: string;
  /** List of seat IDs belonging to this guest group. */
  public readonly seatIds: string[];
  /** A custom name/label assigned by the organization, or null. */
  public customLabel: string | null;
  /** Whether this guest group is marked as occupied/claimed. */
  public isOccupied: boolean;

  /**
   * Constructs a new OrlaGuestGroup.
   *
   * @param id - Unique identifier.
   * @param provisionalLabel - Provisional location-based label.
   * @param seatIds - List of associated seat IDs.
   * @param isOccupied - Whether the group is occupied.
   * @param customLabel - Optional custom label.
   */
  constructor(
    id: string,
    provisionalLabel: string,
    seatIds: string[],
    isOccupied: boolean = false,
    customLabel: string | null = null,
  ) {
    this.id = id;
    this.provisionalLabel = provisionalLabel;
    this.seatIds = seatIds;
    this.isOccupied = isOccupied;
    this.customLabel = customLabel;
  }

  /**
   * Returns the active label for the group (custom if set, otherwise provisional).
   *
   * @returns The active label string.
   */
  public get label(): string {
    return this.customLabel || this.provisionalLabel;
  }
}
