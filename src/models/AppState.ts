import { SelectionMode } from "../types";
import { Venue } from "./Venue";

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

  /**
   * Constructs a new AppState instance.
   *
   * @param venue - The venue model instance.
   * @param selectedSeatIds - Initial selected seats.
   * @param activeGroupId - Initial active group.
   * @param selectionMode - Initial selection mode.
   */
  constructor(
    venue: Venue,
    selectedSeatIds: string[] = [],
    activeGroupId: string | null = null,
    selectionMode: SelectionMode = SelectionMode.NONE,
  ) {
    this.venue = venue;
    this.selectedSeatIds = selectedSeatIds;
    this.activeGroupId = activeGroupId;
    this.selectionMode = selectionMode;
  }
}
