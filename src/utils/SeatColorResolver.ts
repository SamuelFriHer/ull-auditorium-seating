import type { AppState } from "../models/AppState";
import type { Seat } from "../models/Seat";
import type { SeatGroup } from "../models/SeatGroup";
import type { GraduationGuestGroup } from "../models/GraduationGuestGroup";
import { GraduationAllocator } from "./GraduationAllocator";

/**
 * Resolves seat colors based on active mode and state.
 */
export class SeatColorResolver {
  private readonly isGraduationMode: boolean;
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
    this.isGraduationMode = state.isGraduationMode;
    this.groupColorMap = new Map<string, string>();
    this.teacherSeats = new Set<string>();
    this.studentSeats = new Set<string>();
    this.guestColors = new Map<string, string>();

    if (this.isGraduationMode) {
      this.initGraduationMode(state);
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
    if (this.isGraduationMode) {
      if (this.teacherSeats.has(seat.id)) {
        return "var(--color-graduation-teacher)";
      }
      if (this.studentSeats.has(seat.id)) {
        return "var(--color-graduation-student)";
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

  private initGraduationMode(state: AppState): void {
    const venue = state.venue;
    GraduationAllocator.getTeacherSeatIds(venue).forEach((id: string): void => {
      this.teacherSeats.add(id);
    });
    GraduationAllocator.getStudentSeatIds(venue, state.graduationStudentCount).forEach(
      (id: string): void => {
        this.studentSeats.add(id);
      },
    );
    state.graduationGuestGroups.forEach((group: GraduationGuestGroup): void => {
      const color: string = group.isOccupied
        ? "var(--color-graduation-guest-occupied)"
        : "var(--color-graduation-guest-free)";
      group.seatIds.forEach((seatId: string): void => {
        this.guestColors.set(seatId, color);
      });
    });
  }
}
