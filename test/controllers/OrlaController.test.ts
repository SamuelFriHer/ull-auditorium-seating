import { describe, it, expect } from "vitest";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { SectionType } from "../../src/types";
import { OrlaController } from "../../src/controllers/OrlaController";

describe("OrlaController Test Suite", (): void => {
  it("should initialize Orla state and handle toggle actions", (): void => {
    const seats = [
      new Seat("stalls-A-1", "A", 1, "stalls", 0, 0),
      new Seat("stalls-B-1", "B", 1, "stalls", 0, 0),
      new Seat("stalls-B-3", "B", 3, "stalls", 0, 0),
    ];
    const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
    const venue = new Venue("v1", "Venue", [section]);
    const state = new AppState(venue);
    const eventBus = new EventBus();
    const controller = new OrlaController(state, eventBus);

    expect(state.isOrlaMode).toBe(false);

    // Toggle on
    controller.handleToggle(true);
    expect(state.isOrlaMode).toBe(true);

    // Initial student and guest counts
    expect(state.orlaStudentCount).toBe(0);
    expect(state.orlaGuestCountPerStudent).toBe(0);
    expect(state.orlaGuestGroups.length).toBe(0);
  });

  it("should recalculate groups when student and guest counts change", (): void => {
    const seats = [
      new Seat("stalls-A-1", "A", 1, "stalls", 0, 0), // Teacher
      new Seat("stalls-B-1", "B", 1, "stalls", 0, 0), // Odd B
      new Seat("stalls-B-3", "B", 3, "stalls", 0, 0), // Odd B
      new Seat("stalls-C-1", "C", 1, "stalls", 0, 0), // Odd C
      new Seat("stalls-C-3", "C", 3, "stalls", 0, 0), // Odd C
    ];
    const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
    const venue = new Venue("v1", "Venue", [section]);
    const state = new AppState(venue);
    const eventBus = new EventBus();
    const controller = new OrlaController(state, eventBus);

    controller.handleToggle(true);

    // Set students = 1
    // Student gets stalls-B-1 and stalls-B-3 (the whole B Odd half-row)
    // Free seats remaining = stalls-C-1, stalls-C-3 (2 seats)
    // Max guests per student = Math.floor(2 / 1) = 2
    controller.handleStudentsChange(1);
    expect(state.orlaStudentCount).toBe(1);
    expect(state.orlaMaxGuests).toBe(2);

    // Set guests = 2
    // Guest groups should contain G=2 seats (one group of 2)
    controller.handleGuestsChange(2);
    expect(state.orlaGuestCountPerStudent).toBe(2);
    expect(state.orlaGuestGroups.length).toBe(1);

    // Set guests to 5 (exceeds max 2, should be capped at 2)
    controller.handleGuestsChange(5);
    expect(state.orlaGuestCountPerStudent).toBe(2);
  });

  it("should support toggling occupancy and editing custom labels on guest groups", (): void => {
    const seats = [
      new Seat("stalls-B-1", "B", 1, "stalls", 0, 0),
      new Seat("stalls-B-3", "B", 3, "stalls", 0, 0),
      new Seat("stalls-C-1", "C", 1, "stalls", 0, 0),
      new Seat("stalls-C-3", "C", 3, "stalls", 0, 0),
    ];
    const section = new Section("stalls", "Patio", SectionType.STALLS, seats);
    const venue = new Venue("v1", "Venue", [section]);
    const state = new AppState(venue);
    const eventBus = new EventBus();
    const controller = new OrlaController(state, eventBus);

    controller.handleToggle(true);
    controller.handleStudentsChange(1); // 1 student, gets B-1 and B-3
    controller.handleGuestsChange(1); // 1 guest per student, gets C-3 and C-1 as groups

    expect(state.orlaGuestGroups.length).toBe(2);
    const group = state.orlaGuestGroups[0];
    expect(group.isOccupied).toBe(false);
    expect(group.customLabel).toBeNull();

    // Toggle occupied
    controller.handleGuestGroupToggle(group.id);
    expect(group.isOccupied).toBe(true);

    // Change label
    controller.handleGuestGroupLabelChange(group.id, "Juan Pérez");
    expect(group.customLabel).toBe("Juan Pérez");
    expect(group.label).toBe("Juan Pérez");
  });
});
