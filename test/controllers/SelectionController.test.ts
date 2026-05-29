import { describe, it, expect } from "vitest";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";
import { SelectionController } from "../../src/controllers/SelectionController";
import { SectionType, SelectionMode } from "../../src/types";
import { GraduationGuestGroup } from "../../src/models/GraduationGuestGroup";

describe("SelectionController - ZOMBIES", (): void => {
  /**
   * Creates a default test environment with required models and controller.
   */
  const createTestEnvironment = (): {
    state: AppState;
    eventBus: EventBus;
    controller: SelectionController;
  } => {
    const seat1 = new Seat("s1", "A", 1, "stalls", 10, 20);
    const seat2 = new Seat("s2", "A", 3, "stalls", 30, 20);
    const seat3 = new Seat("s3", "A", 5, "stalls", 50, 20);
    const disabledSeat = new Seat("disabled_s", "B", 21, "stalls", 70, 20);
    const section = new Section("stalls", "Section 1", SectionType.STALLS, [
      seat1,
      seat2,
      seat3,
      disabledSeat,
    ]);
    const venue = new Venue("v1", "Venue 1", [section]);
    const state = new AppState(venue);
    const eventBus = new EventBus();
    const controller = new SelectionController(state, eventBus);

    return { state, eventBus, controller };
  };

  describe("Z - Zero", (): void => {
    it("should initialize with correct default values", (): void => {
      const { controller } = createTestEnvironment();
      const privates = controller as unknown as {
        dragStartSeatId: string | null;
        isSelecting: boolean;
        hasDragged: boolean;
      };
      expect(privates.dragStartSeatId).toBeNull();
      expect(privates.isSelecting).toBe(true);
      expect(privates.hasDragged).toBe(false);
    });

    it("should keep selection empty on drag-start until first drag-over occurs", (): void => {
      const { state, eventBus } = createTestEnvironment();
      eventBus.emit("seat:drag-start", { seatId: "s1" });
      expect(state.selectedSeatIds).toEqual([]);
    });

    it("should reset state to zero selected seats when clear event is received", (): void => {
      const { state, eventBus } = createTestEnvironment();
      state.selectedSeatIds = ["s1", "s2"];
      state.selectionMode = SelectionMode.SINGLE;

      eventBus.emit("selection:clear");
      expect(state.selectedSeatIds).toEqual([]);
      expect(state.selectionMode).toBe(SelectionMode.NONE);
    });
  });

  describe("O - One", (): void => {
    it("should toggle exactly one seat on individual click", (): void => {
      const { state, eventBus } = createTestEnvironment();

      eventBus.emit("seat:click", { seatId: "s1" });
      expect(state.selectedSeatIds).toEqual(["s1"]);
      expect(state.selectionMode).toBe(SelectionMode.SINGLE);

      eventBus.emit("seat:click", { seatId: "s1" });
      expect(state.selectedSeatIds).toEqual([]);
    });
  });

  describe("M - Many", (): void => {
    it("should handle multi-seat selection sequence via drag events", (): void => {
      const { state, eventBus } = createTestEnvironment();

      eventBus.emit("seat:drag-start", { seatId: "s1" });
      eventBus.emit("seat:drag-over", { seatId: "s2" });
      expect(state.selectedSeatIds).toEqual(["s1", "s2"]);

      eventBus.emit("seat:drag-end");
      expect(state.selectionMode).toBe(SelectionMode.NONE);
    });

    it("should not re-add start seat if removed from selection externally during drag", (): void => {
      const { state, eventBus } = createTestEnvironment();

      eventBus.emit("seat:drag-start", { seatId: "s1" });
      eventBus.emit("seat:drag-over", { seatId: "s2" });
      expect(state.selectedSeatIds).toEqual(["s1", "s2"]);

      // Simulate external removal of start seat
      state.selectedSeatIds = ["s2"];

      eventBus.emit("seat:drag-over", { seatId: "s2" });
      expect(state.selectedSeatIds).toEqual(["s2"]);
    });

    it("should support dragging to deselect seats without selecting unselected seats", (): void => {
      const { state, eventBus } = createTestEnvironment();
      state.selectedSeatIds = ["s1", "s2"];

      eventBus.emit("seat:drag-start", { seatId: "s1" });
      eventBus.emit("seat:drag-over", { seatId: "s2" });
      eventBus.emit("seat:drag-over", { seatId: "s3" });
      expect(state.selectedSeatIds).toEqual([]);
    });

    it("should correctly deselect seat at non-zero index during drag", (): void => {
      const { state, eventBus } = createTestEnvironment();
      state.selectedSeatIds = ["s1", "s2", "s3"];

      eventBus.emit("seat:drag-start", { seatId: "s1" });
      eventBus.emit("seat:drag-over", { seatId: "s3" });
      expect(state.selectedSeatIds).toEqual(["s2"]);
    });
  });

  describe("B - Boundary", (): void => {
    it("should transition selection mode state correctly across actions", (): void => {
      const { state, eventBus } = createTestEnvironment();
      expect(state.selectionMode).toBe(SelectionMode.NONE);

      eventBus.emit("seat:drag-start", { seatId: "s1" });
      expect(state.selectionMode).toBe(SelectionMode.DRAG);

      eventBus.emit("seat:drag-end");
      expect(state.selectionMode).toBe(SelectionMode.NONE);
    });

    it("should reset drag state variables on drag-end", (): void => {
      const { controller, eventBus } = createTestEnvironment();
      eventBus.emit("seat:drag-start", { seatId: "s1" });
      eventBus.emit("seat:drag-over", { seatId: "s2" });

      eventBus.emit("seat:drag-end");

      const privates = controller as unknown as {
        dragStartSeatId: string | null;
        hasDragged: boolean;
      };
      expect(privates.dragStartSeatId).toBeNull();
      expect(privates.hasDragged).toBe(false);
    });
  });

  describe("I - Interface", (): void => {
    it("should establish controller existence and structure", (): void => {
      const { controller } = createTestEnvironment();
      expect(controller).toBeDefined();
    });
  });

  describe("E - Exceptional", (): void => {
    it("should ignore drag-over events when selection mode is not DRAG", (): void => {
      const { state, eventBus } = createTestEnvironment();
      eventBus.emit("seat:drag-over", { seatId: "s1" });
      expect(state.selectedSeatIds).toEqual([]);
    });

    it("should ignore clicking non-existent or disabled seats", (): void => {
      const { state, eventBus } = createTestEnvironment();

      eventBus.emit("seat:click", { seatId: "non-existent" });
      expect(state.selectedSeatIds).toEqual([]);

      eventBus.emit("seat:click", { seatId: "disabled_s" });
      expect(state.selectedSeatIds).toEqual([]);
    });

    it("should ignore clicks on disabled seats in Graduation Mode", (): void => {
      const { state, eventBus } = createTestEnvironment();
      state.isGraduationMode = true;
      state.graduationGuestGroups = [
        new GraduationGuestGroup("g1", "Group 1", ["disabled_s"]),
      ];

      eventBus.emit("seat:click", { seatId: "disabled_s" });
      expect(state.selectedSeatIds).toEqual([]);
    });

    it("should ignore drag-start on non-existent or disabled seats", (): void => {
      const { state, eventBus, controller } = createTestEnvironment();

      eventBus.emit("seat:drag-start", { seatId: "non-existent" });
      expect(state.selectionMode).toBe(SelectionMode.NONE);
      expect(
        (controller as unknown as { dragStartSeatId: string | null })
          .dragStartSeatId,
      ).toBeNull();

      eventBus.emit("seat:drag-start", { seatId: "disabled_s" });
      expect(state.selectionMode).toBe(SelectionMode.NONE);
      expect(
        (controller as unknown as { dragStartSeatId: string | null })
          .dragStartSeatId,
      ).toBeNull();
    });

    it("should ignore drag-over on non-existent or disabled seats", (): void => {
      const { state, eventBus } = createTestEnvironment();
      eventBus.emit("seat:drag-start", { seatId: "s1" });

      eventBus.emit("seat:drag-over", { seatId: "non-existent" });
      expect(state.selectedSeatIds).toEqual([]);

      eventBus.emit("seat:drag-over", { seatId: "disabled_s" });
      expect(state.selectedSeatIds).toEqual([]);
    });

    it("should ignore drag-start in Graduation Mode", (): void => {
      const { state, eventBus, controller } = createTestEnvironment();
      state.isGraduationMode = true;

      eventBus.emit("seat:drag-start", { seatId: "s1" });
      expect(state.selectionMode).toBe(SelectionMode.NONE);
      expect(
        (controller as unknown as { dragStartSeatId: string | null })
          .dragStartSeatId,
      ).toBeNull();
    });

    it("should ignore drag-over in Graduation Mode", (): void => {
      const { state, eventBus, controller } = createTestEnvironment();
      (
        controller as unknown as { dragStartSeatId: string | null }
      ).dragStartSeatId = "s1";
      state.isGraduationMode = true;

      eventBus.emit("seat:drag-over", { seatId: "s2" });
      expect(state.selectedSeatIds).toEqual([]);
    });
  });

  describe("S - Simple", (): void => {
    it("should trigger venue update event on click toggle", (): void => {
      const { eventBus } = createTestEnvironment();
      let triggered = 0;
      eventBus.on("venue:updated", (): void => {
        triggered++;
      });

      eventBus.emit("seat:click", { seatId: "s1" });
      expect(triggered).toBe(1);
    });

    it("should trigger venue update event on drag-over and selection clear", (): void => {
      const { eventBus, state } = createTestEnvironment();
      let updates = 0;
      eventBus.on("venue:updated", (): void => {
        updates++;
      });

      eventBus.emit("seat:drag-start", { seatId: "s1" });
      eventBus.emit("seat:drag-over", { seatId: "s2" });
      expect(updates).toBe(1);

      state.selectionMode = SelectionMode.SINGLE;
      eventBus.emit("selection:clear");
      expect(updates).toBe(2);
    });

    it("should select group and emit event when clicking unselected guest group in Graduation Mode", (): void => {
      const { state, eventBus } = createTestEnvironment();
      state.isGraduationMode = true;
      const group = new GraduationGuestGroup("g1", "Group 1", ["s1", "s2"]);
      state.graduationGuestGroups = [group];

      let payload: { groupId: string | null } | null = null;
      eventBus.on(
        "graduation:guest-group-select",
        (p: { groupId: string | null }): void => {
          payload = p;
        },
      );

      let venueUpdated = false;
      eventBus.on("venue:updated", (): void => {
        venueUpdated = true;
      });

      eventBus.emit("seat:click", { seatId: "s1" });

      expect(state.selectedSeatIds).toEqual(["s1", "s2"]);
      expect(payload).toEqual({ groupId: "g1" });
      expect(venueUpdated).toBe(true);
    });

    it("should deselect group and emit null when clicking already selected guest group in Graduation Mode", (): void => {
      const { state, eventBus } = createTestEnvironment();
      state.isGraduationMode = true;
      const group = new GraduationGuestGroup("g1", "Group 1", ["s1", "s2"]);
      state.graduationGuestGroups = [group];
      state.selectedSeatIds = ["s1", "s2"];

      let payload: { groupId: string | null } | null = null;
      eventBus.on(
        "graduation:guest-group-select",
        (p: { groupId: string | null }): void => {
          payload = p;
        },
      );

      let venueUpdated = false;
      eventBus.on("venue:updated", (): void => {
        venueUpdated = true;
      });

      eventBus.emit("seat:click", { seatId: "s1" });

      expect(state.selectedSeatIds).toEqual([]);
      expect(payload).toEqual({ groupId: null });
      expect(venueUpdated).toBe(true);
    });

    it("should do nothing when clicking a seat not assigned to any guest group in Graduation Mode", (): void => {
      const { state, eventBus } = createTestEnvironment();
      state.isGraduationMode = true;
      state.graduationGuestGroups = [
        new GraduationGuestGroup("g1", "Group 1", ["s1"]),
      ];

      let emitted = false;
      eventBus.on("graduation:guest-group-select", (): void => {
        emitted = true;
      });

      eventBus.emit("seat:click", { seatId: "s2" });
      expect(state.selectedSeatIds).toEqual([]);
      expect(emitted).toBe(false);
    });
  });
});
