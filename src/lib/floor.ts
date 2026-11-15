import type { Chair, Floor, FloorTable, TableShape } from "../types/api";

/**
 * Geometry and naming rules for the floor plan. Kept free of React and the
 * canvas so the same rules can be tested, and mirrored by the guest app when
 * it draws a restaurant's tables.
 */

/** The editor's drawing area, in layout units. The canvas scales to fit the screen. */
export const CANVAS = { width: 1200, height: 760 };
export const GRID = 10;
export const MAX_CHAIRS = 20;

export type Side = "top" | "right" | "bottom" | "left";

/** How far a chair's centre sits outside the table edge. */
export const CHAIR_OFFSET = 18;
/** Room one chair needs along a table edge. */
const CHAIR_PITCH = 46;

export interface TableTemplate {
  key: string;
  label: string;
  shape: TableShape;
  width: number;
  height: number;
  seats: number;
}

export const TEMPLATES: TableTemplate[] = [
  { key: "round-2", label: "Round · 2", shape: "round", width: 80, height: 80, seats: 2 },
  { key: "round-4", label: "Round · 4", shape: "round", width: 110, height: 110, seats: 4 },
  { key: "round-6", label: "Round · 6", shape: "round", width: 140, height: 140, seats: 6 },
  { key: "square-2", label: "Square · 2", shape: "square", width: 80, height: 80, seats: 2 },
  { key: "square-4", label: "Square · 4", shape: "square", width: 100, height: 100, seats: 4 },
  { key: "rect-4", label: "Long · 4", shape: "rectangle", width: 140, height: 80, seats: 4 },
  { key: "rect-6", label: "Long · 6", shape: "rectangle", width: 190, height: 90, seats: 6 },
  { key: "rect-8", label: "Long · 8", shape: "rectangle", width: 240, height: 90, seats: 8 },
];

/**
 * Decides which edge of a rectangular table each chair sits on. Guests sit
 * along the long edges first; the ends are used once the long edges are full.
 * Returns one side per chair. Round tables do not use sides.
 */
export function seatSides(width: number, height: number, count: number): Side[] {
  if (count <= 0) return [];
  const wide = width >= height;
  const longSides: [Side, Side] = wide ? ["top", "bottom"] : ["left", "right"];
  const shortSides: [Side, Side] = wide ? ["left", "right"] : ["top", "bottom"];
  const longCapacity = Math.max(1, Math.floor(Math.max(width, height) / CHAIR_PITCH));
  const shortCapacity = Math.max(1, Math.floor(Math.min(width, height) / CHAIR_PITCH));

  const onSide: Record<Side, number> = { top: 0, right: 0, bottom: 0, left: 0 };
  let remaining = count;

  const fill = (sides: [Side, Side], capacity: number) => {
    // Alternate so the two edges stay balanced.
    for (let i = 0; i < capacity * 2 && remaining > 0; i++) {
      onSide[sides[i % 2]]++;
      remaining--;
    }
  };
  fill(longSides, longCapacity);
  fill(shortSides, shortCapacity);
  // More chairs than the table has room for: squeeze the rest along the long edges.
  for (let i = 0; remaining > 0; i++) {
    onSide[longSides[i % 2]]++;
    remaining--;
  }

  return (["top", "right", "bottom", "left"] as Side[]).flatMap((side) => Array<Side>(onSide[side]).fill(side));
}

/** Builds a table's chair list for a seat count, recording each chair's edge. */
export function buildChairs(tableId: string, shape: TableShape, width: number, height: number, count: number): Chair[] {
  const seats = Math.max(0, Math.min(MAX_CHAIRS, Math.round(count)));
  if (shape === "round") {
    return Array.from({ length: seats }, (_, i) => ({ id: `${tableId}-c${i + 1}`, position: "around" }));
  }
  return seatSides(width, height, seats).map((side, i) => ({ id: `${tableId}-c${i + 1}`, position: side }));
}

export interface SeatPosition {
  /** Chair centre, relative to the table's top-left corner. */
  x: number;
  y: number;
  /** Degrees to turn the chair so it faces the table. */
  rotation: number;
}

/**
 * Where each chair is drawn. Round tables space chairs evenly around the
 * rim; other tables space the chairs on each edge evenly along it. Chairs
 * saved before edges were recorded are laid out afresh from the seat count.
 */
export function seatPositions(table: Pick<FloorTable, "shape" | "size" | "chairs">): SeatPosition[] {
  const { width, height } = table.size;
  const count = table.chairs.length;
  if (count === 0) return [];

  if (table.shape === "round") {
    const radius = width / 2 + CHAIR_OFFSET;
    return table.chairs.map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        x: width / 2 + Math.sin(angle) * radius,
        y: height / 2 - Math.cos(angle) * radius,
        rotation: (angle * 180) / Math.PI,
      };
    });
  }

  const sides: Side[] = ["top", "right", "bottom", "left"];
  const recorded = table.chairs.map((c) => c.position as Side);
  // Layouts saved before edges were recorded put every chair on "top", which
  // is never what the rule above produces for two or more chairs.
  const legacy = count > 1 && new Set(recorded).size === 1;
  const assigned = count > 1 && !legacy && recorded.every((p) => sides.includes(p)) ? recorded : seatSides(width, height, count);

  const total: Record<Side, number> = { top: 0, right: 0, bottom: 0, left: 0 };
  assigned.forEach((side) => total[side]++);
  const seen: Record<Side, number> = { top: 0, right: 0, bottom: 0, left: 0 };

  return assigned.map((side) => {
    const along = (seen[side]++ + 0.5) / total[side];
    switch (side) {
      case "top":
        return { x: along * width, y: -CHAIR_OFFSET, rotation: 0 };
      case "bottom":
        return { x: along * width, y: height + CHAIR_OFFSET, rotation: 180 };
      case "left":
        return { x: -CHAIR_OFFSET, y: along * height, rotation: 270 };
      default:
        return { x: width + CHAIR_OFFSET, y: along * height, rotation: 90 };
    }
  });
}

/** The lowest "T<n>" name no table in the restaurant uses yet. */
export function nextTableName(tables: Pick<FloorTable, "name">[]): string {
  const used = new Set(tables.map((t) => t.name.trim().toLowerCase()));
  for (let n = 1; ; n++) {
    if (!used.has(`t${n}`)) return `T${n}`;
  }
}

/** A floor id no existing floor uses, continuing the numeric sequence. */
export function nextFloorId(floors: Floor[]): string {
  const highest = floors.reduce((max, floor) => Math.max(max, Number.parseInt(floor.id, 10) || 0), 0);
  return String(highest + 1);
}

export function snap(value: number): number {
  return Math.round(value / GRID) * GRID;
}

/** Keeps a table (with its chairs) inside the drawing area. */
export function clampPosition(x: number, y: number, width: number, height: number): { x: number; y: number } {
  const margin = CHAIR_OFFSET + 14;
  return {
    x: Math.min(Math.max(x, margin), CANVAS.width - width - margin),
    y: Math.min(Math.max(y, margin), CANVAS.height - height - margin),
  };
}

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }, gap: number): boolean {
  return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
}

/**
 * Finds room for a new table on a floor, scanning left to right, top to
 * bottom. Falls back to the top-left when the floor is full; the table can
 * still be dragged from there.
 */
export function findFreeSpot(existing: FloorTable[], width: number, height: number): { x: number; y: number } {
  const gap = CHAIR_OFFSET * 2 + 20;
  const start = CHAIR_OFFSET + 30;
  const boxes = existing.map((t) => ({ x: t.position.x, y: t.position.y, w: t.size.width, h: t.size.height }));
  for (let y = start; y + height <= CANVAS.height - start; y += 20) {
    for (let x = start; x + width <= CANVAS.width - start; x += 20) {
      const candidate = { x, y, w: width, h: height };
      if (!boxes.some((box) => overlaps(candidate, box, gap))) return { x, y };
    }
  }
  return { x: start, y: start };
}

/** Table names that appear more than once (names must be unique: bookings refer to them). */
export function duplicateNames(tables: Pick<FloorTable, "name">[]): string[] {
  const first = new Map<string, string>();
  const repeated = new Set<string>();
  tables.forEach((t) => {
    const name = t.name.trim();
    const key = name.toLowerCase();
    if (first.has(key)) repeated.add(key);
    else first.set(key, name);
  });
  return [...repeated].map((key) => first.get(key)!);
}

/** Total seats across a set of tables. */
export function seatCount(tables: Pick<FloorTable, "chairs">[]): number {
  return tables.reduce((sum, t) => sum + t.chairs.length, 0);
}
