import { describe, it, expect } from "vitest";
import { generateStalls } from "../../src/data/StallsGenerator";
import type { SeatDefinition } from "../../src/types";

/**
 * Asserts symmetry and spacing of seat coordinates for a row.
 * For each odd seat at index i, there must be a matching even seat at index i
 * such that their X coordinates are symmetric around the 525 axis (sum to 1050),
 * and their Y coordinates are identical.
 *
 * @param rowSeats - Seating configuration for a specific row.
 * @returns void
 */
function verifyRowSymmetry(rowSeats: SeatDefinition[]): void {
  const oddSeats: SeatDefinition[] = rowSeats.filter(
    (seat: SeatDefinition): boolean => seat.number % 2 !== 0,
  );
  const evenSeats: SeatDefinition[] = rowSeats.filter(
    (seat: SeatDefinition): boolean => seat.number % 2 === 0,
  );

  expect(oddSeats).toHaveLength(evenSeats.length);

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

describe("StallsGenerator - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should have zero seats with duplicate IDs", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const seatIds: string[] = seats.map(
        (seat: SeatDefinition): string => seat.id,
      );
      const uniqueIds: Set<string> = new Set(seatIds);
      expect(uniqueIds.size).toBe(seats.length);
    });

    it("should have zero seats outside valid coordinate boundaries", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const invalidSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean =>
          seat.x < 192 || seat.x > 858 || seat.y < 202 || seat.y > 670,
      );
      expect(invalidSeats).toHaveLength(0);
    });

    it("should have zero seats with odd numbers placed on the left side of 525", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const leftOddSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean =>
          seat.number % 2 !== 0 && seat.x < 525,
      );
      expect(leftOddSeats).toHaveLength(0);
    });

    it("should have zero seats with even numbers placed on the right side of 525", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const rightEvenSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean =>
          seat.number % 2 === 0 && seat.x > 525,
      );
      expect(rightEvenSeats).toHaveLength(0);
    });
  });

  describe("O - One", (): void => {
    it("should generate exactly one seat with the ID 'stalls-A-1'", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const targetSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.id === "stalls-A-1",
      );
      expect(targetSeats).toHaveLength(1);
      expect(targetSeats[0].row).toBe("A");
      expect(targetSeats[0].number).toBe(1);
    });

    it("should contain exactly one row (A) that contains exactly 14 seats", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const rows: string[] = [
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
      const rowsWith14Seats: string[] = rows.filter(
        (rowName: string): boolean => {
          const rowSeats: SeatDefinition[] = seats.filter(
            (seat: SeatDefinition): boolean => seat.row === rowName,
          );
          return rowSeats.length === 14;
        },
      );
      expect(rowsWith14Seats).toEqual(["A"]);
    });

    it("should have exactly one row (Q) with Y coordinate equal to 202", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const seatsWithMinY: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.y === 202,
      );
      expect(seatsWithMinY.length).toBeGreaterThan(0);
      const distinctRows: Set<string> = new Set(
        seatsWithMinY.map((seat: SeatDefinition): string => seat.row),
      );
      expect(distinctRows.size).toBe(1);
      expect(distinctRows.has("Q")).toBe(true);
    });
  });

  describe("M - Many", (): void => {
    it("should generate 396 seats in total", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      expect(seats).toHaveLength(396);
    });

    it("should contain exactly 24 seats for every row from C to Q", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const standardRows: string[] = [
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
      ];
      standardRows.forEach((rowName: string): void => {
        const rowSeats: SeatDefinition[] = seats.filter(
          (seat: SeatDefinition): boolean => seat.row === rowName,
        );
        expect(rowSeats).toHaveLength(24);
      });
    });

    it("should span across exactly 17 distinct rows from A to Q", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const rowNames: Set<string> = new Set(
        seats.map((seat: SeatDefinition): string => seat.row),
      );
      expect(rowNames.size).toBe(17);
      const expectedRows: string[] = [
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
      expectedRows.forEach((rowName: string): void => {
        expect(rowNames.has(rowName)).toBe(true);
      });
    });
  });

  describe("B - Boundary", (): void => {
    it("should have the correct minimum and maximum coordinates", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const xCoords: number[] = seats.map(
        (seat: SeatDefinition): number => seat.x,
      );
      const yCoords: number[] = seats.map(
        (seat: SeatDefinition): number => seat.y,
      );

      expect(Math.min(...xCoords)).toBe(192);
      expect(Math.max(...xCoords)).toBe(858);
      expect(Math.min(...yCoords)).toBe(202);
      expect(Math.max(...yCoords)).toBe(670);
    });

    it("should apply the corridor adjustment boundary correctly between rows M and L", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const rowMSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "M",
      );
      const rowLSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "L",
      );
      const rowNSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.row === "N",
      );

      const yM: number = rowMSeats[0].y;
      const yL: number = rowLSeats[0].y;
      const yN: number = rowNSeats[0].y;

      // Distance between N and M should be standard spacing (28)
      expect(yM - yN).toBe(28);
      // Distance between M and L should include corridor adjustment (28 + 20 = 48)
      expect(yL - yM).toBe(48);
    });
  });

  describe("I - Interface", (): void => {
    it("should generate seats conforming to the SeatDefinition interface structure", (): void => {
      const seats: SeatDefinition[] = generateStalls();
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
      const seats: SeatDefinition[] = generateStalls();
      seats.forEach((seat: SeatDefinition): void => {
        expect(seat.x).toBeGreaterThan(0);
        expect(seat.y).toBeGreaterThan(0);
        expect(Number.isFinite(seat.x)).toBe(true);
        expect(Number.isFinite(seat.y)).toBe(true);
      });
    });

    it("should generate strictly positive seat numbers", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      seats.forEach((seat: SeatDefinition): void => {
        expect(seat.number).toBeGreaterThan(0);
      });
    });

    it("should not contain any seats with duplicate coordinate definitions", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const coordinates: Set<string> = new Set<string>();
      seats.forEach((seat: SeatDefinition): void => {
        const key: string = `${seat.x},${seat.y}`;
        expect(coordinates.has(key)).toBe(false);
        coordinates.add(key);
      });
    });
  });

  describe("S - Simple", (): void => {
    it("should verify coordinate symmetry around central axis for all rows", (): void => {
      const seats: SeatDefinition[] = generateStalls();
      const rows: string[] = [
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

      rows.forEach((rowName: string): void => {
        const rowSeats: SeatDefinition[] = seats.filter(
          (seat: SeatDefinition): boolean => seat.row === rowName,
        );
        verifyRowSymmetry(rowSeats);
      });
    });
  });
});
