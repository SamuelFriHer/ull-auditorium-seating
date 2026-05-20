import { describe, it, expect } from "vitest";
import { ULLAuditoriumVenue } from "../../src/data/auditorium-ull";
import type { SeatDefinition, SectionDefinition } from "../../src/types";

const TEST_PATIO_ROWS: string[] = [
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
 *
 * @param rowSeats - The seat definitions of a single row.
 */
function verifyRowSymmetry(rowSeats: SeatDefinition[]): void {
  const oddSeats: SeatDefinition[] = rowSeats.filter(
    (seat: SeatDefinition): boolean => seat.number % 2 !== 0,
  );
  const evenSeats: SeatDefinition[] = rowSeats.filter(
    (seat: SeatDefinition): boolean => seat.number % 2 === 0,
  );

  expect(oddSeats.length).toBe(evenSeats.length);

  oddSeats.forEach((oddSeat: SeatDefinition): void => {
    const expectedEvenNumber: number = oddSeat.number + 1;
    const matchingEvenSeat: SeatDefinition | undefined = evenSeats.find(
      (evenSeat: SeatDefinition): boolean =>
        evenSeat.number === expectedEvenNumber,
    );

    expect(matchingEvenSeat).toBeDefined();
    if (matchingEvenSeat) {
      expect(oddSeat.x + matchingEvenSeat.x).toBe(1050);
      expect(oddSeat.y).toBe(matchingEvenSeat.y);
    }
  });
}

describe("ULL Auditorium Seating Layout Definition", (): void => {
  it("should have correct section types and IDs", (): void => {
    const sections: SectionDefinition[] = ULLAuditoriumVenue.sections;
    expect(sections).toHaveLength(4);
    expect(sections[0]?.id).toBe("patio_butacas");
    expect(sections[1]?.id).toBe("anfiteatro");
    expect(sections[2]?.id).toBe("palco_bajo");
    expect(sections[3]?.id).toBe("palco_alto");
  });

  it("should have correct total seat counts per section", (): void => {
    const sections: SectionDefinition[] = ULLAuditoriumVenue.sections;
    // Patio de butacas: 14 (A) + 22 (B) + 15 * 24 (C-Q) = 396
    expect(sections[0]?.seats).toHaveLength(396);
    // Anfiteatro: 7 * 18 (A-G) + 11 (H) = 137
    expect(sections[1]?.seats).toHaveLength(137);
    // Palco Bajo: 32
    expect(sections[2]?.seats).toHaveLength(32);
    // Palco Alto: 38
    expect(sections[3]?.seats).toHaveLength(38);
  });

  it("should place odd seats on the right and even seats on the left", (): void => {
    ULLAuditoriumVenue.sections.forEach((section: SectionDefinition): void => {
      section.seats.forEach((seat: SeatDefinition): void => {
        const isOdd: boolean = seat.number % 2 !== 0;
        if (isOdd) {
          expect(seat.x).toBeGreaterThan(525);
        } else {
          expect(seat.x).toBeLessThan(525);
        }
      });
    });
  });

  it("should have symmetrical X coordinates around x = 525 for corresponding seat pairs", (): void => {
    const patio: SectionDefinition | undefined = ULLAuditoriumVenue.sections[0];
    expect(patio).toBeDefined();
    if (!patio) {
      return;
    }

    TEST_PATIO_ROWS.forEach((rowName: string): void => {
      const rowSeats: SeatDefinition[] = patio.seats.filter(
        (seat: SeatDefinition): boolean => seat.row === rowName,
      );
      verifyRowSymmetry(rowSeats);
    });
  });

  it("should restrict Anfiteatro row H to odd seats only", (): void => {
    const anfiteatro: SectionDefinition | undefined =
      ULLAuditoriumVenue.sections[1];
    expect(anfiteatro).toBeDefined();
    if (!anfiteatro) {
      return;
    }
    const rowHSeats: SeatDefinition[] = anfiteatro.seats.filter(
      (seat: SeatDefinition): boolean => seat.row === "H",
    );
    expect(rowHSeats).toHaveLength(11);
    rowHSeats.forEach((seat: SeatDefinition): void => {
      expect(seat.number % 2).not.toBe(0);
    });
  });
});
