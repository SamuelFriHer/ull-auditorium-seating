import { AppState } from "../models/AppState";
import { EventBus } from "../events/EventBus";
import { GraduationAllocator } from "../utils/GraduationAllocator";

/**
 * Controller managing operations and state transitions for Graduation Mode.
 */
export class GraduationController {
  private readonly state: AppState;
  private readonly eventBus: EventBus;

  /**
   * Initializes a new GraduationController and binds events.
   *
   * @param state - The global application state.
   * @param eventBus - The shared event bus.
   */
  constructor(state: AppState, eventBus: EventBus) {
    this.state = state;
    this.eventBus = eventBus;
    this.subscribeToEvents();
  }

  /**
   * Toggles the Graduation Mode active state.
   */
  public handleToggle(active: boolean): void {
    this.state.isGraduationMode = active;
    this.state.selectedSeatIds = [];
    this.state.activeGroupId = null;

    if (active) {
      this.reallocate();
    }
    this.eventBus.emit("venue:updated");
  }

  /**
   * Updates the student count and triggers reallocation.
   */
  public handleStudentsChange(count: number): void {
    this.state.graduationStudentCount = Math.max(0, count);
    this.reallocate();
    this.eventBus.emit("venue:updated");
  }

  /**
   * Updates the guest count per student and triggers reallocation.
   */
  public handleGuestsChange(count: number): void {
    const maxGuests = this.calculateMaxGuests();
    this.state.graduationGuestCountPerStudent = Math.min(
      maxGuests,
      Math.max(0, count),
    );
    this.reallocate();
    this.eventBus.emit("venue:updated");
  }

  /**
   * Toggles a guest group's occupied status.
   */
  public handleGuestGroupToggle(groupId: string): void {
    const group = this.state.graduationGuestGroups.find((g) => g.id === groupId);
    if (group) {
      if (!group.isOccupied) {
        group.isOccupied = true;
        this.state.selectedSeatIds = [];
      } else {
        group.isOccupied = false;
      }
      this.eventBus.emit("venue:updated");
    }
  }

  /**
   * Updates a guest group's custom label.
   */
  public handleGuestGroupLabelChange(groupId: string, label: string): void {
    const group = this.state.graduationGuestGroups.find((g) => g.id === groupId);
    if (group) {
      group.customLabel = label.trim() || null;
      this.eventBus.emit("venue:updated");
    }
  }

  /**
   * Subscribes the controller to related events.
   */
  private subscribeToEvents(): void {
    this.eventBus.on("graduation:toggle", (payload): void => {
      this.handleToggle(payload.active);
    });
    this.eventBus.on("graduation:students-change", (payload): void => {
      this.handleStudentsChange(payload.count);
    });
    this.eventBus.on("graduation:guests-change", (payload): void => {
      this.handleGuestsChange(payload.count);
    });
    this.eventBus.on("graduation:guest-group-toggle", (payload): void => {
      this.handleGuestGroupToggle(payload.groupId);
    });
    this.eventBus.on("graduation:guest-group-label-change", (payload): void => {
      this.handleGuestGroupLabelChange(payload.groupId, payload.label);
    });
    this.eventBus.on("graduation:guest-group-select", (payload): void => {
      this.handleGuestGroupSelect(payload.groupId);
    });
  }

  /**
   * Handles selecting a guest group by ID.
   */
  public handleGuestGroupSelect(groupId: string | null): void {
    if (groupId) {
      const group = this.state.graduationGuestGroups.find((g) => g.id === groupId);
      this.state.selectedSeatIds = group ? [...group.seatIds] : [];
    } else {
      this.state.selectedSeatIds = [];
    }
    this.eventBus.emit("venue:updated");
  }

  /**
   * Performs dynamic seating reallocation for Graduation Mode.
   */
  private reallocate(): void {
    const venue = this.state.venue;
    const teachers = GraduationAllocator.getTeacherSeatIds(venue);
    const students = GraduationAllocator.getStudentSeatIds(
      venue,
      this.state.graduationStudentCount,
    );

    // Limit guest count to maximum possible based on remaining seats
    const maxGuests = this.calculateMaxGuestsForLists(teachers, students);
    this.state.graduationMaxGuests = maxGuests;
    this.state.graduationGuestCountPerStudent = Math.min(
      this.state.graduationGuestCountPerStudent,
      maxGuests,
    );

    this.state.graduationGuestGroups = GraduationAllocator.allocateGuestGroups(
      venue,
      teachers,
      students,
      this.state.graduationGuestCountPerStudent,
    );
  }

  /**
   * Calculates the maximum guest count based on current state.
   */
  private calculateMaxGuests(): number {
    const venue = this.state.venue;
    const teachers = GraduationAllocator.getTeacherSeatIds(venue);
    const students = GraduationAllocator.getStudentSeatIds(
      venue,
      this.state.graduationStudentCount,
    );
    return this.calculateMaxGuestsForLists(teachers, students);
  }

  /**
   * Helper to calculate max guests given teachers and student seat lists.
   */
  private calculateMaxGuestsForLists(
    teachers: string[],
    students: string[],
  ): number {
    const totalUsableSeats = this.state.venue.sections.reduce(
      (sum, sec) => sum + sec.seats.filter((s) => !s.isDisabled).length,
      0,
    );
    const freeSeats = totalUsableSeats - teachers.length - students.length;
    const studentCount = this.state.graduationStudentCount;
    return studentCount > 0 ? Math.floor(freeSeats / studentCount) : 0;
  }
}
