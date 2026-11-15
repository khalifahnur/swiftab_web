"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Banknote, CreditCard, ReceiptText, Search, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { inputClass } from "@/components/ui/field";
import { useOrders } from "@/hooks/queries";
import { ORDER_STATUS, formatKes, formatTime, paymentMeta, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";
import { OrderDetail, orderNumber } from "./OrderDetail";

type Tab = "all" | "new" | "served" | "payment" | "paid" | "cancelled";

const TABS: { key: Tab; label: string; match: (order: Order) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "new", label: "New", match: (o) => o.orderStatus === "placed" },
  { key: "served", label: "Served", match: (o) => o.orderStatus === "served" },
  { key: "payment", label: "Bill requested", match: (o) => o.orderStatus === "ready_to_pay" },
  { key: "paid", label: "Paid", match: (o) => o.orderStatus === "completed" },
  { key: "cancelled", label: "Cancelled", match: (o) => o.orderStatus === "cancelled" },
];

const isToday = (value: string) => new Date(value).toDateString() === new Date().toDateString();

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", className)}>{children}</span>;
}

/** Shows how an order is being, or was, paid for. */
function PaymentCell({ order }: { order: Order }) {
  const payment = paymentMeta(order.paymentMethod);
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge className={payment.badge}>{payment.label}</Badge>
      <span className="text-[11px] font-medium text-gray-500">
        {order.paymentStatus === "paid" ? `Paid ${formatTime(order.paidAt)}` : order.orderStatus === "cancelled" ? "Not charged" : "Unpaid"}
      </span>
    </div>
  );
}

export default function OrdersContainer() {
  const { user } = useAuth();
  const params = useSearchParams();
  const { data, isPending, isError, refetch } = useOrders();

  const initialTab = TABS.some((t) => t.key === params.get("tab")) ? (params.get("tab") as Tab) : "all";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("any");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => setTab(initialTab), [initialTab]);

  const orders = useMemo(() => data ?? [], [data]);
  // Looked up from the live list so the open bill updates as the order changes.
  const selected = orders.find((o) => o._id === selectedId) ?? null;

  const visible = useMemo(() => {
    const active = TABS.find((t) => t.key === tab)!;
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (!active.match(order)) return false;
      if (method !== "any" && (order.paymentMethod || "none") !== method) return false;
      if (!q) return true;
      return (
        order.tableNumber.toLowerCase().includes(q) ||
        orderNumber(order).toLowerCase().includes(q) ||
        (order.userId?.name ?? "").toLowerCase().includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q))
      );
    });
  }, [orders, tab, query, method]);

  const today = orders.filter((o) => isToday(o.createdAt));
  const figures = [
    { label: "New", value: orders.filter((o) => o.orderStatus === "placed").length, hint: "Waiting for a waiter", icon: ReceiptText },
    { label: "Served", value: orders.filter((o) => o.orderStatus === "served").length, hint: "Guests are eating", icon: UtensilsCrossed },
    { label: "Bill requested", value: orders.filter((o) => o.orderStatus === "ready_to_pay").length, hint: "Waiting to pay", icon: CreditCard },
    {
      label: "Paid today",
      value: formatKes(today.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0)),
      hint: `${today.filter((o) => o.paymentStatus === "paid").length} bills settled`,
      icon: Banknote,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Live orders</h1>
        <p className="mt-1 text-sm text-gray-500">Every order from the floor, with how each one is being paid. Updates as it happens.</p>
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
          <div role="tablist" aria-label="Order status" className="-mx-1 flex gap-1 overflow-x-auto px-1">
            {TABS.map((t) => {
              const count = orders.filter(t.match).length;
              return (
                <button
                  key={t.key}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition focus-visible:outline-2 focus-visible:outline-teal",
                    tab === t.key ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  {t.label}
                  <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] tabular-nums", tab === t.key ? "bg-white/15" : "bg-gray-100 text-gray-500")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              aria-label="Filter by payment method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={cn(inputClass, "h-10 sm:w-44")}
            >
              <option value="any">Any payment</option>
              <option value="mpesa">M-Pesa</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="airtel_money">Airtel Money</option>
              <option value="none">Not chosen</option>
            </select>
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                aria-label="Search orders"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Table, guest, dish or order no."
                className={cn(inputClass, "h-10 pl-9")}
              />
            </div>
          </div>
        </div>

        {isError ? (
          <div role="alert" className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-900">We couldn't load your orders</p>
            <p className="mt-1 text-sm text-gray-500">Check your connection and try again.</p>
            <button type="button" onClick={() => refetch()} className="mt-4 h-9 rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-deep">
              Try again
            </button>
          </div>
        ) : isPending ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-900">{orders.length === 0 ? "No orders yet" : "No orders match"}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              {orders.length === 0
                ? "When a guest orders from the Swiftab app at their table, it shows up here straight away."
                : "Try another status, payment method or search."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-xs text-gray-500">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-3 py-3 font-medium">Table</th>
                    <th className="px-3 py-3 font-medium">Guest</th>
                    <th className="px-3 py-3 font-medium">Items</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Payment</th>
                    <th className="px-3 py-3 font-medium">Waiter</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((order) => {
                    const status = ORDER_STATUS[order.orderStatus] ?? ORDER_STATUS.placed;
                    return (
                      <tr
                        key={order._id}
                        tabIndex={0}
                        onClick={() => setSelectedId(order._id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedId(order._id);
                          }
                        }}
                        className="cursor-pointer align-top transition hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
                      >
                        <td className="px-5 py-3.5">
                          <span className="block font-mono text-xs font-semibold text-gray-900">{orderNumber(order)}</span>
                          <span className="block text-xs text-gray-500">{timeAgo(order.createdAt)}</span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="block font-semibold text-gray-900">{order.tableNumber}</span>
                          {order.guests ? <span className="block text-xs text-gray-500">{order.guests} guests</span> : null}
                        </td>
                        <td className="max-w-[160px] truncate px-3 py-3.5 text-gray-700">{order.userId?.name || "Walk-in"}</td>
                        <td className="max-w-[260px] px-3 py-3.5 text-gray-600">
                          <span className="line-clamp-2">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</span>
                        </td>
                        <td className="px-3 py-3.5">
                          <Badge className={status.badge}>{status.label}</Badge>
                        </td>
                        <td className="px-3 py-3.5">
                          <PaymentCell order={order} />
                        </td>
                        <td className="px-3 py-3.5 text-gray-700">{order.servedBy?.firstname ?? <span className="text-gray-400">—</span>}</td>
                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-gray-900">{formatKes(order.totalAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-gray-100 md:hidden">
              {visible.map((order) => {
                const status = ORDER_STATUS[order.orderStatus] ?? ORDER_STATUS.placed;
                return (
                  <li key={order._id}>
                    <button type="button" onClick={() => setSelectedId(order._id)} className="block w-full px-4 py-4 text-left transition active:bg-gray-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Table {order.tableNumber} <span className="font-mono text-xs font-medium text-gray-500">{orderNumber(order)}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.userId?.name || "Walk-in"} · {timeAgo(order.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold tabular-nums text-gray-900">{formatKes(order.totalAmount)}</p>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[13px] text-gray-600">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <Badge className={status.badge}>{status.label}</Badge>
                        <Badge className={paymentMeta(order.paymentMethod).badge}>
                          {paymentMeta(order.paymentMethod).label}
                          {order.paymentStatus === "paid" ? " · paid" : ""}
                        </Badge>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <OrderDetail order={selected} onClose={() => setSelectedId(null)} restaurantName={user?.restaurantName} taxRate={user?.taxRate} />
    </div>
  );
}
