"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CalendarClock, CreditCard, LogOut, ReceiptText, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useOrders, useReservations } from "@/hooks/queries";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatKes, formatTime, initials, paymentMeta, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Notice {
  id: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  title: string;
  detail: string;
  when: string;
}

/** How far ahead a reservation is announced in the notification list. */
const ARRIVING_SOON_MS = 60 * 60 * 1000;

export function Header({ live }: { live: boolean }) {
  const { user, signOut } = useAuth();
  const { data: orders } = useOrders();
  const { data: reservations } = useReservations();

  const [panel, setPanel] = useState<"notices" | "account" | null>(null);
  const controls = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setPanel(null), []);
  useClickOutside(controls, close, panel !== null);

  // What needs someone's attention right now, most urgent first.
  const notices = useMemo<Notice[]>(() => {
    const list: Notice[] = [];
    for (const order of orders ?? []) {
      if (order.orderStatus === "ready_to_pay") {
        list.push({
          id: `pay-${order._id}`,
          href: "/orders",
          icon: CreditCard,
          tone: "bg-violet-50 text-violet-600",
          title: `Table ${order.tableNumber} asked for the bill`,
          detail: `${formatKes(order.totalAmount)} · ${paymentMeta(order.paymentMethod).label}`,
          when: timeAgo(order.updatedAt ?? order.createdAt),
        });
      }
    }
    for (const order of orders ?? []) {
      if (order.orderStatus === "placed") {
        list.push({
          id: `new-${order._id}`,
          href: "/orders",
          icon: ReceiptText,
          tone: "bg-amber-50 text-amber-600",
          title: `New order · Table ${order.tableNumber}`,
          detail: `${order.items.length} item${order.items.length === 1 ? "" : "s"} waiting to be served`,
          when: timeAgo(order.createdAt),
        });
      }
    }
    const now = Date.now();
    for (const reservation of reservations ?? []) {
      const start = new Date(reservation.start).getTime();
      if (reservation.status === "active" && start >= now - 15 * 60_000 && start - now <= ARRIVING_SOON_MS) {
        list.push({
          id: `res-${reservation._id}`,
          href: "/reservations",
          icon: CalendarClock,
          tone: "bg-teal-50 text-teal-600",
          title: `${reservation.name} arrives at ${formatTime(reservation.start)}`,
          detail: `${reservation.guests} guest${reservation.guests === 1 ? "" : "s"} · Table ${reservation.table}`,
          when: start > now ? `in ${Math.max(1, Math.round((start - now) / 60_000))} min` : "now",
        });
      }
    }
    return list;
  }, [orders, reservations]);

  const today = new Date().toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });
  const trialDaysLeft =
    user?.subscriptionStatus === "trialing" && user.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / 86_400_000))
      : null;

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/85 px-3 backdrop-blur-xl sm:px-5 md:rounded-t-xl">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900" />
        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          <span className="truncate text-sm font-semibold text-gray-900">{user?.restaurantName || "Swiftab"}</span>
          {trialDaysLeft !== null && (
            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
              Trial · {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left
            </span>
          )}
        </div>
      </div>

      <div ref={controls} className="flex items-center gap-1.5 sm:gap-2">
        <span
          title={live ? "Orders and reservations update as they happen" : "Reconnecting. The page still refreshes every few seconds."}
          className={cn(
            "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold md:flex",
            live ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", live ? "animate-pulse bg-emerald-500" : "bg-gray-400")} />
          {live ? "Live" : "Syncing"}
        </span>
        <span className="hidden whitespace-nowrap text-xs font-medium text-gray-500 lg:block">{today}</span>

        <div className="relative">
          <button
            type="button"
            aria-label={notices.length ? `Notifications, ${notices.length} need attention` : "Notifications"}
            aria-expanded={panel === "notices"}
            onClick={() => setPanel(panel === "notices" ? null : "notices")}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-teal"
          >
            <Bell className="h-[18px] w-[18px]" />
            {notices.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {notices.length > 9 ? "9+" : notices.length}
              </span>
            )}
          </button>

          {panel === "notices" && (
            <div className="absolute right-0 top-11 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Needs attention</p>
                <p className="text-xs text-gray-500">Open bills, new orders and guests arriving soon</p>
              </div>
              {notices.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">You're all caught up.</p>
              ) : (
                <ul className="max-h-80 divide-y divide-gray-50 overflow-y-auto">
                  {notices.map((notice) => (
                    <li key={notice.id}>
                      <Link
                        href={notice.href}
                        onClick={close}
                        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                      >
                        <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", notice.tone)}>
                          <notice.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">{notice.title}</span>
                          <span className="block truncate text-xs text-gray-500">{notice.detail}</span>
                        </span>
                        <span className="shrink-0 text-[11px] font-medium text-gray-400">{notice.when}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={panel === "account"}
            onClick={() => setPanel(panel === "account" ? null : "account")}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal text-xs font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            {initials(user?.name)}
          </button>

          {panel === "account" && (
            <div className="absolute right-0 top-11 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1.5 shadow-xl">
              <div className="border-b border-gray-100 px-4 pb-3 pt-2">
                <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
              <Link href="/settings?tab=account" onClick={close} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <UserRound className="h-4 w-4 text-gray-400" /> Your account
              </Link>
              <Link href="/settings" onClick={close} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Settings className="h-4 w-4 text-gray-400" /> Restaurant settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  close();
                  signOut();
                }}
                className="flex w-full items-center gap-2.5 border-t border-gray-100 px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
