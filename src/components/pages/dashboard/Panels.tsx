"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Users } from "lucide-react";
import { formatKes, formatTime, initials, paymentMeta } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Comparison, DashboardStats } from "@/types/api";

/** The frame every dashboard panel shares. */
export function Panel({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex flex-col rounded-2xl border border-gray-200 bg-white p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-gray-500">{children}</p>;
}

function Rows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  );
}

// --- Period summary ----------------------------------------------------------

const PERIOD_NAME = { weekly: "7 days", monthly: "30 days", yearly: "12 months" } as const;

export function SummaryPanel({ stats, loading }: { stats?: DashboardStats; loading: boolean }) {
  const s = stats?.summary;
  const rows: { label: string; value: string; comparison?: Comparison; upIsGood: boolean }[] = [
    { label: "Revenue", value: formatKes(s?.revenue.value), comparison: s?.revenue, upIsGood: true },
    { label: "Orders", value: String(s?.orders.value ?? 0), comparison: s?.orders, upIsGood: true },
    { label: "Average order", value: formatKes(s?.avgOrderValue.value), comparison: s?.avgOrderValue, upIsGood: true },
    { label: "Reservations", value: String(s?.reservations.value ?? 0), comparison: s?.reservations, upIsGood: true },
    { label: "Cancelled or no-show", value: `${s?.cancellationRate.value ?? 0}%`, comparison: s?.cancellationRate, upIsGood: false },
  ];

  return (
    <Panel
      title="This period"
      subtitle={stats ? `Last ${PERIOD_NAME[stats.period]}, against the ${PERIOD_NAME[stats.period]} before` : undefined}
    >
      {loading ? (
        <Rows count={5} />
      ) : (
        <dl className="divide-y divide-gray-100">
          {rows.map((row) => {
            const change = row.comparison?.changePercent ?? 0;
            const good = change === 0 ? null : change > 0 === row.upIsGood;
            return (
              <div key={row.label} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <dt className="text-[13px] text-gray-500">{row.label}</dt>
                <dd className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold tabular-nums text-gray-900">{row.value}</span>
                  <span
                    className={cn(
                      "inline-flex min-w-[3.25rem] items-center justify-end gap-0.5 text-xs font-semibold tabular-nums",
                      good === null ? "text-gray-400" : good ? "text-emerald-700" : "text-rose-700",
                    )}
                  >
                    {change > 0 && <ArrowUpRight className="h-3 w-3" />}
                    {change < 0 && <ArrowDownRight className="h-3 w-3" />}
                    {change === 0 ? "No change" : `${Math.abs(change)}%`}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </Panel>
  );
}

// --- Floor -------------------------------------------------------------------

export function OccupancyPanel({ areas, loading }: { areas?: DashboardStats["areaOccupancy"]; loading: boolean }) {
  return (
    <Panel
      title="Floor right now"
      subtitle="Seated tables by area"
      action={
        <Link href="/tables/floorplan" className="shrink-0 text-xs font-semibold text-teal hover:underline">
          Open floor plan
        </Link>
      }
    >
      {loading ? (
        <Rows />
      ) : !areas || areas.length === 0 ? (
        <Empty>Add your floors and tables in the floor plan to see occupancy here.</Empty>
      ) : (
        <ul className="space-y-4">
          {areas.map((area) => (
            <li key={area.area}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium text-gray-900">{area.area}</span>
                <span className="shrink-0 text-xs tabular-nums text-gray-500">
                  {area.occupied} of {area.total} seated
                  {area.reserved > 0 && ` · ${area.reserved} reserved`}
                </span>
              </div>
              {/* Meter: the track is a lighter step of the fill's own colour. */}
              <div
                role="meter"
                aria-label={`${area.area} occupancy`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={area.percentage}
                className="h-2 w-full overflow-hidden rounded-full bg-teal/15"
              >
                <div className="h-full rounded-full bg-teal transition-[width] duration-500" style={{ width: `${area.percentage}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// --- Peak hours --------------------------------------------------------------

export function PeakHoursPanel({ hours, loading }: { hours?: DashboardStats["peakHours"]; loading: boolean }) {
  const busiest = hours?.length ? hours.reduce((a, b) => (b.orders > a.orders ? b : a)) : null;

  return (
    <Panel title="Busiest hours" subtitle={busiest ? `Most orders arrive around ${busiest.label}` : "Orders by hour of day"}>
      {loading ? (
        <div className="h-[200px] animate-pulse rounded-xl bg-gray-100" />
      ) : !hours || hours.length === 0 ? (
        <Empty>Once orders come in, you'll see when your kitchen is busiest.</Empty>
      ) : (
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hours} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#eef0f3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickMargin={8} minTickGap={12} />
              <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: "#f3f4f6" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as DashboardStats["peakHours"][number];
                  return (
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg">
                      <p className="text-xs font-medium text-gray-500">{point.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        {point.orders} order{point.orders === 1 ? "" : "s"}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="orders" fill="#008080" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}

// --- Payments ----------------------------------------------------------------

export function PaymentsPanel({ methods, loading }: { methods?: DashboardStats["paymentMethods"]; loading: boolean }) {
  const total = (methods ?? []).reduce((sum, m) => sum + m.revenue, 0);

  return (
    <Panel title="How guests paid" subtitle="Share of paid revenue">
      {loading ? (
        <Rows count={3} />
      ) : !methods || methods.length === 0 || total === 0 ? (
        <Empty>Payment methods appear here after the first bill is settled.</Empty>
      ) : (
        <>
          {/* One whole split into parts; a 2px gap separates the segments. */}
          <div
            role="img"
            aria-label={methods.map((m) => `${paymentMeta(m.method).label} ${m.percentage}%`).join(", ")}
            className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
          >
            {methods.map((m) => (
              <div
                key={m.method}
                title={`${paymentMeta(m.method).label}: ${formatKes(m.revenue)} (${m.percentage}%)`}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{ width: `${(m.revenue / total) * 100}%`, backgroundColor: paymentMeta(m.method).color }}
              />
            ))}
          </div>
          <ul className="mt-4 divide-y divide-gray-100">
            {methods.map((m) => (
              <li key={m.method} className="flex items-center justify-between gap-3 py-2.5 last:pb-0">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: paymentMeta(m.method).color }} />
                  <span className="truncate text-sm font-medium text-gray-900">{paymentMeta(m.method).label}</span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {m.count} bill{m.count === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="flex shrink-0 items-baseline gap-2.5">
                  <span className="text-sm font-semibold tabular-nums text-gray-900">{formatKes(m.revenue)}</span>
                  <span className="w-9 text-right text-xs tabular-nums text-gray-500">{m.percentage}%</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

// --- Top dishes --------------------------------------------------------------

export function TopItemsPanel({ items, loading }: { items?: DashboardStats["topItems"]; loading: boolean }) {
  const max = Math.max(1, ...(items ?? []).map((i) => i.quantity));

  return (
    <Panel
      title="Best sellers"
      subtitle="By portions sold"
      action={
        <Link href="/dishes" className="shrink-0 text-xs font-semibold text-teal hover:underline">
          Menu
        </Link>
      }
    >
      {loading ? (
        <Rows count={5} />
      ) : !items || items.length === 0 ? (
        <Empty>Your most ordered dishes will be ranked here.</Empty>
      ) : (
        <ol className="space-y-3.5">
          {items.map((item, index) => (
            <li key={item.name}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="w-4 shrink-0 text-xs font-semibold tabular-nums text-gray-400">{index + 1}</span>
                  <span className="truncate text-sm font-medium text-gray-900">{item.name}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-gray-500">
                  {item.quantity} sold · {formatKes(item.revenue)}
                </span>
              </div>
              <div className="ml-6 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-teal" style={{ width: `${(item.quantity / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

// --- Reservations ------------------------------------------------------------

export function UpcomingPanel({ reservations, loading }: { reservations?: DashboardStats["upcomingReservations"]; loading: boolean }) {
  return (
    <Panel
      title="Arriving today"
      subtitle="Upcoming reservations"
      action={
        <Link href="/reservations" className="shrink-0 text-xs font-semibold text-teal hover:underline">
          All reservations
        </Link>
      }
    >
      {loading ? (
        <Rows />
      ) : !reservations || reservations.length === 0 ? (
        <Empty>No more reservations today.</Empty>
      ) : (
        <ul className="divide-y divide-gray-100">
          {reservations.map((r) => (
            <li key={r._id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="w-[4.25rem] shrink-0 text-sm font-semibold tabular-nums text-gray-900">{formatTime(r.time)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900">{r.name || "Guest"}</span>
                <span className="block truncate text-xs text-gray-500">
                  Table {r.tableNumber}
                  {r.diningArea ? ` · ${r.diningArea}` : ""}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-500">
                <Users className="h-3.5 w-3.5" />
                {r.guests}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// --- Staff -------------------------------------------------------------------

export function StaffPanel({ staff, loading }: { staff?: DashboardStats["staff"]; loading: boolean }) {
  return (
    <Panel
      title="Team"
      subtitle="Tables served this period"
      action={
        <Link href="/settings?tab=staff" className="shrink-0 text-xs font-semibold text-teal hover:underline">
          Manage staff
        </Link>
      }
    >
      {loading ? (
        <Rows count={3} />
      ) : !staff || staff.length === 0 ? (
        <Empty>When waiters serve orders in the app, their numbers show up here.</Empty>
      ) : (
        <ul className="divide-y divide-gray-100">
          {staff.map((member) => (
            <li key={member.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
                {initials(member.name)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{member.name}</span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-semibold tabular-nums text-gray-900">{member.orders} tables</span>
                <span className="block text-xs tabular-nums text-gray-500">{formatKes(member.revenue)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
