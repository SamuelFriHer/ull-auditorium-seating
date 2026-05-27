import { SelectionMode } from "../types";
import { Venue } from "./Venue";
import { GraduationGuestGroup } from "./GraduationGuestGroup";

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

  /** Whether Graduation Mode is active. */
  public isGraduationMode: boolean;
  /** Number of students participating in the Graduation event. */
  public graduationStudentCount: number;
  /** Number of guest invitations allocated per student. */
  public graduationGuestCountPerStudent: number;
  /** List of dynamically generated guest invitation groups. */
  public graduationGuestGroups: GraduationGuestGroup[];
  /** Maximum number of guest invitations allowed per student. */
  public graduationMaxGuests: number;

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

    this.isGraduationMode = false;
    this.graduationStudentCount = 0;
    this.graduationGuestCountPerStudent = 0;
    this.graduationGuestGroups = [];
    this.graduationMaxGuests = 0;
  }
}
