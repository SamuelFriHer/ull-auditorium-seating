import type { Section } from "../models/Section";
import type { Seat } from "../models/Seat";

/**
 * Resolves the list of Section IDs assigned to a given floor level.
 *
 * @param floor - The floor level.
 * @returns The array of section IDs.
 */
export function getSectionIdsForFloor(floor: number): string[] {
  switch (floor) {
    case 0:
      return ["stalls"];
    case 1:
      return ["amphitheater", "lower_box"];
    case 2:
      return ["upper_box"];
    default:
      return [];
  }
}

/**
 * Calculates a uniform SVG viewBox that covers all venue sections to ensure scale consistency.
 *
 * @param sections - All sections in the venue.
 * @returns The viewBox attribute string.
 */
export function calculateVenueViewBox(sections: Section[]): string {
  if (sections.length === 0) {
    return "0 0 1050 720";
  }

  let minX: number = Infinity;
  let maxX: number = -Infinity;
  let minY: number = Infinity;
  let maxY: number = -Infinity;

  sections.forEach((section: Section): void => {
    section.seats.forEach((seat: Seat): void => {
      if (seat.x < minX) {
        minX = seat.x;
      }
      if (seat.x + 18 > maxX) {
        maxX = seat.x + 18;
      }
      if (seat.y < minY) {
        minY = seat.y;
      }
      if (seat.y + 18 > maxY) {
        maxY = seat.y + 18;
      }
    });
  });

  if (minX === Infinity || minY === Infinity) {
    return "0 0 1050 720";
  }

  const padding: number = 24;
  const x: number = minX - padding;
  const y: number = minY - padding;
  const width: number = maxX - minX + 2 * padding;
  const height: number = maxY - minY + 2 * padding;

  return `${x} ${y} ${width} ${height}`;
}
