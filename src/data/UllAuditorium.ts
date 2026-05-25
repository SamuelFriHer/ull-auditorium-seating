import { type VenueDefinition, SectionType } from "../types";
import { generateStalls } from "./StallsGenerator";
import { generateAmphitheater } from "./AmphitheaterGenerator";
import { generateLowerBox, generateUpperBox } from "./BoxesGenerator";

/**
 * Static configuration details of the ULL Auditorium venue.
 */
export const UllAuditoriumVenue: VenueDefinition = {
  id: "auditorium_ull",
  name: "Paraninfo de la Universidad de La Laguna",
  sections: [
    {
      id: "stalls",
      name: "Patio de Butacas",
      type: SectionType.STALLS,
      seats: generateStalls(),
    },
    {
      id: "amphitheater",
      name: "Anfiteatro",
      type: SectionType.AMPHITHEATER,
      seats: generateAmphitheater(),
    },
    {
      id: "lower_box",
      name: "Palco Bajo",
      type: SectionType.LOWER_BOX,
      seats: generateLowerBox(),
    },
    {
      id: "upper_box",
      name: "Palco Alto",
      type: SectionType.UPPER_BOX,
      seats: generateUpperBox(),
    },
  ],
};
