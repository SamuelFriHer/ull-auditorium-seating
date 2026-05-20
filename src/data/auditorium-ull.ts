import { type VenueDefinition, SectionType } from "../types";
import { generatePatioButacas } from "./patio-generator";
import { generateAnfiteatro } from "./anfiteatro-generator";
import { generatePalcoBajo, generatePalcoAlto } from "./palcos-generator";

/**
 * Static configuration details of the ULL Paraninfo venue.
 */
export const ULLAuditoriumVenue: VenueDefinition = {
  id: "paraninfo_ull",
  name: "Paraninfo de la Universidad de La Laguna",
  sections: [
    {
      id: "patio_butacas",
      name: "Patio de Butacas",
      type: SectionType.PATIO_BUTACAS,
      seats: generatePatioButacas(),
    },
    {
      id: "anfiteatro",
      name: "Anfiteatro",
      type: SectionType.ANFITEATRO,
      seats: generateAnfiteatro(),
    },
    {
      id: "palco_bajo",
      name: "Palco Bajo",
      type: SectionType.PALCO_BAJO,
      seats: generatePalcoBajo(),
    },
    {
      id: "palco_alto",
      name: "Palco Alto",
      type: SectionType.PALCO_ALTO,
      seats: generatePalcoAlto(),
    },
  ],
};
