import { SelectionMode } from "../types";
import { Venue } from "./Venue";
import { OrlaGuestGroup } from "./OrlaGuestGroup";

/**
 * Manages the global state of the application.
 */
export class AppState {
  /** The active venue instance containing layout and groups. */
  public venue: Venue;
  /** List of currently selected seat IDs. */
  public selectedSeatIds: string[];
  /** The currently active group ID for assignment/edition, or null. */
  public activeGroupId: string | null;
  /** The current mode of selection (single, drag, none). */
  public selectionMode: SelectionMode;
  /** The currently active floor (0, 1, or 2). */
  public activeFloor: number;

  /** Whether Orla Mode is active. */
  public isOrlaMode: boolean;
  /** Number of students participating in the Orla event. */
  public orlaStudentCount: number;
  /** Number of guest invitations allocated per student. */
  public orlaGuestCountPerStudent: number;
  /** List of dynamically generated guest invitation groups. */
  public orlaGuestGroups: OrlaGuestGroup[];
  /** Maximum number of guest invitations allowed per student. */
  public orlaMaxGuests: number;

  /**
   * Constructs a new AppState instance.
   *
   * @param venue - The venue model instance.
   * @param selectedSeatIds - Initial selected seats.
   * @param activeGroupId - Initial active group.
   * @param selectionMode - Initial selection mode.
   * @param activeFloor - Initial active floor (0, 1, 2).
   */
  constructor(
    venue: Venue,
    selectedSeatIds: string[] = [],
    activeGroupId: string | null = null,
    selectionMode: SelectionMode = SelectionMode.NONE,
    activeFloor: number = 0,
  ) {
    this.venue = venue;
    this.selectedSeatIds = selectedSeatIds;
    this.activeGroupId = activeGroupId;
    this.selectionMode = selectionMode;
    this.activeFloor = activeFloor;

    this.isOrlaMode = false;
    this.orlaStudentCount = 0;
    this.orlaGuestCountPerStudent = 0;
    this.orlaGuestGroups = [];
    this.orlaMaxGuests = 0;
  }
}
