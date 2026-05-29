import { describe, it, expect } from "vitest";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { SectionType } from "../../src/types";
import { GraduationController } from "../../src/controllers/GraduationController";
import { GraduationGuestGroup } from "../../src/models/GraduationGuestGroup";

interface GraduationControllerTestContext {
  state: AppState;
  eventBus: EventBus;
  controller: GraduationController;
}

/**
 * Helper to build a test context with a standard venue setup.
 */
function createTestContext(): GraduationControllerTestContext {
  const seats: Seat[] = [
    // Teachers (Row A)
    new Seat("stalls-A-1", "A", 1, "stalls", 0, 0),
    new Seat("stalls-A-2", "A", 2, "stalls", 0, 0),
    // Students/Guests (Rows B, C, D)
    new Seat("stalls-B-1", "B", 1, "stalls", 0, 0),
    new Seat("stalls-B-3", "B", 3, "stalls", 0, 0),
    new Seat("stalls-C-1", "C", 1, "stalls", 0, 0),
    new Seat("stalls-C-3", "C", 3, "stalls", 0, 0),
    new Seat("stalls-D-1", "D", 1, "stalls", 0, 0),
    new Seat("stalls-D-3", "D", 3, "stalls", 0, 0),
  ];
  const section: Section = new Section(
    "stalls",
    "Patio",
    SectionType.STALLS,
    seats,
  );
  const venue: Venue = new Venue("v1", "Venue", [section]);
  const state: AppState = new AppState(venue);
  const eventBus: EventBus = new EventBus();
  const controller: GraduationController = new GraduationController(
    state,
    eventBus,
  );

  return { state, eventBus, controller };
}

describe("GraduationController - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should initialize Graduation state to defaults", (): void => {
      const context = createTestContext();
      expect(context.state.isGraduationMode).toBe(false);
      expect(context.state.graduationStudentCount).toBe(0);
      expect(context.state.graduationGuestCountPerStudent).toBe(0);
      expect(context.state.graduationGuestGroups.length).toBe(0);
    });

    it("should not reallocate when toggled off", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);
      expect(context.state.graduationGuestGroups.length).toBeGreaterThan(0);

      context.state.graduationGuestGroups = [];
      context.controller.handleToggle(false);
      expect(context.state.graduationGuestGroups).toEqual([]);
    });

    it("should return 0 max guests when studentCount is 0", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(0);
      expect(context.state.graduationMaxGuests).toBe(0);
    });

    it("should clear selection when selecting non-existent or null group", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      context.controller.handleGuestGroupSelect("non-existent-group");
      expect(context.state.selectedSeatIds).toEqual([]);

      context.state.selectedSeatIds = ["stalls-B-1"];
      context.controller.handleGuestGroupSelect(null);
      expect(context.state.selectedSeatIds).toEqual([]);
    });

    it("should do nothing when toggling a non-existent guest group", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      const previousGroups = JSON.stringify(
        context.state.graduationGuestGroups,
      );
      context.controller.handleGuestGroupToggle("invalid-id");
      expect(JSON.stringify(context.state.graduationGuestGroups)).toBe(
        previousGroups,
      );
    });

    it("should do nothing when modifying label of non-existent guest group", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      const previousGroups = JSON.stringify(
        context.state.graduationGuestGroups,
      );
      context.controller.handleGuestGroupLabelChange("invalid-id", "New Label");
      expect(JSON.stringify(context.state.graduationGuestGroups)).toBe(
        previousGroups,
      );
    });
  });

  describe("O - One", (): void => {
    it("should run reallocation when toggling active to true", (): void => {
      const context = createTestContext();
      context.state.graduationStudentCount = 1;
      context.state.graduationGuestCountPerStudent = 1;

      context.controller.handleToggle(true);
      expect(context.state.graduationGuestGroups.length).toBeGreaterThan(0);
    });

    it("should handle toggle off actions and reset active states", (): void => {
      const context = createTestContext();
      context.state.selectedSeatIds = ["stalls-B-1"];
      context.state.activeGroupId = "some-group";

      context.controller.handleToggle(false);
      expect(context.state.isGraduationMode).toBe(false);
      expect(context.state.selectedSeatIds).toEqual([]);
      expect(context.state.activeGroupId).toBeNull();
    });

    it("should toggle an occupied guest group to unoccupied", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      const targetGroup = context.state.graduationGuestGroups[0];
      context.controller.handleGuestGroupToggle(targetGroup.id);
      expect(targetGroup.isOccupied).toBe(true);

      context.controller.handleGuestGroupToggle(targetGroup.id);
      expect(targetGroup.isOccupied).toBe(false);
    });

    it("should set custom label to null when empty or whitespace is provided", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      const targetGroup = context.state.graduationGuestGroups[0];
      context.controller.handleGuestGroupLabelChange(targetGroup.id, "   ");
      expect(targetGroup.customLabel).toBeNull();
    });

    it("should not select a group when groupId is an empty string", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      context.state.graduationGuestGroups.push(
        new GraduationGuestGroup("", "Test Group", ["stalls-B-1"], false, null),
      );

      context.controller.handleGuestGroupSelect("");
      expect(context.state.selectedSeatIds).toEqual([]);
    });
  });

  describe("M - Many", (): void => {
    it("should toggle a non-first guest group to occupied and clear selected seats", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      expect(context.state.graduationGuestGroups.length).toBeGreaterThan(1);
      const targetGroup = context.state.graduationGuestGroups[1];
      context.state.selectedSeatIds = ["stalls-B-1"];

      context.controller.handleGuestGroupToggle(targetGroup.id);
      expect(targetGroup.isOccupied).toBe(true);
      expect(context.state.selectedSeatIds).toEqual([]);
    });

    it("should change custom label of non-first group and trim whitespace", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      const targetGroup = context.state.graduationGuestGroups[1];
      context.controller.handleGuestGroupLabelChange(
        targetGroup.id,
        "  Jane Doe  ",
      );
      expect(targetGroup.customLabel).toBe("Jane Doe");
    });

    it("should select first and non-first guest groups", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      const firstGroup = context.state.graduationGuestGroups[0];
      const secondGroup = context.state.graduationGuestGroups[1];

      context.controller.handleGuestGroupSelect(firstGroup.id);
      expect(context.state.selectedSeatIds).toEqual([...firstGroup.seatIds]);

      context.controller.handleGuestGroupSelect(secondGroup.id);
      expect(context.state.selectedSeatIds).toEqual([...secondGroup.seatIds]);
    });
  });

  describe("B - Boundary", (): void => {
    it("should ignore disabled seats in max guests calculation", (): void => {
      const seats: Seat[] = [
        new Seat("stalls-A-1", "A", 1, "stalls", 0, 0),
        new Seat("stalls-B-1", "B", 1, "stalls", 0, 0),
        new Seat("stalls-B-21", "B", 21, "stalls", 0, 0),
        new Seat("stalls-C-1", "C", 1, "stalls", 0, 0),
      ];
      expect(seats[2].isDisabled).toBe(true);

      const section: Section = new Section(
        "stalls",
        "Patio",
        SectionType.STALLS,
        seats,
      );
      const venue: Venue = new Venue("v1", "Venue", [section]);
      const state: AppState = new AppState(venue);
      const eventBus: EventBus = new EventBus();
      const controller: GraduationController = new GraduationController(
        state,
        eventBus,
      );

      controller.handleToggle(true);
      controller.handleStudentsChange(1);
      expect(state.graduationMaxGuests).toBe(1);
    });

    it("should divide free seats by studentCount when studentCount is greater than 1", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(2);
      expect(context.state.graduationMaxGuests).toBe(2);
    });
  });

  describe("I - Interface", (): void => {
    it("should handle graduation:toggle event", (): void => {
      const context = createTestContext();
      let isUpdatedCalled = false;
      context.eventBus.on("venue:updated", (): void => {
        isUpdatedCalled = true;
      });

      context.eventBus.emit("graduation:toggle", { active: true });
      expect(context.state.isGraduationMode).toBe(true);
      expect(isUpdatedCalled).toBe(true);
    });

    it("should handle graduation:students-change event", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      let isUpdatedCalled = false;
      context.eventBus.on("venue:updated", (): void => {
        isUpdatedCalled = true;
      });

      context.eventBus.emit("graduation:students-change", { count: 1 });
      expect(context.state.graduationStudentCount).toBe(1);
      expect(isUpdatedCalled).toBe(true);
    });

    it("should handle graduation:guests-change event", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      let isUpdatedCalled = false;
      context.eventBus.on("venue:updated", (): void => {
        isUpdatedCalled = true;
      });

      context.eventBus.emit("graduation:guests-change", { count: 1 });
      expect(context.state.graduationGuestCountPerStudent).toBe(1);
      expect(isUpdatedCalled).toBe(true);
    });

    it("should handle graduation:guest-group-toggle event", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      const targetGroupId = context.state.graduationGuestGroups[0].id;
      let isUpdatedCalled = false;
      context.eventBus.on("venue:updated", (): void => {
        isUpdatedCalled = true;
      });

      context.eventBus.emit("graduation:guest-group-toggle", {
        groupId: targetGroupId,
      });
      expect(context.state.graduationGuestGroups[0].isOccupied).toBe(true);
      expect(isUpdatedCalled).toBe(true);
    });

    it("should handle graduation:guest-group-label-change event", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      const targetGroupId = context.state.graduationGuestGroups[0].id;
      let isUpdatedCalled = false;
      context.eventBus.on("venue:updated", (): void => {
        isUpdatedCalled = true;
      });

      context.eventBus.emit("graduation:guest-group-label-change", {
        groupId: targetGroupId,
        label: "Jane Doe",
      });
      expect(context.state.graduationGuestGroups[0].customLabel).toBe(
        "Jane Doe",
      );
      expect(isUpdatedCalled).toBe(true);
    });

    it("should handle graduation:guest-group-select event", (): void => {
      const context = createTestContext();
      context.controller.handleToggle(true);
      context.controller.handleStudentsChange(1);
      context.controller.handleGuestsChange(1);

      const targetGroupId = context.state.graduationGuestGroups[0].id;
      let isUpdatedCalled = false;
      context.eventBus.on("venue:updated", (): void => {
        isUpdatedCalled = true;
      });

      context.eventBus.emit("graduation:guest-group-select", {
        groupId: targetGroupId,
      });
      expect(context.state.selectedSeatIds.length).toBeGreaterThan(0);
      expect(isUpdatedCalled).toBe(true);
    });
  });

  describe("E - Exceptional", (): void => {
    it("should clear selectedSeatIds and activeGroupId when toggled true", (): void => {
      const context = createTestContext();
      context.state.selectedSeatIds = ["stalls-B-1"];
      context.state.activeGroupId = "some-group";

      context.controller.handleToggle(true);
      expect(context.state.selectedSeatIds).toEqual([]);
      expect(context.state.activeGroupId).toBeNull();
    });
  });

  describe("S - Simple", (): void => {
    it("should hold a reference to state and eventBus", (): void => {
      const context = createTestContext();
      const internalObj = context.controller as unknown as {
        state: AppState;
        eventBus: EventBus;
      };
      expect(internalObj.state).toBe(context.state);
      expect(internalObj.eventBus).toBe(context.eventBus);
    });
  });
});
