import { describe, it, expect } from "vitest";
import { Seat } from "../../src/models/Seat";
import { GraduationLocationLabeler } from "../../src/utils/GraduationLocationLabeler";

describe("GraduationLocationLabeler - ZOMBIES", (): void => {
  describe("Z - Zero", (): void => {
    it("should return Zona Desconocida for unknown/empty sectionId", (): void => {
      const seat: Seat = new Seat("seat-1", "A", 1, "unknown_section", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Zona Desconocida");
    });
  });

  describe("O - One", (): void => {
    it("should format correct prefix for stalls with odd seat number", (): void => {
      const seat: Seat = new Seat("seat-1", "A", 1, "stalls", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Patio Fila A Impar");
    });

    it("should format correct prefix for stalls with even seat number", (): void => {
      const seat: Seat = new Seat("seat-2", "B", 2, "stalls", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Patio Fila B Par");
    });

    it("should format correct prefix for amphitheater with odd seat number", (): void => {
      const seat: Seat = new Seat("seat-3", "C", 3, "amphitheater", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Anfiteatro Fila C Impar");
    });

    it("should format correct prefix for amphitheater with even seat number", (): void => {
      const seat: Seat = new Seat("seat-4", "D", 4, "amphitheater", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Anfiteatro Fila D Par");
    });

    it("should format correct prefix for lower box with odd seat number", (): void => {
      const seat: Seat = new Seat("seat-5", "E", 5, "lower_box", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Palco Bajo Impar");
    });

    it("should format correct prefix for lower box with even seat number", (): void => {
      const seat: Seat = new Seat("seat-6", "F", 6, "lower_box", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Palco Bajo Par");
    });

    it("should format correct prefix for upper box with odd seat number", (): void => {
      const seat: Seat = new Seat("seat-7", "G", 7, "upper_box", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Palco Alto Impar");
    });

    it("should format correct prefix for upper box with even seat number", (): void => {
      const seat: Seat = new Seat("seat-8", "H", 8, "upper_box", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Palco Alto Par");
    });
  });

  describe("M - Many", (): void => {
    it("should format prefixes correctly for many diverse seat configurations", (): void => {
      const configurations = [
        {
          seat: new Seat("s1", "Row1", 101, "stalls", 0, 0),
          expected: "Patio Fila Row1 Impar",
        },
        {
          seat: new Seat("s2", "Row2", 102, "stalls", 0, 0),
          expected: "Patio Fila Row2 Par",
        },
        {
          seat: new Seat("s3", "Row3", 201, "amphitheater", 0, 0),
          expected: "Anfiteatro Fila Row3 Impar",
        },
        {
          seat: new Seat("s4", "Row4", 202, "amphitheater", 0, 0),
          expected: "Anfiteatro Fila Row4 Par",
        },
        {
          seat: new Seat("s5", "Row5", 301, "lower_box", 0, 0),
          expected: "Palco Bajo Impar",
        },
        {
          seat: new Seat("s6", "Row6", 302, "lower_box", 0, 0),
          expected: "Palco Bajo Par",
        },
        {
          seat: new Seat("s7", "Row7", 401, "upper_box", 0, 0),
          expected: "Palco Alto Impar",
        },
        {
          seat: new Seat("s8", "Row8", 402, "upper_box", 0, 0),
          expected: "Palco Alto Par",
        },
        {
          seat: new Seat("s9", "Row9", 501, "unknown", 0, 0),
          expected: "Zona Desconocida",
        },
      ];

      configurations.forEach(({ seat, expected }): void => {
        const prefix: string =
          GraduationLocationLabeler.getLocationPrefix(seat);
        expect(prefix).toBe(expected);
      });
    });
  });

  describe("B - Boundary", (): void => {
    it("should handle seat number 0 as even", (): void => {
      const seat: Seat = new Seat("seat-zero", "A", 0, "stalls", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Patio Fila A Par");
    });

    it("should handle seat number -1 as odd", (): void => {
      const seat: Seat = new Seat("seat-neg-one", "A", -1, "stalls", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Patio Fila A Impar");
    });

    it("should handle extremely large seat number", (): void => {
      const seat: Seat = new Seat("seat-large", "Z", 999999, "stalls", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Patio Fila Z Impar");
    });

    it("should handle empty row label", (): void => {
      const seat: Seat = new Seat("seat-empty-row", "", 1, "stalls", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Patio Fila  Impar");
    });
  });

  describe("I - Interface", (): void => {
    it("should return a value of type string", (): void => {
      const seat: Seat = new Seat("seat-interface", "A", 1, "stalls", 0, 0);
      const prefix: unknown = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(typeof prefix).toBe("string");
    });
  });

  describe("E - Exceptional", (): void => {
    it("should handle negative even seat numbers correctly", (): void => {
      const seat: Seat = new Seat("seat-neg-even", "B", -2, "stalls", 0, 0);
      const prefix: string = GraduationLocationLabeler.getLocationPrefix(seat);
      expect(prefix).toBe("Patio Fila B Par");
    });
  });
});
