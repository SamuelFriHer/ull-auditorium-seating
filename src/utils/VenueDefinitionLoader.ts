import { ULLAuditoriumVenue } from "../data/auditorium-ull";
import { Venue } from "../models/Venue";
import { Section } from "../models/Section";
import { Seat } from "../models/Seat";

/**
 * Utility class to load and build venue models from static definitions.
 */
export class VenueDefinitionLoader {
  /**
   * Loads the static definition of the ULL Auditorium and constructs a Venue instance.
   *
   * @returns A fully constructed Venue instance.
   */
  public static loadAuditorium(): Venue {
    const sections: Section[] = this.buildSections();
    return new Venue(ULLAuditoriumVenue.id, ULLAuditoriumVenue.name, sections);
  }

  /**
   * Builds the Section and Seat model instances from the static definitions.
   *
   * @returns An array of Section instances.
   */
  private static buildSections(): Section[] {
    return ULLAuditoriumVenue.sections.map((sectionDef): Section => {
      const seats: Seat[] = sectionDef.seats.map((seatDef): Seat => {
        return new Seat(
          seatDef.id,
          seatDef.row,
          seatDef.number,
          sectionDef.id,
          seatDef.x,
          seatDef.y,
        );
      });
      return new Section(
        sectionDef.id,
        sectionDef.name,
        sectionDef.type,
        seats,
      );
    });
  }
}
