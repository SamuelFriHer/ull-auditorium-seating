import { describe, it, expect } from "vitest";
import { UllAuditoriumVenue } from "../../src/data/UllAuditorium";
import type { SeatDefinition, SectionDefinition } from "../../src/types";

const TEST_STALLS_ROWS: string[] = [
  "Q",
  "P",
  "O",
  "N",
  "M",
  "L",
  "K",
  "J",
  "I",
  "H",
  "G",
  "F",
  "E",
  "D",
  "C",
  "B",
  "A",
];

/**
 * Asserts the coordinate symmetry and spacing between odd and even seat pairs in a row.
 */
function verifyRowSymmetry(rowSeats: SeatDefinition[]): void {
  const oddSeats = rowSeats.filter(
    (seat: SeatDefinition): boolean => seat.number % 2 !== 0,
  );
  const evenSeats = rowSeats.filter(
    (seat: SeatDefinition): boolean => seat.number % 2 === 0,
  );

  expect(oddSeats.length).toBe(evenSeats.length);

  oddSeats.forEach((oddSeat: SeatDefinition): void => {
    const expectedEvenNumber = oddSeat.number + 1;
    const matchingEvenSeat = evenSeats.find(
      (even: SeatDefinition): boolean => even.number === expectedEvenNumber,
    );

    expect(matchingEvenSeat).toBeDefined();
    if (matchingEvenSeat) {
      expect(oddSeat.x + matchingEvenSeat.x).toBe(1050);
      expect(oddSeat.y).toBe(matchingEvenSeat.y);
    }
  });
}

describe("ULL Auditorium Seating - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should have zero seats placed exactly on the center line x = 525", (): void => {
      UllAuditoriumVenue.sections.forEach(
        (section: SectionDefinition): void => {
          section.seats.forEach((seat: SeatDefinition): void => {
            expect(seat.x).not.toBe(525);
          });
        },
      );
    });
  });

  describe("O - One", (): void => {
    it("should restrict Amphitheater row H to odd seats only", (): void => {
      const amphitheater = UllAuditoriumVenue.sections[1];
      expect(amphitheater).toBeDefined();
      if (!amphitheater) return;

      const rowHSeats = amphitheater.seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "H",
      );
      expect(rowHSeats).toHaveLength(11);
      rowHSeats.forEach((seat: SeatDefinition): void => {
        expect(seat.number % 2).not.toBe(0);
      });
    });
  });

  describe("M - Many", (): void => {
    it("should verify symmetrical X coordinates around x = 525 for corresponding seat pairs", (): void => {
      const stalls = UllAuditoriumVenue.sections[0];
      expect(stalls).toBeDefined();
      if (!stalls) return;

      TEST_STALLS_ROWS.forEach((rowName: string): void => {
        const rowSeats = stalls.seats.filter(
          (seat: SeatDefinition): boolean => seat.row === rowName,
        );
        verifyRowSymmetry(rowSeats);
      });
    });

    it("should contain correct total seat counts per section", (): void => {
      const sections = UllAuditoriumVenue.sections;
      expect(sections[0]?.seats).toHaveLength(396);
      expect(sections[1]?.seats).toHaveLength(137);
      expect(sections[2]?.seats).toHaveLength(32);
      expect(sections[3]?.seats).toHaveLength(38);
    });
  });

  describe("B - Boundary", (): void => {
    it("should place odd seats strictly on the right side and even seats on the left side of x = 525", (): void => {
      UllAuditoriumVenue.sections.forEach(
        (section: SectionDefinition): void => {
          section.seats.forEach((seat: SeatDefinition): void => {
            const isOdd = seat.number % 2 !== 0;
            if (isOdd) {
              expect(seat.x).toBeGreaterThan(525);
            } else {
              expect(seat.x).toBeLessThan(525);
            }
          });
        },
      );
    });

    it("should apply correct offset shifts to stalls rows to center them", (): void => {
      const stalls = UllAuditoriumVenue.sections[0];
      expect(stalls).toBeDefined();
      if (!stalls) return;

      const rowASeats = stalls.seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "A",
      );
      expect(rowASeats).toHaveLength(14);
      expect(
        rowASeats.find((s: SeatDefinition): boolean => s.number === 1)?.x,
      ).toBe(620);
      expect(
        rowASeats.find((s: SeatDefinition): boolean => s.number === 2)?.x,
      ).toBe(430);

      const rowBSeats = stalls.seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "B",
      );
      expect(rowBSeats).toHaveLength(22);
      expect(
        rowBSeats.find((s: SeatDefinition): boolean => s.number === 1)?.x,
      ).toBe(564);
      expect(
        rowBSeats.find((s: SeatDefinition): boolean => s.number === 2)?.x,
      ).toBe(486);
    });
  });

  describe("I - Interface", (): void => {
    it("should conform to venue section layout schema requirements", (): void => {
      const sections = UllAuditoriumVenue.sections;
      expect(sections).toHaveLength(4);
      expect(sections[0]?.id).toBe("stalls");
      expect(sections[1]?.id).toBe("amphitheater");
      expect(sections[2]?.id).toBe("lower_box");
      expect(sections[3]?.id).toBe("upper_box");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should not contain any seats with duplicate coordinate definitions within the same section", (): void => {
      const coordinates = new Set<string>();
      UllAuditoriumVenue.sections.forEach(
        (section: SectionDefinition): void => {
          section.seats.forEach((seat: SeatDefinition): void => {
            const key = `${section.id},${seat.x},${seat.y}`;
            expect(coordinates.has(key)).toBe(false);
            coordinates.add(key);
          });
        },
      );
    });
  });

  describe("S - Simple", (): void => {
    it("should verify defined structure shifts on row C", (): void => {
      const stalls = UllAuditoriumVenue.sections[0];
      expect(stalls).toBeDefined();
      if (!stalls) return;

      const rowCSeats = stalls.seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "C",
      );
      expect(rowCSeats).toHaveLength(24);
      expect(
        rowCSeats.find((s: SeatDefinition): boolean => s.number === 1)?.x,
      ).toBe(550);
      expect(
        rowCSeats.find((s: SeatDefinition): boolean => s.number === 2)?.x,
      ).toBe(500);
    });
  });
});
