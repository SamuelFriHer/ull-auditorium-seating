import { describe, it, expect, vi } from "vitest";
import { EventBus } from "../../src/events/EventBus";

describe("EventBus", () => {
  it("should subscribe to and trigger events with correct payloads", () => {
    const eventBus = new EventBus();
    const clickListener = vi.fn();

    eventBus.on("seat:click", clickListener);
    eventBus.emit("seat:click", { seatId: "seat-123" });

    expect(clickListener).toHaveBeenCalledTimes(1);
    expect(clickListener).toHaveBeenCalledWith({ seatId: "seat-123" });
  });

  it("should unsubscribe from events correctly", () => {
    const eventBus = new EventBus();
    const clickListener = vi.fn();

    eventBus.on("seat:click", clickListener);
    eventBus.off("seat:click", clickListener);
    eventBus.emit("seat:click", { seatId: "seat-123" });

    expect(clickListener).not.toHaveBeenCalled();
  });

  it("should support multiple listeners for the same event", () => {
    const eventBus = new EventBus();
    const firstClearListener = vi.fn();
    const secondClearListener = vi.fn();

    eventBus.on("selection:clear", firstClearListener);
    eventBus.on("selection:clear", secondClearListener);
    eventBus.emit("selection:clear", undefined);

    expect(firstClearListener).toHaveBeenCalledTimes(1);
    expect(secondClearListener).toHaveBeenCalledTimes(1);
  });

  it("should allow emitting void payload events without a second argument", () => {
    const eventBus = new EventBus();
    const clearListener = vi.fn();

    eventBus.on("selection:clear", clearListener);
    eventBus.emit("selection:clear");

    expect(clearListener).toHaveBeenCalledTimes(1);
    expect(clearListener).toHaveBeenCalledWith(undefined);
  });
});
