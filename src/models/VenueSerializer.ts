import type { VenueJSON, SeatGroupJSON } from "../types";
import { Venue } from "./Venue";
import { SeatGroup } from "./SeatGroup";
import { VenueDefinitionLoader } from "../utils/VenueDefinitionLoader";

/**
 * Handles serialization and deserialization of Venue configurations.
 */
export class VenueSerializer {
  /**
   * Serializes a Venue instance to its JSON-compatible format.
   *
   * @param venue - The Venue instance to serialize.
   * @returns The serialized VenueJSON representation.
   */
  public static toJSON(venue: Venue): VenueJSON {
    return {
      id: venue.id,
      name: venue.name,
      groups: venue.groups.map(
        (group): SeatGroupJSON => ({
          id: group.id,
          label: group.label,
          color: group.color,
          seatIds: [...group.seatIds],
        }),
      ),
    };
  }

  /**
   * Deserializes a VenueJSON payload into a Venue instance, mapping groups and assignments.
   *
   * @param data - The serialized VenueJSON data.
   * @returns A Venue instance reconstructed with the state from JSON.
   */
  public static fromJSON(data: VenueJSON): Venue {
    if (data.id !== "auditorium_ull") {
      throw new Error(`Unsupported venue ID: ${data.id}`);
    }

    const venue = VenueDefinitionLoader.loadAuditorium();

    for (const groupData of data.groups) {
      const group = new SeatGroup(
        groupData.id,
        groupData.label,
        groupData.color,
        [],
      );
      venue.groups.push(group);
      venue.assignSeatsToGroup(groupData.seatIds, groupData.id);
    }

    return venue;
  }

  /**
   * Downloads the venue layout configuration as a JSON file in the browser.
   *
   * @param venue - The Venue instance to download.
   * @param filename - The target filename for download.
   */
  public static download(venue: Venue, filename: string): void {
    const json = VenueSerializer.toJSON(venue);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
