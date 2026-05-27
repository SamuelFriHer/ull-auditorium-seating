import type { AppState } from "../models/AppState";
import type { Seat } from "../models/Seat";
import type { SeatGroup } from "../models/SeatGroup";
import type { OrlaGuestGroup } from "../models/OrlaGuestGroup";
import { OrlaAllocator } from "./OrlaAllocator";

/**
 * Resolves seat colors based on active mode and state.
 */
export class SeatColorResolver {
  private readonly isOrlaMode: boolean;
  private readonly groupColorMap: Map<string, string>;
  private readonly teacherSeats: Set<string>;
  private readonly studentSeats: Set<string>;
  private readonly guestColors: Map<string, string>;

  /**
   * Initializes a SeatColorResolver instance.
   *
   * @param state - The active application state.
   */
  constructor(state: AppState) {
    this.isOrlaMode = state.isOrlaMode;
    this.groupColorMap = new Map<string, string>();
    this.teacherSeats = new Set<string>();
    this.studentSeats = new Set<string>();
    this.guestColors = new Map<string, string>();

    if (this.isOrlaMode) {
      this.initOrlaMode(state);
    } else {
      this.initStandardMode(state);
    }
  }

  /**
   * Resolves the color of a specific seat.
   *
   * @param seat - The seat model.
   * @returns The CSS color variable or hex string, or null.
   */
  public resolveColor(seat: Seat): string | null {
    if (this.isOrlaMode) {
      if (this.teacherSeats.has(seat.id)) {
        return "var(--color-orla-teacher)";
      }
      if (this.studentSeats.has(seat.id)) {
        return "var(--color-orla-student)";
      }
      return this.guestColors.get(seat.id) || null;
    }

    if (seat.groupId) {
      return this.groupColorMap.get(seat.groupId) || null;
    }
    return null;
  }

  private initStandardMode(state: AppState): void {
    state.venue.groups.forEach((group: SeatGroup): void => {
      this.groupColorMap.set(group.id, group.color);
    });
  }

  private initOrlaMode(state: AppState): void {
    const venue = state.venue;
    OrlaAllocator.getTeacherSeatIds(venue).forEach((id: string): void => {
      this.teacherSeats.add(id);
    });
    OrlaAllocator.getStudentSeatIds(venue, state.orlaStudentCount).forEach(
      (id: string): void => {
        this.studentSeats.add(id);
      },
    );
    state.orlaGuestGroups.forEach((group: OrlaGuestGroup): void => {
      const color: string = group.isOccupied
        ? "var(--color-orla-guest-occupied)"
        : "var(--color-orla-guest-free)";
      group.seatIds.forEach((seatId: string): void => {
        this.guestColors.set(seatId, color);
      });
    });
  }
}
