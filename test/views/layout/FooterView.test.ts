import { describe, it, expect, vi, beforeEach } from "vitest";
import { FooterView } from "../../../src/views/layout/FooterView";
import pkg from "../../../package.json";

/**
 * Mock representation of an HTML element for testing DOM operations in Node.
 */
class MockElement {
  private internalInnerHTML: string = "";

  /**
   * Gets the inner HTML content.
   *
   * @returns The HTML content of the mock element.
   */
  public get innerHTML(): string {
    return this.internalInnerHTML;
  }

  /**
   * Sets the inner HTML content.
   *
   * @param val - The HTML content to set.
   */
  public set innerHTML(val: string) {
    this.internalInnerHTML = val;
  }
}

describe("FooterView - ZOMBIES", (): void => {
  let container: MockElement;
  let view: FooterView;

  beforeEach((): void => {
    vi.clearAllMocks();
    container = new MockElement();
    view = new FooterView(container as unknown as HTMLElement);
  });

  describe("Z - Zero", (): void => {
    it("should initialize with an empty container innerHTML", (): void => {
      expect(container.innerHTML).toBe("");
    });
  });

  describe("O - One", (): void => {
    it("should render the footer content with correct version", (): void => {
      view.render();
      expect(container.innerHTML).toContain(`Versión: ${pkg.version}`);
      expect(container.innerHTML).toContain("Aviso Legal");
      expect(container.innerHTML).toContain("footer-content");
    });
  });

  describe("M - Many", (): void => {
    it("should render footer content consistently without doubling content when called multiple times", (): void => {
      view.render();
      const firstRender: string = container.innerHTML;
      view.render();
      const secondRender: string = container.innerHTML;
      expect(firstRender).toBe(secondRender);
      // Ensure it doesn't double print
      const versionMatches: string[] | null =
        container.innerHTML.match(/Versión:/g);
      expect(versionMatches).not.toBeNull();
      expect(versionMatches?.length).toBe(1);
    });
  });

  describe("I - Interface", (): void => {
    it("should implement the IView interface signature", (): void => {
      expect(typeof view.render).toBe("function");
      expect(typeof view.destroy).toBe("function");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should allow calling destroy on an unrendered view safely", (): void => {
      expect((): void => {
        view.destroy();
      }).not.toThrow();
      expect(container.innerHTML).toBe("");
    });
  });

  describe("S - Simple", (): void => {
    it("should empty the container innerHTML upon destruction", (): void => {
      view.render();
      expect(container.innerHTML).not.toBe("");
      view.destroy();
      expect(container.innerHTML).toBe("");
    });
  });
});
