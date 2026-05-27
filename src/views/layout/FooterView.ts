import type { IView } from "../IView";
import pkg from "../../../package.json";

/**
 * Renders the application footer containing version and legal links.
 */
export class FooterView implements IView {
  private readonly container: HTMLElement;

  /**
   * Initializes a new FooterView instance.
   *
   * @param container - The footer container element.
   */
  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Renders the footer HTML.
   */
  public render(): void {
    this.container.innerHTML = `
      <div class="footer-content">
        <span class="version-info">Versión: ${pkg.version}</span>
        <span class="footer-separator">|</span>
        <a href="${import.meta.env.BASE_URL}legal/" class="legal-link">Aviso Legal</a>
      </div>
    `;
  }

  /**
   * Cleans up panel contents.
   */
  public destroy(): void {
    this.container.innerHTML = "";
  }
}
