"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Receipt, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * An animated preview of the live floor plan for the landing hero. Every
 * table moves through the same lifecycle the product tracks:
 * free → reserved → seated → bill requested → free.
 */

type TableState = "free" | "reserved" | "seated" | "bill";

interface DemoTable {
  id: number;
  shape: "round" | "rect";
  seats: number;
  /** Position and size as percentages of the floor area. */
  box: { left: number; top: number; width: number; height: number };
  bookedFor: string;
  bill: number;
  method: string;
}

const TABLES: DemoTable[] = [
  { id: 1, shape: "round", seats: 4, box: { left: 7, top: 10, width: 19, height: 27 }, bookedFor: "20:30", bill: 2940, method: "Card" },
  { id: 2, shape: "rect", seats: 4, box: { left: 39, top: 9, width: 24, height: 25 }, bookedFor: "19:45", bill: 3450, method: "M-Pesa" },
  { id: 3, shape: "rect", seats: 6, box: { left: 68, top: 30, width: 25, height: 44 }, bookedFor: "19:30", bill: 6120, method: "M-Pesa" },
  { id: 4, shape: "rect", seats: 2, box: { left: 8, top: 58, width: 15, height: 22 }, bookedFor: "20:15", bill: 1380, method: "Cash" },
  { id: 5, shape: "round", seats: 4, box: { left: 36, top: 56, width: 19, height: 27 }, bookedFor: "20:00", bill: 2180, method: "Cash" },
];

const NEXT: Record<TableState, TableState> = {
  free: "reserved",
  reserved: "seated",
  seated: "bill",
  bill: "free",
};

const INITIAL: Record<number, TableState> = { 1: "free", 2: "seated", 3: "reserved", 4: "free", 5: "seated" };

/** The order in which tables take their next step, one per tick. */
const TURN_ORDER = [3, 2, 5, 4, 1];
const BASE_REVENUE = 41200;
const TICK_MS = 2400;

interface Snapshot {
  tick: number;
  states: Record<number, TableState>;
  revenue: number;
  event: string;
}

const formatKes = (amount: number) => `KES ${amount.toLocaleString("en-KE")}`;

function describe(table: DemoTable, state: TableState): string {
  switch (state) {
    case "reserved":
      return `New booking · Table ${table.id} · ${table.bookedFor}`;
    case "seated":
      return `Table ${table.id} seated · ${table.seats} guests`;
    case "bill":
      return `Table ${table.id} asked for the bill · ${table.method}`;
    default:
      return `Table ${table.id} paid · ${formatKes(table.bill)}`;
  }
}

function advance(prev: Snapshot): Snapshot {
  const tableId = TURN_ORDER[prev.tick % TURN_ORDER.length];
  const table = TABLES.find((t) => t.id === tableId)!;
  const state = NEXT[prev.states[tableId]];
  const paid = state === "free";
  // Start the running total over now and then so it never grows absurd.
  const revenue = paid ? (prev.revenue > BASE_REVENUE * 2 ? BASE_REVENUE : prev.revenue + table.bill) : prev.revenue;
  return {
    tick: prev.tick + 1,
    states: { ...prev.states, [tableId]: state },
    revenue,
    event: describe(table, state),
  };
}

const STATE_STYLE: Record<TableState, { table: string; chair: string; label: string }> = {
  free: {
    table: "bg-white border-slate-200 text-slate-400",
    chair: "bg-slate-200",
    label: "Free",
  },
  reserved: {
    table: "bg-amber-50 border-amber-300 text-amber-800",
    chair: "bg-amber-200",
    label: "Reserved",
  },
  seated: {
    table: "bg-[#0A6B63] border-[#0A6B63] text-white",
    chair: "bg-[#0A6B63]/45",
    label: "Seated",
  },
  bill: {
    table: "bg-[#062B29] border-[#062B29] text-white",
    chair: "bg-[#062B29]/45",
    label: "Bill requested",
  },
};

function Chairs({ table, tone }: { table: DemoTable; tone: string }) {
  const chair = cn("rounded-full transition-colors duration-500", tone);
  if (table.shape === "round") {
    return (
      <>
        <span className={cn(chair, "absolute left-1/2 -top-[11%] h-[7%] w-[34%] -translate-x-1/2")} />
        <span className={cn(chair, "absolute left-1/2 -bottom-[11%] h-[7%] w-[34%] -translate-x-1/2")} />
        <span className={cn(chair, "absolute top-1/2 -left-[11%] h-[34%] w-[7%] -translate-y-1/2")} />
        <span className={cn(chair, "absolute top-1/2 -right-[11%] h-[34%] w-[7%] -translate-y-1/2")} />
      </>
    );
  }
  if (table.seats === 2) {
    return (
      <>
        <span className={cn(chair, "absolute top-1/2 -left-[14%] h-[46%] w-[9%] -translate-y-1/2")} />
        <span className={cn(chair, "absolute top-1/2 -right-[14%] h-[46%] w-[9%] -translate-y-1/2")} />
      </>
    );
  }
  // Longer tables seat guests down both long sides.
  // The floor area is 5:4, so percentages are not directly comparable.
  const vertical = table.box.height * 4 > table.box.width * 5;
  const perSide = Math.ceil(table.seats / 2);
  const row = Array.from({ length: perSide });
  if (vertical) {
    return (
      <>
        <span className="absolute inset-y-0 -left-[13%] flex w-[8%] flex-col justify-evenly">
          {row.map((_, i) => (
            <span key={i} className={cn(chair, "h-[20%] w-full")} />
          ))}
        </span>
        <span className="absolute inset-y-0 -right-[13%] flex w-[8%] flex-col justify-evenly">
          {row.map((_, i) => (
            <span key={i} className={cn(chair, "h-[20%] w-full")} />
          ))}
        </span>
      </>
    );
  }
  return (
    <>
      <span className="absolute inset-x-0 -top-[14%] flex h-[9%] justify-evenly">
        {row.map((_, i) => (
          <span key={i} className={cn(chair, "h-full w-[26%]")} />
        ))}
      </span>
      <span className="absolute inset-x-0 -bottom-[14%] flex h-[9%] justify-evenly">
        {row.map((_, i) => (
          <span key={i} className={cn(chair, "h-full w-[26%]")} />
        ))}
      </span>
    </>
  );
}

export default function HeroFloor() {
  const reduceMotion = useReducedMotion();
  const [snapshot, setSnapshot] = useState<Snapshot>({
    tick: 0,
    states: INITIAL,
    revenue: BASE_REVENUE,
    event: "Table 5 ordered · 3 items",
  });

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setSnapshot(advance), TICK_MS);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  const occupied = TABLES.filter((t) => snapshot.states[t.id] === "seated" || snapshot.states[t.id] === "bill");
  const guests = occupied.reduce((sum, t) => sum + t.seats, 0);

  return (
    <div
      role="img"
      aria-label="Preview of the Swiftab live floor plan: tables change between free, reserved, seated and bill requested as the evening goes on."
      className="relative"
    >
      <div aria-hidden className="rounded-[26px] bg-white p-4 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)] ring-1 ring-black/5 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {["Garden", "Fountain", "1st floor"].map((floor, i) => (
              <span
                key={floor}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold",
                  i === 0 ? "bg-[#0A6B63] text-white" : "bg-slate-100 text-slate-500",
                )}
              >
                {floor}
              </span>
            ))}
          </div>
          <span className="monofont flex shrink-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        <div
          className="relative mt-4 aspect-[5/4] w-full overflow-hidden rounded-2xl bg-[#F6F8F7]"
          style={{
            backgroundImage: "radial-gradient(rgba(10,107,99,0.16) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          {TABLES.map((table) => {
            const state = snapshot.states[table.id];
            const style = STATE_STYLE[state];
            return (
              <div
                key={table.id}
                className="absolute"
                style={{
                  left: `${table.box.left}%`,
                  top: `${table.box.top}%`,
                  width: `${table.box.width}%`,
                  height: `${table.box.height}%`,
                }}
              >
                <Chairs table={table} tone={style.chair} />
                <div
                  className={cn(
                    "relative flex h-full w-full flex-col items-center justify-center border shadow-sm transition-colors duration-500",
                    table.shape === "round" ? "rounded-full" : "rounded-xl",
                    style.table,
                  )}
                >
                  <span className="text-[clamp(13px,1.6vw,18px)] font-bold leading-none">{table.id}</span>
                  <span className="monofont mt-1 text-[9px] font-medium leading-none opacity-80">
                    {state === "reserved" ? table.bookedFor : state === "bill" ? "bill" : state === "seated" ? `${table.seats} in` : "free"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-3 text-center">
          <div>
            <p className="monofont text-[10px] uppercase tracking-[0.14em] text-slate-400">Seated</p>
            <p className="mt-1 text-[15px] font-bold tabular-nums">
              {occupied.length}
              <span className="font-medium text-slate-400">/{TABLES.length}</span>
            </p>
          </div>
          <div>
            <p className="monofont text-[10px] uppercase tracking-[0.14em] text-slate-400">Guests</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[15px] font-bold tabular-nums">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {guests}
            </p>
          </div>
          <div>
            <p className="monofont text-[10px] uppercase tracking-[0.14em] text-slate-400">Tonight</p>
            <p className="mt-1 text-[15px] font-bold tabular-nums text-[#0A6B63]">{formatKes(snapshot.revenue)}</p>
          </div>
        </div>
      </div>

      {/* The latest thing that happened on the floor. */}
      <div aria-hidden className="pointer-events-none absolute -bottom-5 left-4 right-4 flex justify-center sm:left-auto sm:right-6 sm:justify-end lg:-right-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={snapshot.tick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="flex max-w-full items-center gap-2.5 rounded-full bg-[#062B29] py-2 pl-2 pr-4 text-white shadow-[0_16px_30px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/15"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
              <Receipt className="h-3.5 w-3.5" />
            </span>
            <span className="truncate text-[12.5px] font-medium">{snapshot.event}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
