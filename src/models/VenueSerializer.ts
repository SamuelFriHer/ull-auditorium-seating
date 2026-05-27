import type { VenueJSON, SeatGroupJSON } from "../types";
import { Venue } from "./Venue";
import { SeatGroup } from "./SeatGroup";
import { AppState } from "./AppState";
import { OrlaAllocator } from "../utils/OrlaAllocator";
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
  public static toJSON(venue: Venue, state?: AppState): VenueJSON {
    if (state && state.isOrlaMode) {
      return VenueSerializer.serializeOrla(venue, state);
    }
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
   * Helper to serialize Orla Mode virtual groups.
   */
  private static serializeOrla(venue: Venue, state: AppState): VenueJSON {
    const teachers = OrlaAllocator.getTeacherSeatIds(venue);
    const students = OrlaAllocator.getStudentSeatIds(
      venue,
      state.orlaStudentCount,
    );
    const groups: SeatGroupJSON[] = [];

    if (teachers.length > 0) {
      groups.push({
        id: "orla_teachers",
        label: "Docentes",
        color: "#10B981",
        seatIds: teachers,
      });
    }
    if (students.length > 0) {
      groups.push({
        id: "orla_students",
        label: "Estudiantes",
        color: "#F59E0B",
        seatIds: students,
      });
    }

    state.orlaGuestGroups.forEach((g): void => {
      if (g.seatIds.length > 0) {
        groups.push({
          id: g.id,
          label: g.label,
          color: g.isOccupied ? "#EF4444" : "#3B82F6",
          seatIds: [...g.seatIds],
        });
      }
    });

    return {
      id: venue.id,
      name: venue.name,
      groups,
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
  public static download(
    venue: Venue,
    filename: string,
    state?: AppState,
  ): void {
    const json = VenueSerializer.toJSON(venue, state);
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
