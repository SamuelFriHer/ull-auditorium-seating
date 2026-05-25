import { describe, it, expect } from "vitest";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";
import { SelectionController } from "../../src/controllers/SelectionController";
import { SectionType, SelectionMode } from "../../src/types";

describe("SelectionController - ZOMBIES", (): void => {
  /**
   * Creates a default test environment with required models and controller.
   */
  const createTestEnvironment = (): {
    state: AppState;
    eventBus: EventBus;
    controller: SelectionController;
  } => {
    const seat1 = new Seat("s1", "A", 1, "sec1", 10, 20);
    const seat2 = new Seat("s2", "A", 3, "sec1", 30, 20);
    const section = new Section("sec1", "Section 1", SectionType.STALLS, [
      seat1,
      seat2,
    ]);
    const venue = new Venue("v1", "Venue 1", [section]);
    const state = new AppState(venue);
    const eventBus = new EventBus();
    const controller = new SelectionController(state, eventBus);

    return { state, eventBus, controller };
  };

  describe("Z - Zero", (): void => {
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
  });
});
