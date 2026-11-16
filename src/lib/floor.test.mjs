import assert from "node:assert/strict";
import { test } from "node:test";
import * as floor from "./floor.ts";

const count = (sides) => sides.reduce((acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }), {});

test("seatSides puts guests along the long edges first", () => {
  assert.deepEqual(count(floor.seatSides(140, 80, 4)), { top: 2, bottom: 2 });
  assert.deepEqual(count(floor.seatSides(190, 90, 6)), { top: 3, bottom: 3 });
  assert.deepEqual(count(floor.seatSides(80, 190, 6)), { left: 3, right: 3 });
});

test("seatSides uses the ends once the long edges are full", () => {
  // 140 wide fits 3 chairs per long edge; chairs 7 and 8 go on the ends.
  assert.deepEqual(count(floor.seatSides(140, 80, 8)), { top: 3, bottom: 3, left: 1, right: 1 });
  // A square seats one per edge.
  assert.deepEqual(count(floor.seatSides(90, 90, 4)), { top: 1, bottom: 1, left: 1, right: 1 });
  assert.deepEqual(count(floor.seatSides(90, 90, 2)), { top: 1, bottom: 1 });
});

test("seatSides always returns exactly the requested number of chairs", () => {
  for (let n = 0; n <= floor.MAX_CHAIRS; n++) {
    assert.equal(floor.seatSides(100, 100, n).length, n, `square with ${n}`);
    assert.equal(floor.seatSides(240, 90, n).length, n, `long with ${n}`);
  }
  assert.deepEqual(floor.seatSides(100, 100, -3), []);
});

test("buildChairs records each chair's edge and caps the count", () => {
  const chairs = floor.buildChairs("t1", "rectangle", 140, 80, 4);
  assert.equal(chairs.length, 4);
  assert.deepEqual(chairs.map((c) => c.id), ["t1-c1", "t1-c2", "t1-c3", "t1-c4"]);
  assert.deepEqual(count(chairs.map((c) => c.position)), { top: 2, bottom: 2 });
  assert.ok(floor.buildChairs("t2", "round", 110, 110, 6).every((c) => c.position === "around"));
  assert.equal(floor.buildChairs("t3", "rectangle", 140, 80, 99).length, floor.MAX_CHAIRS);
  assert.equal(floor.buildChairs("t4", "square", 80, 80, 0).length, 0);
});

test("seatPositions places every chair outside the table, none on top of another", () => {
  for (const tpl of floor.TEMPLATES) {
    for (const seats of [1, 2, 3, 4, 6, 8, 12]) {
      const table = { shape: tpl.shape, size: { width: tpl.width, height: tpl.height }, chairs: floor.buildChairs("t", tpl.shape, tpl.width, tpl.height, seats) };
      const positions = floor.seatPositions(table);
      assert.equal(positions.length, seats, `${tpl.key} with ${seats}`);
      for (const p of positions) {
        const inside =
          tpl.shape === "round"
            ? Math.hypot(p.x - tpl.width / 2, p.y - tpl.height / 2) <= tpl.width / 2
            : p.x > 0 && p.x < tpl.width && p.y > 0 && p.y < tpl.height;
        assert.ok(!inside, `${tpl.key} with ${seats}: chair at ${p.x},${p.y} is inside the table`);
      }
      const keys = new Set(positions.map((p) => `${Math.round(p.x)},${Math.round(p.y)}`));
      assert.equal(keys.size, seats, `${tpl.key} with ${seats}: two chairs share a spot`);
    }
  }
});

test("seatPositions spreads a round table's chairs evenly", () => {
  const table = { shape: "round", size: { width: 100, height: 100 }, chairs: floor.buildChairs("t", "round", 100, 100, 4) };
  const [top, right, bottom, left] = floor.seatPositions(table);
  assert.ok(Math.abs(top.x - 50) < 0.01 && top.y < 0);
  assert.ok(right.x > 100 && Math.abs(right.y - 50) < 0.01);
  assert.ok(Math.abs(bottom.x - 50) < 0.01 && bottom.y > 100);
  assert.ok(left.x < 0 && Math.abs(left.y - 50) < 0.01);
});

test("layouts saved with every chair on 'top' are laid out again from the seat count", () => {
  const legacy = { shape: "rectangle", size: { width: 140, height: 90 }, chairs: Array.from({ length: 4 }, (_, i) => ({ id: `c${i}`, position: "top" })) };
  const positions = floor.seatPositions(legacy);
  assert.equal(positions.filter((p) => p.y < 0).length, 2, "two chairs above");
  assert.equal(positions.filter((p) => p.y > 90).length, 2, "two chairs below");
});

test("a recorded arrangement is kept as saved", () => {
  const custom = { shape: "rectangle", size: { width: 140, height: 90 }, chairs: [{ id: "a", position: "left" }, { id: "b", position: "right" }, { id: "c", position: "top" }] };
  const positions = floor.seatPositions(custom);
  assert.ok(positions[0].x < 0 && positions[1].x > 140 && positions[2].y < 0);
});

test("nextTableName and nextFloorId skip what is taken", () => {
  assert.equal(floor.nextTableName([]), "T1");
  assert.equal(floor.nextTableName([{ name: "T1" }, { name: "t2" }, { name: "G4" }]), "T3");
  assert.equal(floor.nextFloorId([]), "1");
  assert.equal(floor.nextFloorId([{ id: "1", name: "a" }, { id: "3", name: "b" }]), "4");
});

test("duplicateNames reports clashes whatever the case", () => {
  assert.deepEqual(floor.duplicateNames([{ name: "T1" }, { name: "t1 " }, { name: "T2" }, { name: " T1" }]), ["T1"]);
  assert.deepEqual(floor.duplicateNames([{ name: "A" }, { name: "B" }]), []);
});

test("findFreeSpot never drops a new table on an existing one", () => {
  const tables = [];
  for (let i = 0; i < 12; i++) {
    const spot = floor.findFreeSpot(tables, 140, 90);
    for (const t of tables) {
      const apart = spot.x >= t.position.x + 140 || spot.x + 140 <= t.position.x || spot.y >= t.position.y + 90 || spot.y + 90 <= t.position.y;
      assert.ok(apart, `table ${i} overlaps an earlier one`);
    }
    assert.ok(spot.x >= 0 && spot.x + 140 <= floor.CANVAS.width && spot.y >= 0 && spot.y + 90 <= floor.CANVAS.height);
    tables.push({ position: spot, size: { width: 140, height: 90 } });
  }
});

test("clampPosition keeps a table and its chairs on the canvas", () => {
  assert.deepEqual(floor.clampPosition(-500, -500, 100, 100), { x: 32, y: 32 });
  const far = floor.clampPosition(9999, 9999, 100, 100);
  assert.ok(far.x + 100 <= floor.CANVAS.width && far.y + 100 <= floor.CANVAS.height);
  assert.equal(floor.snap(47), 50);
  assert.equal(floor.seatCount([{ chairs: [{ id: "a", position: "top" }] }, { chairs: [] }]), 1);
});
