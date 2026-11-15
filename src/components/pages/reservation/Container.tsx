"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CalendarDays, Loader2, Search, UserCheck, UserX, Users } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { inputClass } from "@/components/ui/field";
import { useReservations, useUpdateReservation } from "@/hooks/queries";
import { RESERVATION_STATUS, formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Reservation, ReservationStatus } from "@/types/api";

type Tab = "upcoming" | "today" | "seated" | "past" | "cancelled" | "all";

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const PAGE = 25;

const TABS: { key: Tab; label: string; match: (r: Reservation, now: Date) => boolean }[] = [
  { key: "upcoming", label: "Upcoming", match: (r) => r.status === "active" },
  { key: "today", label: "Today", match: (r, now) => sameDay(new Date(r.start), now) && r.status !== "cancelled" },
  { key: "seated", label: "Seated", match: (r) => r.status === "seated" },
  { key: "past", label: "Completed", match: (r) => r.status === "completed" },
  { key: "cancelled", label: "Cancelled / no-show", match: (r) => r.status === "cancelled" || r.status === "no_show" },
  { key: "all", label: "All", match: () => true },
];

/** The host stand: who is coming, who is seated, and moving bookings along. */
export default function ReservationsPage() {
  const { data, isPending, isError, refetch } = useReservations();
  const update = useUpdateReservation();

  const [tab, setTab] = useState<Tab>("upcoming");
  const [query, setQuery] = useState("");
  const [floor, setFloor] = useState("all");
  const [date, setDate] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [toCancel, setToCancel] = useState<Reservation | null>(null);

  const reservations = useMemo(() => data ?? [], [data]);
  const now = new Date();
  const floors = useMemo(() => [...new Set(reservations.map((r) => r.floor).filter(Boolean))].sort(), [reservations]);

  const visible = useMemo(() => {
    const active = TABS.find((t) => t.key === tab)!;
    const q = query.trim().toLowerCase();
    const moment = new Date();
    const list = reservations.filter((r) => {
      if (!active.match(r, moment)) return false;
      if (floor !== "all" && r.floor !== floor) return false;
      if (date && new Date(r.start).toLocaleDateString("en-CA") !== date) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.phoneNumber.toLowerCase().includes(q) ||
        r.table.toLowerCase().includes(q) ||
        (r.reservationID ?? "").toLowerCase().includes(q)
      );
    });
    // Upcoming bookings read soonest first; history reads newest first.
    const soonestFirst = tab === "upcoming" || tab === "today" || tab === "seated";
    return list.sort((a, b) => (new Date(a.start).getTime() - new Date(b.start).getTime()) * (soonestFirst ? 1 : -1));
  }, [reservations, tab, query, floor, date]);

  const todays = reservations.filter((r) => sameDay(new Date(r.start), now) && r.status !== "cancelled" && r.status !== "no_show");
  const figures = [
    { label: "Today", value: todays.length, hint: `${todays.reduce((sum, r) => sum + r.guests, 0)} guests expected`, icon: CalendarDays },
    { label: "Upcoming", value: reservations.filter((r) => r.status === "active").length, hint: "Still to arrive", icon: CalendarClock },
    { label: "Seated now", value: reservations.filter((r) => r.status === "seated").length, hint: "At their table", icon: UserCheck },
    { label: "No-shows", value: reservations.filter((r) => r.status === "no_show").length, hint: "In your recent bookings", icon: UserX },
  ];

  const setStatus = (reservation: Reservation, status: ReservationStatus) => update.mutate({ id: reservation._id, status });
  const busyId = update.isPending ? update.variables?.id : null;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Reservations</h1>
        <p className="mt-1 text-sm text-gray-500">Bookings made in the guest app. Seat parties as they arrive so the floor stays accurate.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {figures.map((figure) => (
          <div key={figure.label} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-gray-500">{figure.label}</p>
              <figure.icon className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">{isPending ? "—" : figure.value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{figure.hint}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div role="tablist" aria-label="Reservation status" className="-mx-1 flex gap-1 overflow-x-auto px-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={tab === t.key}
                onClick={() => {
                  setTab(t.key);
                  setShown(PAGE);
                }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition focus-visible:outline-2 focus-visible:outline-teal",
                  tab === t.key ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {t.label}
                <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] tabular-nums", tab === t.key ? "bg-white/15" : "bg-gray-100 text-gray-500")}>
                  {reservations.filter((r) => t.match(r, now)).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input type="date" aria-label="Filter by date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(inputClass, "h-10 sm:w-40")} />
            {floors.length > 1 && (
              <select aria-label="Filter by floor" value={floor} onChange={(e) => setFloor(e.target.value)} className={cn(inputClass, "h-10 sm:w-40")}>
                <option value="all">All floors</option>
                {floors.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            )}
            <div className="relative sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                aria-label="Search reservations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Guest, phone or table"
                className={cn(inputClass, "h-10 pl-9")}
              />
            </div>
          </div>
        </div>

        {isError ? (
          <div role="alert" className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-900">We couldn't load your reservations</p>
            <p className="mt-1 text-sm text-gray-500">Check your connection and try again.</p>
            <button type="button" onClick={() => refetch()} className="mt-4 h-9 rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-deep">
              Try again
            </button>
          </div>
        ) : isPending ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-900">{reservations.length === 0 ? "No reservations yet" : "No reservations match"}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              {reservations.length === 0
                ? "When a guest books a table in the Swiftab app, it appears here."
                : "Try another tab, date or search."}
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100">
              {visible.slice(0, shown).map((r) => {
                const status = RESERVATION_STATUS[r.status] ?? RESERVATION_STATUS.active;
                const busy = busyId === r._id;
                return (
                  <li key={r._id} className="grid items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-900">
                        <span className="truncate">{r.name || "Guest"}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", status.badge)}>{status.label}</span>
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {r.phoneNumber}
                        {r.notes ? ` · “${r.notes}”` : ""}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{sameDay(new Date(r.start), now) ? "Today" : formatDate(r.start)}</p>
                      <p className="text-xs tabular-nums text-gray-500">
                        {formatTime(r.start)} – {formatTime(r.end)}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Table {r.table}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        {r.guests} guest{r.guests === 1 ? "" : "s"}
                        {r.floor ? ` · ${r.floor}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                      {busy && <Loader2 className="h-4 w-4 animate-spin text-teal" />}
                      {r.status === "active" && (
                        <>
                          <ActionButton primary disabled={busy} onClick={() => setStatus(r, "seated")}>
                            Seat
                          </ActionButton>
                          <ActionButton disabled={busy} onClick={() => setStatus(r, "no_show")}>
                            No-show
                          </ActionButton>
                          <ActionButton danger disabled={busy} onClick={() => setToCancel(r)}>
                            Cancel
                          </ActionButton>
                        </>
                      )}
                      {r.status === "seated" && (
                        <ActionButton primary disabled={busy} onClick={() => setStatus(r, "completed")}>
                          Mark finished
                        </ActionButton>
                      )}
                      {(r.status === "no_show" || r.status === "cancelled") && new Date(r.end).getTime() > Date.now() && (
                        <ActionButton disabled={busy} onClick={() => setStatus(r, "active")}>
                          Restore
                        </ActionButton>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {visible.length > shown && (
              <div className="border-t border-gray-100 p-3 text-center">
                <button type="button" onClick={() => setShown((n) => n + PAGE)} className="h-9 rounded-lg px-4 text-sm font-semibold text-teal transition hover:bg-teal/5">
                  Show {Math.min(PAGE, visible.length - shown)} more
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ConfirmDialog
        open={toCancel !== null}
        title={`Cancel ${toCancel?.name ?? "this guest"}'s reservation?`}
        description={`Table ${toCancel?.table ?? ""} is freed for ${toCancel ? formatTime(toCancel.start) : ""} and the guest is notified in the app.`}
        confirmLabel="Cancel reservation"
        destructive
        busy={update.isPending}
        onCancel={() => setToCancel(null)}
        onConfirm={() => toCancel && update.mutate({ id: toCancel._id, status: "cancelled" }, { onSuccess: () => setToCancel(null) })}
      />
    </div>
  );
}

function ActionButton({
  primary,
  danger,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "h-8 rounded-lg px-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        primary
          ? "bg-teal text-white hover:bg-teal-deep"
          : danger
            ? "text-rose-600 hover:bg-rose-50"
            : "border border-gray-200 text-gray-700 hover:bg-gray-50",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
