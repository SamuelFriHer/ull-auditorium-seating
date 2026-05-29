import { describe, it, expect } from "vitest";
import {
  generateLowerBox,
  generateUpperBox,
} from "../../src/data/BoxesGenerator";
import type { SeatDefinition } from "../../src/types";

/**
 * Asserts symmetry and coordinate alignment of box seats.
 * For each odd-numbered seat at a given height, there must be a matching even-numbered
 * seat at the exact same height, symmetric across the 525 central horizontal axis.
 */
function verifyBoxSymmetry(seats: SeatDefinition[]): void {
  const oddSeats: SeatDefinition[] = seats.filter(
    (seat: SeatDefinition): boolean => seat.row === "Odd",
  );
  const evenSeats: SeatDefinition[] = seats.filter(
    (seat: SeatDefinition): boolean => seat.row === "Even",
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

describe("BoxesGenerator - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should have zero seats with duplicate IDs in lower box", (): void => {
      const seats: SeatDefinition[] = generateLowerBox();
      const seatIds: string[] = seats.map(
        (seat: SeatDefinition): string => seat.id,
      );
      const uniqueIds: Set<string> = new Set(seatIds);
      expect(uniqueIds.size).toBe(seats.length);
    });

    it("should have zero seats with duplicate IDs in upper box", (): void => {
      const seats: SeatDefinition[] = generateUpperBox();
      const seatIds: string[] = seats.map(
        (seat: SeatDefinition): string => seat.id,
      );
      const uniqueIds: Set<string> = new Set(seatIds);
      expect(uniqueIds.size).toBe(seats.length);
    });

    it("should have zero seats outside valid coordinate boundaries for lower box", (): void => {
      const seats: SeatDefinition[] = generateLowerBox();
      const invalidSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean =>
          (seat.x !== 140 && seat.x !== 910) || seat.y < 250 || seat.y > 670,
      );
      expect(invalidSeats).toHaveLength(0);
    });

    it("should have zero seats outside valid coordinate boundaries for upper box", (): void => {
      const seats: SeatDefinition[] = generateUpperBox();
      const invalidSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean =>
          (seat.x !== 140 && seat.x !== 910) || seat.y < 166 || seat.y > 670,
      );
      expect(invalidSeats).toHaveLength(0);
    });

    it("should have zero seats with rows other than 'Odd' or 'Even'", (): void => {
      const lowerSeats: SeatDefinition[] = generateLowerBox();
      const upperSeats: SeatDefinition[] = generateUpperBox();
      const allSeats: SeatDefinition[] = [...lowerSeats, ...upperSeats];
      const invalidRowSeats: SeatDefinition[] = allSeats.filter(
        (seat: SeatDefinition): boolean =>
          seat.row !== "Odd" && seat.row !== "Even",
      );
      expect(invalidRowSeats).toHaveLength(0);
    });
  });

  describe("O - One", (): void => {
    it("should generate exactly one seat with the ID 'lower_box-Odd-1'", (): void => {
      const seats: SeatDefinition[] = generateLowerBox();
      const targetSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.id === "lower_box-Odd-1",
      );
      expect(targetSeats).toHaveLength(1);
      expect(targetSeats[0].row).toBe("Odd");
      expect(targetSeats[0].number).toBe(1);
    });

    it("should generate exactly one seat with the ID 'upper_box-Even-2'", (): void => {
      const seats: SeatDefinition[] = generateUpperBox();
      const targetSeats: SeatDefinition[] = seats.filter(
        (seat: SeatDefinition): boolean => seat.id === "upper_box-Even-2",
      );
      expect(targetSeats).toHaveLength(1);
      expect(targetSeats[0].row).toBe("Even");
      expect(targetSeats[0].number).toBe(2);
    });
  });

  describe("M - Many", (): void => {
    it("should generate 32 seats in total for lower box", (): void => {
      const seats: SeatDefinition[] = generateLowerBox();
      expect(seats).toHaveLength(32);
    });

    it("should generate 38 seats in total for upper box", (): void => {
      const seats: SeatDefinition[] = generateUpperBox();
      expect(seats).toHaveLength(38);
    });

    it("should generate equal distribution of Odd and Even row designations", (): void => {
      const lowerSeats: SeatDefinition[] = generateLowerBox();
      const lowerOdd: number = lowerSeats.filter(
        (s: SeatDefinition): boolean => s.row === "Odd",
      ).length;
      const lowerEven: number = lowerSeats.filter(
        (s: SeatDefinition): boolean => s.row === "Even",
      ).length;
      expect(lowerOdd).toBe(16);
      expect(lowerEven).toBe(16);

      const upperSeats: SeatDefinition[] = generateUpperBox();
      const upperOdd: number = upperSeats.filter(
        (s: SeatDefinition): boolean => s.row === "Odd",
      ).length;
      const upperEven: number = upperSeats.filter(
        (s: SeatDefinition): boolean => s.row === "Even",
      ).length;
      expect(upperOdd).toBe(19);
      expect(upperEven).toBe(19);
    });
  });

  describe("B - Boundary", (): void => {
    it("should have correct minimum and maximum coordinates for lower box", (): void => {
      const seats: SeatDefinition[] = generateLowerBox();
      const xCoords: number[] = seats.map((s: SeatDefinition): number => s.x);
      const yCoords: number[] = seats.map((s: SeatDefinition): number => s.y);

      expect(Math.min(...xCoords)).toBe(140);
      expect(Math.max(...xCoords)).toBe(910);
      expect(Math.min(...yCoords)).toBe(250);
      expect(Math.max(...yCoords)).toBe(670);
    });

    it("should have correct minimum and maximum coordinates for upper box", (): void => {
      const seats: SeatDefinition[] = generateUpperBox();
      const xCoords: number[] = seats.map((s: SeatDefinition): number => s.x);
      const yCoords: number[] = seats.map((s: SeatDefinition): number => s.y);

      expect(Math.min(...xCoords)).toBe(140);
      expect(Math.max(...xCoords)).toBe(910);
      expect(Math.min(...yCoords)).toBe(166);
      expect(Math.max(...yCoords)).toBe(670);
    });
  });

  describe("I - Interface", (): void => {
    it("should generate seats conforming to the SeatDefinition interface structure", (): void => {
      const lowerSeats: SeatDefinition[] = generateLowerBox();
      const upperSeats: SeatDefinition[] = generateUpperBox();
      const allSeats: SeatDefinition[] = [...lowerSeats, ...upperSeats];

      allSeats.forEach((seat: SeatDefinition): void => {
        expect(typeof seat.id).toBe("string");
        expect(typeof seat.row).toBe("string");
        expect(typeof seat.number).toBe("number");
        expect(typeof seat.x).toBe("number");
        expect(typeof seat.y).toBe("number");
      });
    });
  });

  describe("E - Exceptional", (): void => {
    it("should generate seats with valid positive coordinate values", (): void => {
      const lowerSeats: SeatDefinition[] = generateLowerBox();
      const upperSeats: SeatDefinition[] = generateUpperBox();
      const allSeats: SeatDefinition[] = [...lowerSeats, ...upperSeats];

      allSeats.forEach((seat: SeatDefinition): void => {
        expect(seat.x).toBeGreaterThan(0);
        expect(seat.y).toBeGreaterThan(0);
        expect(Number.isFinite(seat.x)).toBe(true);
        expect(Number.isFinite(seat.y)).toBe(true);
      });
    });

    it("should not contain duplicate coordinates in lower box", (): void => {
      const seats: SeatDefinition[] = generateLowerBox();
      const coords: Set<string> = new Set<string>();
      seats.forEach((seat: SeatDefinition): void => {
        const key: string = `${seat.x},${seat.y}`;
        expect(coords.has(key)).toBe(false);
        coords.add(key);
      });
    });

    it("should not contain duplicate coordinates in upper box", (): void => {
      const seats: SeatDefinition[] = generateUpperBox();
      const coords: Set<string> = new Set<string>();
      seats.forEach((seat: SeatDefinition): void => {
        const key: string = `${seat.x},${seat.y}`;
        expect(coords.has(key)).toBe(false);
        coords.add(key);
      });
    });
  });

  describe("S - Simple", (): void => {
    it("should verify coordinate symmetry around central axis for lower box", (): void => {
      const seats: SeatDefinition[] = generateLowerBox();
      verifyBoxSymmetry(seats);
    });

    it("should verify coordinate symmetry around central axis for upper box", (): void => {
      const seats: SeatDefinition[] = generateUpperBox();
      verifyBoxSymmetry(seats);
    });
  });
});
