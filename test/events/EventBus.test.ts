import { describe, it, expect, vi } from "vitest";
import { EventBus } from "../../src/events/EventBus";

describe("EventBus - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should allow emitting an event with zero listeners safely", (): void => {
      const eventBus = new EventBus();
      expect((): void => {
        eventBus.emit("seat:click", { seatId: "seat-123" });
      }).not.toThrow();
    });

    it("should allow emitting void payload events without a second argument", (): void => {
      const eventBus = new EventBus();
      const clearListener = vi.fn();

      eventBus.on("selection:clear", clearListener);
      eventBus.emit("selection:clear");

      expect(clearListener).toHaveBeenCalledTimes(1);
      expect(clearListener).toHaveBeenCalledWith(undefined);
    });
  });

  describe("O - One", (): void => {
    it("should subscribe to and trigger events with one listener", (): void => {
      const eventBus = new EventBus();
      const clickListener = vi.fn();

      eventBus.on("seat:click", clickListener);
      eventBus.emit("seat:click", { seatId: "seat-123" });

      expect(clickListener).toHaveBeenCalledTimes(1);
      expect(clickListener).toHaveBeenCalledWith({ seatId: "seat-123" });
    });

    it("should unsubscribe a single listener from events correctly", (): void => {
      const eventBus = new EventBus();
      const clickListener = vi.fn();

      eventBus.on("seat:click", clickListener);
      eventBus.off("seat:click", clickListener);
      eventBus.emit("seat:click", { seatId: "seat-123" });

      expect(clickListener).not.toHaveBeenCalled();
    });
  });

  describe("M - Many", (): void => {
    it("should support registering multiple listeners for the same event", (): void => {
      const eventBus = new EventBus();
      const firstClearListener = vi.fn();
      const secondClearListener = vi.fn();

      eventBus.on("selection:clear", firstClearListener);
      eventBus.on("selection:clear", secondClearListener);
      eventBus.emit("selection:clear", undefined);

      expect(firstClearListener).toHaveBeenCalledTimes(1);
      expect(secondClearListener).toHaveBeenCalledTimes(1);
    });
  });

  describe("B - Boundary", (): void => {
    it("should verify unsubscribing a non-existent listener does not affect others", (): void => {
      const eventBus = new EventBus();
      const clickListener1 = vi.fn();
      const clickListener2 = vi.fn();

      eventBus.on("seat:click", clickListener1);
      eventBus.off("seat:click", clickListener2);
      eventBus.emit("seat:click", { seatId: "seat-456" });

      expect(clickListener1).toHaveBeenCalledTimes(1);
      expect(clickListener2).not.toHaveBeenCalled();
    });
  });

  describe("I - Interface", (): void => {
    it("should expose subscription and trigger interface methods", (): void => {
      const eventBus = new EventBus();
      expect(typeof eventBus.on).toBe("function");
      expect(typeof eventBus.off).toBe("function");
      expect(typeof eventBus.emit).toBe("function");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should handle nested exception propagation safely inside callbacks", (): void => {
      const eventBus = new EventBus();
      const throwingListener = (): void => {
        throw new Error("Callback Error");
      };

      eventBus.on("selection:clear", throwingListener);
      expect((): void => {
        eventBus.emit("selection:clear");
      }).toThrow("Callback Error");
    });
  });
});
