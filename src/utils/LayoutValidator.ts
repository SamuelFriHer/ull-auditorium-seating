import type { VenueJSON, SeatGroupJSON } from "../types";

/**
 * Validator utility for validating imported layout configurations.
 */
export class LayoutValidator {
  /**
   * Validates the schema, types, and structure of the imported JSON layout.
   *
   * @param rawData - The parsed JSON data to validate.
   * @returns The validated VenueJSON layout.
   * @throws Error if the validation fails.
   */
  public static validate(rawData: unknown): VenueJSON {
    if (!rawData || typeof rawData !== "object") {
      throw new Error("Invalid layout JSON: Root must be a non-null object.");
    }

    const candidate = rawData as Partial<VenueJSON>;

    if (typeof candidate.id !== "string" || candidate.id.trim() === "") {
      throw new Error(
        "Invalid layout JSON: 'id' is required and must be a non-empty string.",
      );
    }

    if (candidate.id !== "auditorium_ull") {
      throw new Error(`Unsupported venue ID: ${candidate.id}`);
    }

    if (typeof candidate.name !== "string" || candidate.name.trim() === "") {
      throw new Error(
        "Invalid layout JSON: 'name' is required and must be a non-empty string.",
      );
    }

    if (!Array.isArray(candidate.groups)) {
      throw new Error(
        "Invalid layout JSON: 'groups' is required and must be an array.",
      );
    }

    candidate.groups.forEach((group: unknown): void => {
      LayoutValidator.validateGroup(group);
    });

    return candidate as VenueJSON;
  }

  /**
   * Validates the schema, types, and structure of a single seat group.
   *
   * @param group - The seat group data to validate.
   * @throws Error if the validation fails.
   */
  private static validateGroup(group: unknown): void {
    if (!group || typeof group !== "object") {
      throw new Error("Invalid layout JSON: Group must be a non-null object.");
    }

    const candidateGroup = group as Partial<SeatGroupJSON>;

    if (
      typeof candidateGroup.id !== "string" ||
      candidateGroup.id.trim() === ""
    ) {
      throw new Error(
        "Invalid layout JSON: Group 'id' is required and must be a non-empty string.",
      );
    }

    if (
      typeof candidateGroup.label !== "string" ||
      candidateGroup.label.trim() === ""
    ) {
      throw new Error(
        "Invalid layout JSON: Group 'label' is required and must be a non-empty string.",
      );
    }

    LayoutValidator.validateGroupDetails(candidateGroup);
  }

  /**
   * Validates color and seat IDs for a single group.
   *
   * @param candidateGroup - The seat group data to validate.
   * @throws Error if the validation fails.
   */
  private static validateGroupDetails(
    candidateGroup: Partial<SeatGroupJSON>,
  ): void {
    if (
      typeof candidateGroup.color !== "string" ||
      candidateGroup.color.trim() === ""
    ) {
      throw new Error(
        "Invalid layout JSON: Group 'color' is required and must be a non-empty string.",
      );
    }

    if (!LayoutValidator.isValidHexColor(candidateGroup.color)) {
      throw new Error(
        `Invalid layout JSON: Group 'color' must be a valid hex color code: ${candidateGroup.color}`,
      );
    }

    if (!Array.isArray(candidateGroup.seatIds)) {
      throw new Error(
        "Invalid layout JSON: Group 'seatIds' is required and must be an array.",
      );
    }

    candidateGroup.seatIds.forEach((seatId: unknown): void => {
      if (typeof seatId !== "string" || seatId.trim() === "") {
        throw new Error(
          "Invalid layout JSON: Group 'seatIds' must contain only non-empty strings.",
        );
      }
    });
  }

  /**
   * Verifies if a color string matches a safe hexadecimal color format.
   *
   * @param color - The color string to validate.
   * @returns True if it matches the hex pattern, false otherwise.
   */
  private static isValidHexColor(color: string): boolean {
    const hexPattern: RegExp =
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    return hexPattern.test(color);
  }
}
