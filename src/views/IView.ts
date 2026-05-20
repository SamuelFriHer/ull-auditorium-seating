/**
 * Base interface representing a view component in the application.
 */
export interface IView {
  /**
   * Renders the view's HTML/SVG template.
   */
  render(): void;

  /**
   * Cleans up event listeners and DOM elements.
   */
  destroy(): void;
}
