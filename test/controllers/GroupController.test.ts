import { describe, it, expect } from "vitest";
import { Seat } from "../../src/models/Seat";
import { SeatGroup } from "../../src/models/SeatGroup";
import { Section } from "../../src/models/Section";
import { Venue } from "../../src/models/Venue";
import { AppState } from "../../src/models/AppState";
import { EventBus } from "../../src/events/EventBus";
import { GroupController } from "../../src/controllers/GroupController";
import { SectionType } from "../../src/types";

describe("GroupController", (): void => {
  /**
   * Helper function to instantiate a test environment for GroupController.
   */
  const createTestEnvironment = (): {
    state: AppState;
    eventBus: EventBus;
    controller: GroupController;
    seat1: Seat;
    seat2: Seat;
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
    const controller = new GroupController(state, eventBus);

    return { state, eventBus, controller, seat1, seat2 };
  };

  it("should create a group with default color and set it active", (): void => {
    const { state, controller } = createTestEnvironment();

    const group = controller.createGroup("VIP");
    expect(group.label).toBe("VIP");
    expect(group.color).toBe("#6366F1");
    expect(state.venue.groups).toContain(group);
    expect(state.activeGroupId).toBe(group.id);
  });

  it("should create a group with a custom color", (): void => {
    const { controller } = createTestEnvironment();

    const group = controller.createGroup("Gold", "#FFD700");
    expect(group.label).toBe("Gold");
    expect(group.color).toBe("#FFD700");
  });

  it("should update a group label and color", (): void => {
    const { controller } = createTestEnvironment();
    const group = controller.createGroup("VIP");

    controller.updateGroup(group.id, { label: "Super VIP", color: "#FF0000" });
    expect(group.label).toBe("Super VIP");
    expect(group.color).toBe("#FF0000");
  });

  it("should update a group's seats via patch", (): void => {
    const { controller, seat1, seat2 } = createTestEnvironment();
    const group = controller.createGroup("VIP");

    controller.updateGroup(group.id, { seatIds: ["s1", "s2"] });
    expect(group.seatIds).toEqual(["s1", "s2"]);
    expect(seat1.groupId).toBe(group.id);
    expect(seat2.groupId).toBe(group.id);
  });

  it("should delete a group and release seats", (): void => {
    const { state, controller, seat1 } = createTestEnvironment();
    const group = controller.createGroup("VIP");
    state.venue.assignSeatsToGroup(["s1"], group.id);

    controller.deleteGroup(group.id);
    expect(state.venue.groups).not.toContain(group);
    expect(seat1.groupId).toBeNull();
    expect(state.activeGroupId).toBeNull();
  });

  it("should assign selected seats to group and clear selection", (): void => {
    const { state, controller, seat1 } = createTestEnvironment();
    const group = controller.createGroup("VIP");
    state.selectedSeatIds = ["s1"];

    controller.assignSelectedSeats(group.id);
    expect(seat1.groupId).toBe(group.id);
    expect(group.seatIds).toEqual(["s1"]);
    expect(state.selectedSeatIds).toEqual([]);
  });

  it("should handle event group:create", (): void => {
    const { state, eventBus } = createTestEnvironment();

    eventBus.emit("group:create", { label: "Test Event", color: "#999999" });
    expect(state.venue.groups).toHaveLength(1);
    expect(state.venue.groups[0]?.label).toBe("Test Event");
    expect(state.venue.groups[0]?.color).toBe("#999999");
  });

  it("should handle event group:assign and group:unassign", (): void => {
    const { state, eventBus, seat1 } = createTestEnvironment();
    const group = new SeatGroup("g1", "VIP", "#FF0000");
    state.venue.groups.push(group);
    state.selectedSeatIds = ["s1"];

    eventBus.emit("group:assign", { seatIds: ["s1"], groupId: "g1" });
    expect(seat1.groupId).toBe("g1");
    expect(state.selectedSeatIds).toEqual([]);

    eventBus.emit("group:unassign", { seatIds: ["s1"] });
    expect(seat1.groupId).toBeNull();
  });

  it("should handle event group:active-change", (): void => {
    const { state, eventBus } = createTestEnvironment();

    eventBus.emit("group:active-change", { id: "active-id" });
    expect(state.activeGroupId).toBe("active-id");
  });
});
