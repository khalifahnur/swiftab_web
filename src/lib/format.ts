import type { OrderStatus, ReservationStatus } from "@/types/api";

/** Whole Kenyan shillings: "KES 1,450". */
export function formatKes(amount: number | undefined | null): string {
  return `KES ${Math.round(amount ?? 0).toLocaleString("en-KE")}`;
}

/** Compact amounts for chart axes: 1.2K, 3.4M. */
export function compactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

export function formatTime(value: string | Date | undefined | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | Date | undefined | null): string {
  if (!value) return "—";
  return `${formatDate(value)}, ${formatTime(value)}`;
}

/** "Just now", "12 min ago", "3 hr ago", then the date. */
export function timeAgo(value: string | Date | undefined | null): string {
  if (!value) return "—";
  const date = new Date(value);
  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (Number.isNaN(minutes)) return "—";
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} hr ago`;
  return formatDate(date);
}

export function initials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// --- Payment methods ---------------------------------------------------------

export interface PaymentMeta {
  label: string;
  /** Tailwind classes for a badge. */
  badge: string;
  /**
   * Solid colour for charts. These four were checked together for
   * colour-blind separation; two are light, so always show the label too.
   */
  color: string;
}

const PAYMENT_META: Record<string, PaymentMeta> = {
  mpesa: { label: "M-Pesa", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", color: "#1baf7a" },
  cash: { label: "Cash", badge: "bg-amber-50 text-amber-800 ring-amber-600/20", color: "#eda100" },
  card: { label: "Card", badge: "bg-indigo-50 text-indigo-700 ring-indigo-600/20", color: "#2a78d6" },
  airtel_money: { label: "Airtel Money", badge: "bg-rose-50 text-rose-700 ring-rose-600/20", color: "#e34948" },
};

/** The methods a manager can record a payment under. */
export const PAYMENT_METHODS = ["mpesa", "cash", "card", "airtel_money"] as const;

export function paymentMeta(method?: string | null): PaymentMeta {
  if (!method || method === "unspecified") {
    return { label: "Not chosen", badge: "bg-slate-100 text-slate-500 ring-slate-500/10", color: "#94a3b8" };
  }
  return PAYMENT_META[method] ?? { label: method, badge: "bg-slate-100 text-slate-700 ring-slate-500/10", color: "#64748b" };
}

// --- Statuses ----------------------------------------------------------------

export const ORDER_STATUS: Record<OrderStatus, { label: string; badge: string; dot: string }> = {
  placed: { label: "New", badge: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
  served: { label: "Served", badge: "bg-sky-50 text-sky-700 ring-sky-600/20", dot: "bg-sky-500" },
  ready_to_pay: { label: "Bill requested", badge: "bg-violet-50 text-violet-700 ring-violet-600/20", dot: "bg-violet-500" },
  completed: { label: "Paid", badge: "bg-teal-50 text-teal-700 ring-teal-600/20", dot: "bg-teal-500" },
  cancelled: { label: "Cancelled", badge: "bg-slate-100 text-slate-500 ring-slate-500/10", dot: "bg-slate-400" },
};

export const RESERVATION_STATUS: Record<ReservationStatus, { label: string; badge: string }> = {
  active: { label: "Upcoming", badge: "bg-teal-50 text-teal-700 ring-teal-600/20" },
  seated: { label: "Seated", badge: "bg-sky-50 text-sky-700 ring-sky-600/20" },
  completed: { label: "Completed", badge: "bg-slate-100 text-slate-600 ring-slate-500/10" },
  cancelled: { label: "Cancelled", badge: "bg-rose-50 text-rose-700 ring-rose-600/20" },
  no_show: { label: "No-show", badge: "bg-amber-50 text-amber-800 ring-amber-600/20" },
};
