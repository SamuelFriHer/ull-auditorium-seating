import { describe, it, expect } from "vitest";
import { Seat } from "../../src/models/Seat";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";
import { SelectionController } from "../../src/controllers/SelectionController";
import { SectionType, SelectionMode } from "../../src/types";

describe("SelectionController", (): void => {
  const createTestEnvironment = (): {
    state: AppState;
    eventBus: EventBus;
    controller: SelectionController;
  } => {
    const seat1 = new Seat("s1", "A", 1, "sec1", 10, 20);
    const seat2 = new Seat("s2", "A", 3, "sec1", 30, 20);
    const section = new Section(
      "sec1",
      "Section 1",
      SectionType.PATIO_BUTACAS,
      [seat1, seat2],
    );
    const venue = new Venue("v1", "Venue 1", [section]);
    const state = new AppState(venue);
    const eventBus = new EventBus();
    const controller = new SelectionController(state, eventBus);

    return { state, eventBus, controller };
  };

  it("should handle individual seat click toggle correctly", (): void => {
    const { state, eventBus } = createTestEnvironment();

    let updatedCount = 0;
    eventBus.on("venue:updated", (): void => {
      updatedCount++;
    });

    eventBus.emit("seat:click", { seatId: "s1" });
    expect(state.selectedSeatIds).toEqual(["s1"]);
    expect(state.selectionMode).toBe(SelectionMode.SINGLE);
    expect(updatedCount).toBe(1);

    eventBus.emit("seat:click", { seatId: "s1" });
    expect(state.selectedSeatIds).toEqual([]);
    expect(state.selectionMode).toBe(SelectionMode.SINGLE);
    expect(updatedCount).toBe(2);
  });

  it("should handle drag selection sequence correctly", (): void => {
    const { state, eventBus } = createTestEnvironment();

    let updatedCount = 0;
    eventBus.on("venue:updated", (): void => {
      updatedCount++;
    });

    // 1. Drag starts on s1 (currently unselected)
    eventBus.emit("seat:drag-start", { seatId: "s1" });
    expect(state.selectionMode).toBe(SelectionMode.DRAG);
    expect(state.selectedSeatIds).toEqual([]); // Deferred selection until first drag-over
    expect(updatedCount).toBe(0);

    // 2. Drag moves over s2
    eventBus.emit("seat:drag-over", { seatId: "s2" });
    expect(state.selectedSeatIds).toEqual(["s1", "s2"]); // Both selected
    expect(updatedCount).toBe(1);

    // 3. Drag ends
    eventBus.emit("seat:drag-end");
    expect(state.selectionMode).toBe(SelectionMode.NONE);

    // 4. Drag starts again, but on s1 (now selected)
    eventBus.emit("seat:drag-start", { seatId: "s1" });
    expect(state.selectionMode).toBe(SelectionMode.DRAG);

    // 5. Drag moves over s2
    eventBus.emit("seat:drag-over", { seatId: "s2" });
    expect(state.selectedSeatIds).toEqual([]); // Both deselected
  });

  it("should clear selection on clear event", (): void => {
    const { state, eventBus } = createTestEnvironment();
    state.selectedSeatIds = ["s1", "s2"];
    state.selectionMode = SelectionMode.SINGLE;

    let updatedCount = 0;
    eventBus.on("venue:updated", (): void => {
      updatedCount++;
    });

    eventBus.emit("selection:clear");
    expect(state.selectedSeatIds).toEqual([]);
    expect(state.selectionMode).toBe(SelectionMode.NONE);
    expect(updatedCount).toBe(1);
  });
});
