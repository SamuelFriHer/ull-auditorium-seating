import { Seat } from "../models/Seat";

/**
 * Generates user-friendly Spanish labels for venue seating areas.
 */
export class OrlaLocationLabeler {
  /**
   * Formulates a location prefix string in Spanish.
   *
   * @param seat - The seat to label.
   * @returns The Spanish location prefix.
   */
  public static getLocationPrefix(seat: Seat): string {
    const sideText = seat.number % 2 !== 0 ? "Impar" : "Par";
    switch (seat.sectionId) {
      case "stalls":
        return `Patio Fila ${seat.row} ${sideText}`;
      case "amphitheater":
        return `Anfiteatro Fila ${seat.row} ${sideText}`;
      case "lower_box":
        return `Palco Bajo ${sideText}`;
      case "upper_box":
        return `Palco Alto ${sideText}`;
      default:
        return `Zona Desconocida`;
    }
  }
}
