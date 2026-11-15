"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Check, Copy, Loader2, Minus, Pencil, Plus, Redo2, RotateCcw, RotateCw, Save, Trash2, Undo2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, inputClass } from "@/components/ui/field";
import { useLayout, useLiveFloor, useSaveLayout } from "@/hooks/queries";
import {
  CANVAS,
  GRID,
  MAX_CHAIRS,
  TEMPLATES,
  buildChairs,
  clampPosition,
  duplicateNames,
  findFreeSpot,
  nextFloorId,
  nextTableName,
  seatCount,
  type TableTemplate,
} from "@/lib/floor";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Floor, FloorTable, Layout, LiveTable, TableShape } from "@/types/api";

// Konva draws to a <canvas>, which only exists in the browser.
const FloorCanvas = dynamic(() => import("./FloorCanvas"), {
  ssr: false,
  loading: () => <div className="aspect-[1200/760] w-full animate-pulse bg-gray-100" />,
});

const FLOOR_SUGGESTIONS = ["Main dining", "Terrace", "Garden", "Rooftop", "Bar", "1st floor", "Private room"];
const HISTORY_LIMIT = 60;

const LIVE_LEGEND: { status: LiveTable["live"]["status"]; label: string; swatch: string }[] = [
  { status: "free", label: "Free", swatch: "border border-slate-300 bg-white" },
  { status: "reserved", label: "Reserved", swatch: "border border-amber-500 bg-amber-100" },
  { status: "occupied", label: "Seated", swatch: "bg-teal-700" },
];

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable));
}

interface EditorState {
  layout: Layout;
  /** Earlier plans, oldest first, for undo. */
  past: Layout[];
  /** Plans that were undone, nearest first, for redo. */
  future: Layout[];
}

type EditorAction =
  | { type: "reset"; layout: Layout }
  | { type: "commit"; change: (current: Layout) => Layout }
  | { type: "undo" }
  | { type: "redo" };

/** The plan being edited together with its undo history. */
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "reset":
      // A freshly loaded or saved plan is the new starting point.
      return { layout: action.layout, past: [], future: [] };
    case "commit": {
      const next = action.change(state.layout);
      if (next === state.layout) return state;
      return { layout: next, past: [...state.past.slice(-(HISTORY_LIMIT - 1)), state.layout], future: [] };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return { layout: previous, past: state.past.slice(0, -1), future: [state.layout, ...state.future] };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return { layout: next, past: [...state.past, state.layout], future: rest };
    }
  }
}

export default function FloorPlan() {
  const { data, isPending, isError, refetch } = useLayout();
  const save = useSaveLayout();

  const [mode, setMode] = useState<"edit" | "live">("edit");
  const [{ layout, past, future }, dispatch] = useReducer(editorReducer, { layout: { floors: [], tables: [] }, past: [], future: [] });
  const [saved, setSaved] = useState<string>("");
  const [floorId, setFloorId] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [floorInput, setFloorInput] = useState<{ mode: "add" } | { mode: "rename"; id: string } | null>(null);
  const [floorName, setFloorName] = useState("");
  const [floorToDelete, setFloorToDelete] = useState<Floor | null>(null);
  const loaded = useRef(false);

  const live = useLiveFloor(mode === "live");

  // Take the server's plan once; after that the editor owns it until saved.
  useEffect(() => {
    if (!data || loaded.current) return;
    loaded.current = true;
    dispatch({ type: "reset", layout: data });
    setSaved(JSON.stringify(data));
    setFloorId(data.floors[0]?.id ?? "");
  }, [data]);

  const dirty = saved !== "" && JSON.stringify(layout) !== saved;

  // Leaving with unsaved work asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** Applies a change and records the previous plan so it can be undone. */
  const commit = useCallback((change: (current: Layout) => Layout) => dispatch({ type: "commit", change }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  const floor = layout.floors.find((f) => f.id === floorId) ?? layout.floors[0] ?? null;
  const floorTables = useMemo(() => layout.tables.filter((t) => t.floorId === floor?.id), [layout.tables, floor?.id]);
  const selected = layout.tables.find((t) => t.id === selectedId) ?? null;

  const updateTable = useCallback(
    (id: string, change: (table: FloorTable) => FloorTable) => {
      commit((current) => ({ ...current, tables: current.tables.map((t) => (t.id === id ? change(t) : t)) }));
    },
    [commit],
  );

  const addTable = (template: TableTemplate) => {
    if (!floor) return;
    const id = newId("T");
    const table: FloorTable = {
      id,
      name: nextTableName(layout.tables),
      floorId: floor.id,
      shape: template.shape,
      position: findFreeSpot(floorTables, template.width, template.height),
      rotation: 0,
      size: { width: template.width, height: template.height },
      chairs: buildChairs(id, template.shape, template.width, template.height, template.seats),
    };
    commit((current) => ({ ...current, tables: [...current.tables, table] }));
    setSelectedId(id);
  };

  const removeTable = useCallback(
    (id: string) => {
      commit((current) => ({ ...current, tables: current.tables.filter((t) => t.id !== id) }));
      setSelectedId(null);
    },
    [commit],
  );

  const duplicateTable = useCallback(
    (id: string) => {
      const source = layout.tables.find((t) => t.id === id);
      if (!source) return;
      const copyId = newId("T");
      const copy: FloorTable = {
        ...source,
        id: copyId,
        name: nextTableName(layout.tables),
        position: findFreeSpot(
          layout.tables.filter((t) => t.floorId === source.floorId),
          source.size.width,
          source.size.height,
        ),
        chairs: buildChairs(copyId, source.shape, source.size.width, source.size.height, source.chairs.length),
      };
      commit((current) => ({ ...current, tables: [...current.tables, copy] }));
      setSelectedId(copyId);
    },
    [layout.tables, commit],
  );

  /** Changes a table's seat count, shape or size and lays its chairs out again. */
  const reshape = (table: FloorTable, change: { shape?: TableShape; width?: number; height?: number; seats?: number }) => {
    const shape = change.shape ?? table.shape;
    let width = Math.min(400, Math.max(60, change.width ?? table.size.width));
    let height = Math.min(400, Math.max(60, change.height ?? table.size.height));
    // Round and square tables are as deep as they are wide.
    if (shape !== "rectangle") {
      const side = change.height !== undefined && change.width === undefined ? height : width;
      width = side;
      height = side;
    } else if (change.shape === "rectangle" && table.shape !== "rectangle") {
      width = Math.max(width, 140);
      height = Math.min(height, 90);
    }
    const seats = change.seats ?? table.chairs.length;
    updateTable(table.id, (t) => ({
      ...t,
      shape,
      size: { width, height },
      position: clampPosition(t.position.x, t.position.y, width, height),
      chairs: buildChairs(t.id, shape, width, height, seats),
    }));
  };

  // --- Floors ----------------------------------------------------------------

  const submitFloor = () => {
    const name = floorName.trim();
    if (!name || !floorInput) return;
    const clash = layout.floors.some((f) => f.name.toLowerCase() === name.toLowerCase() && (floorInput.mode === "add" || f.id !== floorInput.id));
    if (clash) {
      toast.error(`You already have a floor called "${name}".`);
      return;
    }
    if (floorInput.mode === "add") {
      const id = nextFloorId(layout.floors);
      commit((current) => ({ ...current, floors: [...current.floors, { id, name }] }));
      setFloorId(id);
      setSelectedId(null);
    } else {
      const id = floorInput.id;
      commit((current) => ({ ...current, floors: current.floors.map((f) => (f.id === id ? { ...f, name } : f)) }));
    }
    setFloorInput(null);
    setFloorName("");
  };

  const deleteFloor = (target: Floor) => {
    commit((current) => ({
      floors: current.floors.filter((f) => f.id !== target.id),
      tables: current.tables.filter((t) => t.floorId !== target.id),
    }));
    setFloorId(layout.floors.find((f) => f.id !== target.id)?.id ?? "");
    setSelectedId(null);
    setFloorToDelete(null);
  };

  // --- Saving ----------------------------------------------------------------

  const handleSave = () => {
    const unnamed = layout.tables.find((t) => !t.name.trim());
    if (unnamed) {
      setFloorId(unnamed.floorId);
      setSelectedId(unnamed.id);
      toast.error("Every table needs a name.");
      return;
    }
    const clashes = duplicateNames(layout.tables);
    if (clashes.length > 0) {
      toast.error(`Two tables are named ${clashes.map((n) => `"${n}"`).join(", ")}. Guests book tables by name, so each must be different.`);
      return;
    }
    save.mutate(layout, {
      onSuccess: (stored) => {
        // The server may have given new floors their final ids.
        dispatch({ type: "reset", layout: stored });
        setSaved(JSON.stringify(stored));
        if (!stored.floors.some((f) => f.id === floorId)) setFloorId(stored.floors[0]?.id ?? "");
      },
    });
  };

  // --- Keyboard --------------------------------------------------------------

  useEffect(() => {
    if (mode !== "edit") return;
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;
      const meta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (meta && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (!selectedId) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeTable(selectedId);
      } else if (meta && key === "d") {
        event.preventDefault();
        duplicateTable(selectedId);
      } else if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        const step = event.shiftKey ? GRID * 5 : GRID;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        updateTable(selectedId, (t) => ({ ...t, position: clampPosition(t.position.x + dx, t.position.y + dy, t.size.width, t.size.height) }));
      } else if (event.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, selectedId, undo, redo, removeTable, duplicateTable, updateTable]);

  // --- Live view ---------------------------------------------------------------

  const liveById = useMemo(() => {
    const map: Record<string, LiveTable["live"]> = {};
    live.data?.tables.forEach((t) => {
      map[t.id] = t.live;
    });
    return map;
  }, [live.data]);
  const liveSelected = live.data?.tables.find((t) => t.id === selectedId) ?? null;

  if (isError) {
    return (
      <div role="alert" className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-base font-semibold text-gray-900">We couldn't load your floor plan</p>
        <p className="mt-1 text-sm text-gray-500">Check your connection and try again.</p>
        <button type="button" onClick={() => refetch()} className="mt-4 h-10 rounded-xl bg-teal px-5 text-sm font-semibold text-white hover:bg-teal-deep">
          Try again
        </button>
      </div>
    );
  }

  const editing = mode === "edit";
  // The live view shows what is saved on the server, not unsaved edits.
  const canvasTables = editing ? floorTables : (live.data?.tables.filter((t) => t.floorId === floor?.id) ?? []);
  const nameClash = selected ? layout.tables.some((t) => t.id !== selected.id && t.name.trim().toLowerCase() === selected.name.trim().toLowerCase()) : false;

  return (
    <div className="mx-auto w-full max-w-[1700px] space-y-4 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Floor plan</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isPending
              ? "Loading your floor plan…"
              : `${layout.floors.length} floor${layout.floors.length === 1 ? "" : "s"} · ${layout.tables.length} table${
                  layout.tables.length === 1 ? "" : "s"
                } · ${seatCount(layout.tables)} seats`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="View" className="inline-flex rounded-xl bg-gray-100 p-1">
            {(["edit", "live"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => {
                  setMode(m);
                  setSelectedId(null);
                }}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition",
                  mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900",
                )}
              >
                {m === "edit" ? "Arrange" : "Live view"}
              </button>
            ))}
          </div>

          {editing && (
            <>
              <IconButton label="Undo (Ctrl+Z)" onClick={undo} disabled={past.length === 0}>
                <Undo2 className="h-4 w-4" />
              </IconButton>
              <IconButton label="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={future.length === 0}>
                <Redo2 className="h-4 w-4" />
              </IconButton>
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || save.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : dirty ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {save.isPending ? "Saving…" : dirty ? "Save changes" : "Saved"}
              </button>
            </>
          )}
        </div>
      </header>

      {!editing && dirty && (
        <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-[13px] font-medium text-amber-900">
          You have unsaved changes. The live view shows the plan as it was last saved.
        </p>
      )}

      {/* Floors */}
      <div className="flex flex-wrap items-center gap-2">
        {layout.floors.map((f) =>
          floorInput?.mode === "rename" && floorInput.id === f.id ? (
            <FloorNameInput key={f.id} value={floorName} onChange={setFloorName} onSubmit={submitFloor} onCancel={() => setFloorInput(null)} label="Rename floor" />
          ) : (
            <button
              key={f.id}
              type="button"
              aria-pressed={floor?.id === f.id}
              onClick={() => {
                setFloorId(f.id);
                setSelectedId(null);
              }}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
                floor?.id === f.id ? "bg-teal text-white shadow-sm" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
              )}
            >
              {f.name}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", floor?.id === f.id ? "bg-white/20" : "bg-gray-100 text-gray-500")}>
                {layout.tables.filter((t) => t.floorId === f.id).length}
              </span>
            </button>
          ),
        )}

        {editing &&
          (floorInput?.mode === "add" ? (
            <FloorNameInput value={floorName} onChange={setFloorName} onSubmit={submitFloor} onCancel={() => setFloorInput(null)} label="New floor name" />
          ) : (
            <button
              type="button"
              onClick={() => {
                setFloorName("");
                setFloorInput({ mode: "add" });
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-4 text-sm font-semibold text-gray-600 transition hover:border-teal hover:text-teal"
            >
              <Plus className="h-4 w-4" /> Add floor
            </button>
          ))}

        {editing && floor && !floorInput && (
          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setFloorName(floor.name);
                setFloorInput({ mode: "rename", id: floor.id });
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-100"
            >
              <Pencil className="h-3.5 w-3.5" /> Rename floor
            </button>
            <button
              type="button"
              onClick={() => (floorTables.length > 0 ? setFloorToDelete(floor) : deleteFloor(floor))}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete floor
            </button>
          </span>
        )}
      </div>

      {editing && floorInput?.mode === "add" && (
        <div className="flex flex-wrap gap-1.5">
          {FLOOR_SUGGESTIONS.filter((s) => !layout.floors.some((f) => f.name.toLowerCase() === s.toLowerCase())).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setFloorName(suggestion)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-teal hover:text-teal"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {isPending ? (
        <div className="aspect-[1200/760] w-full animate-pulse rounded-2xl bg-gray-100" />
      ) : !floor ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
          <p className="text-base font-semibold text-gray-900">Start with your first floor</p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            A floor is any area guests can book: the main room, a terrace, the garden. Add one, then place your tables on it. You can add more at any time.
          </p>
          {editing && !floorInput && (
            <button
              type="button"
              onClick={() => {
                setFloorName("");
                setFloorInput({ mode: "add" });
              }}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-deep"
            >
              <Plus className="h-4 w-4" /> Add a floor
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0 space-y-4">
          {/* Table library */}
          {editing ? (
            <aside className="rounded-2xl border border-gray-200 bg-white p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 px-1 pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">Add a table</p>
                <p className="hidden text-[11px] text-gray-500 lg:block">Drag to move · Arrow keys nudge · Delete removes · Ctrl+D duplicates</p>
              </div>
              <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {TEMPLATES.map((template) => (
                  <li key={template.key}>
                    <button
                      type="button"
                      onClick={() => addTable(template)}
                      aria-label={`Add table: ${template.label} seats`}
                      className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-gray-200 px-1 py-3 text-[11px] font-semibold text-gray-600 transition hover:border-teal hover:bg-teal/5 hover:text-teal focus-visible:outline-2 focus-visible:outline-teal"
                    >
                      <TemplateIcon template={template} />
                      {template.label}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          ) : (
            <aside className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">Right now</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                {LIVE_LEGEND.map((item) => (
                  <li key={item.status} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className={cn("h-3.5 w-3.5 rounded", item.swatch)} />
                    {item.label}
                    <span className="font-semibold tabular-nums text-gray-900">{live.data?.counts[item.status] ?? "—"}</span>
                  </li>
                ))}
              </ul>
              <p className="ml-auto text-[11px] text-gray-500">Counts cover the whole restaurant and update as orders and bookings change.</p>
            </aside>
          )}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div
              className="relative"
              style={{
                backgroundImage: "radial-gradient(#d9dee5 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <FloorCanvas
                tables={canvasTables}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onTransform={editing ? (id, change) => updateTable(id, (t) => ({ ...t, position: { x: change.x, y: change.y }, rotation: change.rotation })) : undefined}
                live={editing ? undefined : liveById}
              />
              {canvasTables.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center">
                  <p className="max-w-xs text-sm text-gray-500">
                    {editing ? `${floor.name} has no tables yet. Pick a table from the list to place it here.` : `No tables saved on ${floor.name}.`}
                  </p>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Details */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-4 xl:self-start">
            {editing ? (
              selected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Table settings</p>
                    <button type="button" onClick={() => setSelectedId(null)} aria-label="Deselect table" className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <Field
                    label="Name"
                    htmlFor="table-name"
                    error={!selected.name.trim() ? "A table needs a name." : nameClash ? "Another table already has this name." : undefined}
                    hint="What guests and waiters see, e.g. T4 or Window 2."
                  >
                    <input
                      id="table-name"
                      value={selected.name}
                      maxLength={20}
                      onChange={(e) => updateTable(selected.id, (t) => ({ ...t, name: e.target.value }))}
                      aria-invalid={!selected.name.trim() || nameClash}
                      className={inputClass}
                    />
                  </Field>

                  <div>
                    <p className="mb-1.5 text-[13px] font-medium text-gray-700">Seats</p>
                    <div className="flex items-center gap-2">
                      <IconButton label="Remove a chair" onClick={() => reshape(selected, { seats: selected.chairs.length - 1 })} disabled={selected.chairs.length === 0}>
                        <Minus className="h-4 w-4" />
                      </IconButton>
                      <span aria-live="polite" className="w-10 text-center text-lg font-semibold tabular-nums text-gray-900">
                        {selected.chairs.length}
                      </span>
                      <IconButton label="Add a chair" onClick={() => reshape(selected, { seats: selected.chairs.length + 1 })} disabled={selected.chairs.length >= MAX_CHAIRS}>
                        <Plus className="h-4 w-4" />
                      </IconButton>
                      <span className="text-xs text-gray-500">chairs</span>
                    </div>
                  </div>

                  <Field label="Shape" htmlFor="table-shape">
                    <select id="table-shape" value={selected.shape} onChange={(e) => reshape(selected, { shape: e.target.value as TableShape })} className={inputClass}>
                      <option value="round">Round</option>
                      <option value="square">Square</option>
                      <option value="rectangle">Rectangle</option>
                    </select>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label={selected.shape === "rectangle" ? "Width" : "Size"} htmlFor="table-width">
                      <input
                        id="table-width"
                        type="number"
                        min={60}
                        max={400}
                        step={10}
                        value={selected.size.width}
                        onChange={(e) => reshape(selected, { width: Number(e.target.value) || 60 })}
                        className={inputClass}
                      />
                    </Field>
                    {selected.shape === "rectangle" && (
                      <Field label="Depth" htmlFor="table-height">
                        <input
                          id="table-height"
                          type="number"
                          min={60}
                          max={400}
                          step={10}
                          value={selected.size.height}
                          onChange={(e) => reshape(selected, { height: Number(e.target.value) || 60 })}
                          className={inputClass}
                        />
                      </Field>
                    )}
                  </div>

                  <div>
                    <p className="mb-1.5 text-[13px] font-medium text-gray-700">Rotation</p>
                    <div className="flex items-center gap-2">
                      <IconButton label="Rotate left 45°" onClick={() => updateTable(selected.id, (t) => ({ ...t, rotation: (t.rotation - 45 + 360) % 360 }))}>
                        <RotateCcw className="h-4 w-4" />
                      </IconButton>
                      <span className="w-12 text-center text-sm font-semibold tabular-nums text-gray-900">{Math.round(selected.rotation)}°</span>
                      <IconButton label="Rotate right 45°" onClick={() => updateTable(selected.id, (t) => ({ ...t, rotation: (t.rotation + 45) % 360 }))}>
                        <RotateCw className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>

                  {layout.floors.length > 1 && (
                    <Field label="Floor" htmlFor="table-floor">
                      <select
                        id="table-floor"
                        value={selected.floorId}
                        onChange={(e) => {
                          const target = e.target.value;
                          updateTable(selected.id, (t) => ({
                            ...t,
                            floorId: target,
                            position: findFreeSpot(
                              layout.tables.filter((other) => other.floorId === target),
                              t.size.width,
                              t.size.height,
                            ),
                          }));
                          setFloorId(target);
                        }}
                        className={inputClass}
                      >
                        {layout.floors.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  <div className="flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => duplicateTable(selected.id)}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTable(selected.id)}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-50 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm font-semibold text-gray-900">No table selected</p>
                  <p className="mx-auto mt-1 max-w-[14rem] text-[13px] text-gray-500">
                    Select a table to rename it, add or remove chairs, or change its shape.
                  </p>
                </div>
              )
            ) : liveSelected ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Table {liveSelected.name}</p>
                <dl className="space-y-2 text-sm">
                  <Row term="Status" value={LIVE_LEGEND.find((l) => l.status === liveSelected.live.status)?.label ?? "Free"} />
                  <Row term="Seats" value={String(liveSelected.seats)} />
                  {liveSelected.live.status !== "free" && <Row term="Guests" value={String(liveSelected.live.guests || "—")} />}
                  {liveSelected.live.status === "reserved" && (
                    <>
                      <Row term="Booked by" value={liveSelected.live.detail || "—"} />
                      <Row term="Time" value={`${formatTime(liveSelected.live.since)} – ${formatTime(liveSelected.live.until)}`} />
                    </>
                  )}
                  {liveSelected.live.status === "occupied" && (
                    <Row
                      term="Order"
                      value={{ placed: "Waiting to be served", served: "Served", ready_to_pay: "Bill requested" }[liveSelected.live.detail ?? ""] ?? "Seated"}
                    />
                  )}
                </dl>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm font-semibold text-gray-900">{live.isPending ? "Loading the floor…" : "Select a table"}</p>
                <p className="mx-auto mt-1 max-w-[14rem] text-[13px] text-gray-500">See who is seated or due at any table.</p>
              </div>
            )}
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={floorToDelete !== null}
        title={`Delete ${floorToDelete?.name ?? "this floor"}?`}
        description={`Its ${layout.tables.filter((t) => t.floorId === floorToDelete?.id).length} table(s) are removed with it. You can undo this until you save.`}
        confirmLabel="Delete floor and tables"
        destructive
        onCancel={() => setFloorToDelete(null)}
        onConfirm={() => floorToDelete && deleteFloor(floorToDelete)}
      />

      {/* Kept for screen readers and tests: the logical drawing size. */}
      <span className="sr-only">
        Layout area {CANVAS.width} by {CANVAS.height}
      </span>
    </div>
  );
}

function IconButton({ label, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500">{term}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function FloorNameInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  label: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-1"
    >
      <input
        autoFocus
        aria-label={label}
        value={value}
        maxLength={60}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        placeholder="Floor name"
        className={cn(inputClass, "h-10 w-44 rounded-full")}
      />
      <button type="submit" disabled={!value.trim()} aria-label="Save floor name" className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-white transition hover:bg-teal-deep disabled:opacity-40">
        <Check className="h-4 w-4" />
      </button>
      <button type="button" onClick={onCancel} aria-label="Cancel" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100">
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}

/** A small drawing of a table shape with its chairs. */
function TemplateIcon({ template }: { template: TableTemplate }) {
  const scale = 0.2;
  const w = template.width * scale;
  const h = template.height * scale;
  const chairs = buildChairs("icon", template.shape, template.width, template.height, template.seats);
  const round = template.shape === "round";
  return (
    <svg width={62} height={40} viewBox="-31 -20 62 40" aria-hidden>
      {chairs.map((chair, i) => {
        let x = 0;
        let y = 0;
        if (round) {
          const angle = (i / chairs.length) * Math.PI * 2;
          x = Math.sin(angle) * (w / 2 + 5);
          y = -Math.cos(angle) * (h / 2 + 5);
        } else {
          const side = chair.position;
          const onSide = chairs.filter((c) => c.position === side);
          const along = (onSide.indexOf(chair) + 0.5) / onSide.length;
          if (side === "top") [x, y] = [-w / 2 + along * w, -h / 2 - 5];
          else if (side === "bottom") [x, y] = [-w / 2 + along * w, h / 2 + 5];
          else if (side === "left") [x, y] = [-w / 2 - 5, -h / 2 + along * h];
          else [x, y] = [w / 2 + 5, -h / 2 + along * h];
        }
        return <circle key={i} cx={x} cy={y} r={2.6} fill="currentColor" opacity={0.45} />;
      })}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={round ? w / 2 : 3} fill="none" stroke="currentColor" strokeWidth={1.6} />
    </svg>
  );
}
