/**
 * Defines the type of auditorium section.
 */
export enum SectionType {
  STALLS = "STALLS",
  AMPHITHEATER = "AMPHITHEATER",
  LOWER_BOX = "LOWER_BOX",
  UPPER_BOX = "UPPER_BOX",
}

/**
 * Defines the active mode of seat selection.
 */
export enum SelectionMode {
  SINGLE = "SINGLE",
  DRAG = "DRAG",
  NONE = "NONE",
}

/**
 * Represents a color in the RGB space.
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Serialized representation of a seat group.
 */
export interface SeatGroupJSON {
  id: string;
  label: string;
  color: string;
  seatIds: string[];
}

/**
 * Serialized representation of the complete venue layout.
 */
export interface VenueJSON {
  id: string;
  name: string;
  groups: SeatGroupJSON[];
}

/**
 * Static configuration details of a single seat.
 */
export interface SeatDefinition {
  id: string;
  row: string;
  number: number;
  x: number;
  y: number;
}

/**
 * Static configuration details of a section containing seats.
 */
export interface SectionDefinition {
  id: string;
  name: string;
  type: SectionType;
  seats: SeatDefinition[];
}

/**
 * Static configuration details of the entire venue.
 */
export interface VenueDefinition {
  id: string;
  name: string;
  sections: SectionDefinition[];
}

/**
 * Mapping of typed events to their respective handler parameters.
 */
export interface EventPayloadMap {
  "seat:click": { seatId: string };
  "seat:drag-start": { seatId: string };
  "seat:drag-over": { seatId: string };
  "seat:drag-end": void;
  "selection:clear": void;
  "group:create": { label: string; color?: string };
  "group:update": { id: string; patch: Partial<SeatGroupJSON> };
  "group:delete": { id: string };
  "group:assign": { seatIds: string[]; groupId: string };
  "group:unassign": { seatIds: string[] };
  "group:active-change": { id: string | null };
  "venue:loaded": { venue: VenueJSON };
  "venue:updated": void;
  "venue:export": void;
  "venue:import": { file: File };
  "floor:change": { floor: number };
  "orla:toggle": { active: boolean };
  "orla:students-change": { count: number };
  "orla:guests-change": { count: number };
  "orla:guest-group-toggle": { groupId: string };
  "orla:guest-group-label-change": { groupId: string; label: string };
  "orla:guest-group-select": { groupId: string | null };
}

/**
 * Supported event names in the application.
 */
export type AppEvent = keyof EventPayloadMap;
