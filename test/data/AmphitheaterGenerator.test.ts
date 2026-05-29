import { describe, it, expect } from "vitest";
import { generateAmphitheater } from "../../src/data/AmphitheaterGenerator";
import type { SeatDefinition } from "../../src/types";

/**
 * Asserts symmetry and spacing of seat coordinates for standard 18-seat rows.
 */
function verifyStandardRowSymmetry(rowSeats: SeatDefinition[]): void {
  const oddSeats: SeatDefinition[] = rowSeats.filter(
    (seat: SeatDefinition): boolean => seat.number % 2 !== 0,
  );
  const evenSeats: SeatDefinition[] = rowSeats.filter(
    (seat: SeatDefinition): boolean => seat.number % 2 === 0,
  );

  expect(oddSeats).toHaveLength(9);
  expect(evenSeats).toHaveLength(9);

  oddSeats.forEach((oddSeat: SeatDefinition): void => {
    const expectedEvenNumber: number = oddSeat.number + 1;
    const matchingEvenSeat: SeatDefinition | undefined = evenSeats.find(
      (even: SeatDefinition): boolean => even.number === expectedEvenNumber,
    );

    expect(matchingEvenSeat).toBeDefined();
    if (matchingEvenSeat) {
      expect(oddSeat.x + matchingEvenSeat.x).toBe(1050);
      expect(oddSeat.y).toBe(matchingEvenSeat.y);
    }
  });
}

describe("AmphitheaterGenerator - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should have zero seats in row H with an even seat number", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const evenSeatsInRowH: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean =>
          seat.row === "H" && seat.number % 2 === 0,
      );
      expect(evenSeatsInRowH).toHaveLength(0);
    });

    it("should have zero seats with duplicate IDs", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const seatIds: string[] = seats.map(
        (seat: SeatDefinition): string => seat.id,
      );
      const uniqueIds: Set<string> = new Set(seatIds);
      expect(uniqueIds.size).toBe(seats.length);
    });

    it("should have zero seats outside valid coordinate boundaries", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const invalidSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean =>
          seat.x < 276 || seat.x > 830 || seat.y < 202 || seat.y > 418,
      );
      expect(invalidSeats).toHaveLength(0);
    });
  });

  describe("O - One", (): void => {
    it("should generate exactly one seat with the ID 'amphitheater-H-1'", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const targetSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.id === "amphitheater-H-1",
      );
      expect(targetSeats).toHaveLength(1);
    });

    it("should contain exactly one row (H) that contains only odd seat numbers", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const rows: string[] = ["H", "G", "F", "E", "D", "C", "B", "A"];
      const oddOnlyRows: string[] = rows.filter((rowName: string): boolean => {
        const rowSeats: SeatDefinition[] = seats.filter(
          (seat: SeatDefinition): boolean => seat.row === rowName,
        );
        return rowSeats.every(
          (seat: SeatDefinition): boolean => seat.number % 2 !== 0,
        );
      });
      expect(oddOnlyRows).toEqual(["H"]);
    });

    it("should have exactly one row (H) with Y coordinate equal to 202", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const seatsWithMinY: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.y === 202,
      );
      expect(seatsWithMinY.length).toBeGreaterThan(0);
      const distinctRows: Set<string> = new Set(
        seatsWithMinY.map((seat: SeatDefinition): string => seat.row),
      );
      expect(distinctRows.size).toBe(1);
      expect(distinctRows.has("H")).toBe(true);
    });
  });

  describe("M - Many", (): void => {
    it("should generate 137 seats in total", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      expect(seats).toHaveLength(137);
    });

    it("should contain exactly 18 seats for every standard row (A through G)", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const standardRows: string[] = ["G", "F", "E", "D", "C", "B", "A"];
      standardRows.forEach((rowName: string): void => {
        const rowSeats: SeatDefinition[] = seats.filter(
          (seat: SeatDefinition): boolean => seat.row === rowName,
        );
        expect(rowSeats).toHaveLength(18);
      });
    });

    it("should span across exactly 8 distinct rows from H to A", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const rowNames: Set<string> = new Set(
        seats.map((seat: SeatDefinition): string => seat.row),
      );
      expect(rowNames.size).toBe(8);
      const expectedRows: string[] = ["H", "G", "F", "E", "D", "C", "B", "A"];
      expectedRows.forEach((rowName: string): void => {
        expect(rowNames.has(rowName)).toBe(true);
      });
    });
  });

  describe("B - Boundary", (): void => {
    it("should have the correct minimum and maximum coordinates", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const xCoords: number[] = seats.map(
        (seat: SeatDefinition): number => seat.x,
      );
      const yCoords: number[] = seats.map(
        (seat: SeatDefinition): number => seat.y,
      );

      expect(Math.min(...xCoords)).toBe(276);
      expect(Math.max(...xCoords)).toBe(830);
      expect(Math.min(...yCoords)).toBe(202);
      expect(Math.max(...yCoords)).toBe(418);
    });

    it("should apply the corridor adjustment boundary correctly between rows E and D", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const rowESeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "E",
      );
      const rowDSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "D",
      );
      const rowFSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "F",
      );

      const yE: number = rowESeats[0].y;
      const yD: number = rowDSeats[0].y;
      const yF: number = rowFSeats[0].y;

      expect(yE - yF).toBe(28);
      expect(yD - yE).toBe(48);
    });
  });

  describe("I - Interface", (): void => {
    it("should generate seats conforming to the SeatDefinition interface structure", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      seats.forEach((seat: SeatDefinition): void => {
        expect(typeof seat.id).toBe("string");
        expect(typeof seat.row).toBe("string");
        expect(typeof seat.number).toBe("number");
        expect(typeof seat.x).toBe("number");
        expect(typeof seat.y).toBe("number");
      });
    });
  });

  describe("E - Exceptional", (): void => {
    it("should generate seats with valid non-negative coordinate values", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      seats.forEach((seat: SeatDefinition): void => {
        expect(seat.x).toBeGreaterThan(0);
        expect(seat.y).toBeGreaterThan(0);
        expect(Number.isFinite(seat.x)).toBe(true);
        expect(Number.isFinite(seat.y)).toBe(true);
      });
    });

    it("should generate strictly positive seat numbers", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      seats.forEach((seat: SeatDefinition): void => {
        expect(seat.number).toBeGreaterThan(0);
      });
    });
  });

  describe("S - Simple", (): void => {
    it("should verify coordinate symmetry around central axis for standard rows", (): void => {
      const seats: SeatDefinition[] = generateAmphitheater();
      const standardRows: string[] = ["G", "F", "E", "D", "C", "B", "A"];

      standardRows.forEach((rowName: string): void => {
        const rowSeats: SeatDefinition[] = seats.filter(
          (seat: SeatDefinition): boolean => seat.row === rowName,
        );
        verifyStandardRowSymmetry(rowSeats);
      });
    });
  });
});
