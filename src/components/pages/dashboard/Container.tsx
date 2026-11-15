"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Banknote, CalendarCheck, CreditCard, ReceiptText, RefreshCw, Utensils } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useDashboardStats, useOrders } from "@/hooks/queries";
import { ORDER_STATUS, formatKes, formatTime, paymentMeta } from "@/lib/format";
import { isOpenNow } from "@/lib/restaurant";
import { cn } from "@/lib/utils";
import type { DashboardPeriod } from "@/types/api";
import { OccupancyPanel, Panel, PaymentsPanel, PeakHoursPanel, StaffPanel, SummaryPanel, TopItemsPanel, UpcomingPanel } from "./Panels";
import { StatTile } from "./StatTile";
import { TrendCard } from "./TrendCard";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardContainer() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<DashboardPeriod>("weekly");
  const { data: stats, isPending, isError, isFetching, refetch } = useDashboardStats(period);
  const { data: orders, isPending: ordersPending } = useOrders();

  const live = stats?.live;
  const kpi = stats?.kpiTrends;
  const open = isOpenNow(user?.openingHours);
  const recent = (orders ?? []).slice(0, 6);
  const spark = (points?: { value: number }[]) => points?.map((p) => p.value);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {greeting()}, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
            {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}
            {open !== null && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                  open ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", open ? "bg-emerald-500" : "bg-gray-400")} />
                {open ? "Open now" : "Closed now"}
              </span>
            )}
            {user?.acceptingReservations === false && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">Reservations paused</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Refresh
        </button>
      </header>

      {isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>We couldn't load your figures. The numbers below may be out of date.</span>
          <button type="button" onClick={() => refetch()} className="font-semibold underline underline-offset-4">
            Try again
          </button>
        </div>
      )}

      {/* The one thing that most needs action: guests waiting to pay. */}
      {live && live.awaitingPayment > 0 && (
        <Link
          href="/orders?tab=payment"
          className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 transition hover:bg-violet-100/70"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
              <CreditCard className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-gray-900">
                {live.awaitingPayment} table{live.awaitingPayment === 1 ? " is" : "s are"} waiting to pay
              </span>
              <span className="block text-xs text-gray-600">{formatKes(live.unpaidAmount)} on open bills across the floor</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-violet-700">
            Go to orders <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Revenue today"
          icon={Banknote}
          loading={isPending}
          value={formatKes(kpi?.revenue.today)}
          change={kpi?.revenue.changePercent}
          trend={spark(kpi?.revenue.sparkline)}
        />
        <StatTile
          label="Orders today"
          icon={ReceiptText}
          loading={isPending}
          value={kpi?.orders.today ?? 0}
          change={kpi?.orders.changePercent}
          trend={spark(kpi?.orders.sparkline)}
        />
        <StatTile
          label="Tables seated"
          icon={Utensils}
          loading={isPending}
          value={
            <>
              {live?.seatedTables ?? 0}
              <span className="text-lg font-medium text-gray-400"> / {live?.totalTables ?? 0}</span>
            </>
          }
          footer={
            <div className="w-full">
              <div
                role="meter"
                aria-label="Floor occupancy"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={live?.occupancyRate ?? 0}
                className="h-1.5 w-full overflow-hidden rounded-full bg-teal/15"
              >
                <div className="h-full rounded-full bg-teal transition-[width] duration-500" style={{ width: `${live?.occupancyRate ?? 0}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                {live?.occupancyRate ?? 0}% occupied · {live?.activeGuests ?? 0} guests in the house
              </p>
            </div>
          }
        />
        <StatTile
          label="Reservations today"
          icon={CalendarCheck}
          loading={isPending}
          value={live?.reservationsToday ?? 0}
          change={kpi?.reservations.changePercent}
          trend={spark(kpi?.reservations.sparkline)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TrendCard trend={stats?.trend} period={period} onPeriodChange={setPeriod} loading={isPending} />
        <SummaryPanel stats={stats} loading={isPending} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OccupancyPanel areas={stats?.areaOccupancy} loading={isPending} />
        <PeakHoursPanel hours={stats?.peakHours} loading={isPending} />
        <PaymentsPanel methods={stats?.paymentMethods} loading={isPending} />
        <TopItemsPanel items={stats?.topItems} loading={isPending} />
        <UpcomingPanel reservations={stats?.upcomingReservations} loading={isPending} />
        <StaffPanel staff={stats?.staff} loading={isPending} />
      </div>

      <Panel
        title="Latest orders"
        subtitle="Newest first"
        action={
          <Link href="/orders" className="shrink-0 text-xs font-semibold text-teal hover:underline">
            All orders
          </Link>
        }
      >
        {ordersPending ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">No orders yet. They appear here the moment a guest orders from the app.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-y border-gray-100 bg-gray-50/60 text-xs font-medium text-gray-500">
                  <th className="px-5 py-2.5 font-medium">Table</th>
                  <th className="px-3 py-2.5 font-medium">Time</th>
                  <th className="px-3 py-2.5 font-medium">Items</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Payment</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((order) => {
                  const status = ORDER_STATUS[order.orderStatus] ?? ORDER_STATUS.placed;
                  const payment = paymentMeta(order.paymentMethod);
                  return (
                    <tr key={order._id}>
                      <td className="px-5 py-3 font-semibold text-gray-900">{order.tableNumber}</td>
                      <td className="px-3 py-3 tabular-nums text-gray-600">{formatTime(order.createdAt)}</td>
                      <td className="max-w-[280px] truncate px-3 py-3 text-gray-600">
                        {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", status.badge)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", payment.badge)}>
                          {payment.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-gray-900">{formatKes(order.totalAmount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
