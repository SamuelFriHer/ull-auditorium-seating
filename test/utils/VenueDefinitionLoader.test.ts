import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VenueDefinitionLoader } from "../../src/utils/VenueDefinitionLoader";
import { UllAuditoriumVenue } from "../../src/data/UllAuditorium";
import { Venue } from "../../src/models/Venue";
import { Section } from "../../src/models/Section";
import { Seat } from "../../src/models/Seat";
import { SectionType } from "../../src/types";
import type { SectionDefinition } from "../../src/types";

describe("VenueDefinitionLoader - ZOMBIES", (): void => {
  let originalSections: SectionDefinition[];

  beforeEach((): void => {
    originalSections = [...UllAuditoriumVenue.sections];
  });

  afterEach((): void => {
    UllAuditoriumVenue.sections = originalSections;
  });

  describe("Z - Zero", (): void => {
    it("should load a venue with zero sections if the definition contains no sections", (): void => {
      UllAuditoriumVenue.sections = [];
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      expect(venue.id).toBe("auditorium_ull");
      expect(venue.sections).toHaveLength(0);
    });

    it("should load a section with zero seats if a section in the definition has no seats", (): void => {
      UllAuditoriumVenue.sections = [
        {
          id: "empty_sec",
          name: "Empty Section",
          type: SectionType.STALLS,
          seats: [],
        },
      ];
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      expect(venue.sections).toHaveLength(1);
      const section: Section | undefined = venue.sections[0];
      expect(section).toBeDefined();
      expect(section?.seats).toHaveLength(0);
    });
  });

  describe("O - One", (): void => {
    it("should load a venue with exactly one section and one seat correctly", (): void => {
      UllAuditoriumVenue.sections = [
        {
          id: "sec_one",
          name: "One Section",
          type: SectionType.AMPHITHEATER,
          seats: [
            {
              id: "seat_one",
              row: "A",
              number: 1,
              x: 100,
              y: 200,
            },
          ],
        },
      ];
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      expect(venue.sections).toHaveLength(1);
      const section: Section = venue.sections[0];
      expect(section.id).toBe("sec_one");
      expect(section.name).toBe("One Section");
      expect(section.type).toBe(SectionType.AMPHITHEATER);
      expect(section.seats).toHaveLength(1);

      const seat: Seat = section.seats[0];
      expect(seat.id).toBe("seat_one");
      expect(seat.row).toBe("A");
      expect(seat.number).toBe(1);
      expect(seat.sectionId).toBe("sec_one");
      expect(seat.x).toBe(100);
      expect(seat.y).toBe(200);
    });
  });

  describe("M - Many", (): void => {
    it("should load the auditorium with many sections and seats successfully", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      expect(venue.id).toBe("auditorium_ull");
      expect(venue.name).toBe("Paraninfo de la Universidad de La Laguna");
      expect(venue.sections.length).toBeGreaterThan(1);

      const stalls: Section | undefined = venue.sections.find(
        (s: Section): boolean => s.id === "stalls",
      );
      expect(stalls).toBeDefined();
      expect(stalls?.seats.length).toBeGreaterThan(1);
    });
  });

  describe("B - Boundary", (): void => {
    it("should correctly handle boundaries when mapping multiple seats in a section", (): void => {
      UllAuditoriumVenue.sections = [
        {
          id: "sec_boundary",
          name: "Boundary Section",
          type: SectionType.LOWER_BOX,
          seats: [
            {
              id: "seat_first",
              row: "A",
              number: 1,
              x: 0,
              y: 0,
            },
            {
              id: "seat_last",
              row: "Z",
              number: 999,
              x: 2000,
              y: 2000,
            },
          ],
        },
      ];
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      const section: Section = venue.sections[0];
      expect(section.seats).toHaveLength(2);

      const firstSeat: Seat = section.seats[0];
      expect(firstSeat.id).toBe("seat_first");
      expect(firstSeat.x).toBe(0);
      expect(firstSeat.y).toBe(0);

      const lastSeat: Seat = section.seats[1];
      expect(lastSeat.id).toBe("seat_last");
      expect(lastSeat.x).toBe(2000);
      expect(lastSeat.y).toBe(2000);
    });
  });

  describe("I - Interface", (): void => {
    it("should instantiate model instances conforming to correct classes", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      expect(venue).toBeInstanceOf(Venue);
      expect(venue.sections[0]).toBeInstanceOf(Section);
      expect(venue.sections[0].seats[0]).toBeInstanceOf(Seat);
    });
  });

  describe("E - Exceptional", (): void => {
    it("should build sections with coordinate properties outside normal ranges if defined", (): void => {
      UllAuditoriumVenue.sections = [
        {
          id: "sec_ex",
          name: "Exceptional Section",
          type: SectionType.UPPER_BOX,
          seats: [
            {
              id: "seat_neg",
              row: "B",
              number: -5,
              x: -150,
              y: -300,
            },
          ],
        },
      ];
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      const section: Section = venue.sections[0];
      const seat: Seat = section.seats[0];
      expect(seat.number).toBe(-5);
      expect(seat.x).toBe(-150);
      expect(seat.y).toBe(-300);
    });
  });

  describe("S - Simple", (): void => {
    it("should execute a simple, standard load and check venue ID", (): void => {
      const venue: Venue = VenueDefinitionLoader.loadAuditorium();
      expect(venue.id).toBe("auditorium_ull");
    });
  });
});
