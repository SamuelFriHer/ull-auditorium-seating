import type { AppEvent, EventPayloadMap } from "../types";

/**
 * A typed event bus implementing the Publish-Subscribe pattern to decouple components.
 */
export class EventBus {
  private readonly listeners: Map<AppEvent, Array<(payload: any) => void>>;

  /**
   * Initializes a new EventBus instance.
   */
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribes a listener callback to a specific application event.
   *
   * @param event - The event identifier.
   * @param listener - The callback function invoked when the event is emitted.
   */
  public on<K extends AppEvent>(
    event: K,
    listener: (payload: EventPayloadMap[K]) => void,
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Unsubscribes a listener callback from a specific application event.
   *
   * @param event - The event identifier.
   * @param listener - The callback function to remove.
   */
  public off<K extends AppEvent>(
    event: K,
    listener: (payload: EventPayloadMap[K]) => void,
  ): void {
    const registeredListeners = this.listeners.get(event);
    if (!registeredListeners) {
      return;
    }
    const listenerIndex = registeredListeners.indexOf(listener);
    if (listenerIndex !== -1) {
      registeredListeners.splice(listenerIndex, 1);
    }
  }

  /**
   * Emits an event, triggering all registered callbacks with the payload.
   *
   * @param event - The event identifier.
   * @param args - The payload associated with the event.
   */
  public emit<K extends AppEvent>(
    event: K,
    ...args: EventPayloadMap[K] extends void
      ? [payload?: undefined]
      : [payload: EventPayloadMap[K]]
  ): void {
    const registeredListeners = this.listeners.get(event);
    if (!registeredListeners) {
      return;
    }
    const payload = args[0];
    for (const listener of registeredListeners) {
      listener(payload);
    }
  }
}
