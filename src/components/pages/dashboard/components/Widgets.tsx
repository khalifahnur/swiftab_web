import * as React from "react";
import { Users, CreditCard, Clock, UtensilsCrossed } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopItem, UpcomingReservation, PaymentMethodBreakdown } from "@/hooks/dashboardhook/useDashboard";
import { formatCurrency } from "@/lib/utils"; // I will make sure formatCurrency is in utils. If not, I'll provide it.

const PAYMENT_META: Record<string, { label: string; color: string }> = {
  mpesa: { label: "M-Pesa", color: "#0f766e" },
  card: { label: "Card", color: "#4f46e5" },
  cash: { label: "Cash", color: "#f59e0b" },
  airtel_money: { label: "Airtel Money", color: "#e11d48" },
};

export function TopItemsCard({ items, isLoading }: { items?: TopItem[]; isLoading: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Top Menu Items</h3>
          <p className="text-xs font-medium text-gray-500">By revenue this period</p>
        </div>
        <div className="p-2 bg-amber-50 rounded-lg">
          <UtensilsCrossed className="w-4 h-4 text-amber-600" />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl bg-gray-100" />)
        ) : !items || items.length === 0 ? (
          <div className="text-sm font-medium text-gray-500 text-center py-4">No item data available.</div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center border border-gray-200">
                  #{index + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs font-medium text-gray-500">{item.quantity} orders</p>
                </div>
              </div>
              <p className="text-sm font-bold text-teal-700">{formatCurrency(item.revenue)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function UpcomingReservationsCard({
  reservations,
  isLoading,
}: {
  reservations?: UpcomingReservation[];
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Upcoming Reservations</h3>
          <p className="text-xs font-medium text-gray-500">Next 4 hours</p>
        </div>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Clock className="w-4 h-4 text-indigo-600" />
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-gray-100" />)
        ) : !reservations || reservations.length === 0 ? (
          <div className="text-sm font-medium text-gray-500 text-center py-4">No upcoming reservations.</div>
        ) : (
          reservations.map((res) => (
            <div key={res._id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-gray-900">{res.name}</p>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  {res.time}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" /> {res.guests}
                </span>
                <span className="flex items-center gap-1 truncate">
                  Table {res.tableNumber} • {res.diningArea}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function PaymentMethodsCard({ methods, isLoading }: { methods?: PaymentMethodBreakdown[]; isLoading: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Payment Breakdown</h3>
          <p className="text-xs font-medium text-gray-500">Revenue by method</p>
        </div>
        <div className="p-2 bg-rose-50 rounded-lg">
          <CreditCard className="w-4 h-4 text-rose-600" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full bg-gray-100" />
              <Skeleton className="h-2 w-full bg-gray-100" />
            </div>
          ))
        ) : !methods || methods.length === 0 ? (
          <div className="text-sm font-medium text-gray-500 text-center">No payment data.</div>
        ) : (
          methods.map((method) => {
            const meta = PAYMENT_META[method.method] ?? { label: method.method, color: "#94a3b8" };
            return (
              <div key={method.method} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">{meta.label}</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(method.revenue)} <span className="text-gray-400 font-medium text-xs ml-1">({Math.round(method.percentage)}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${method.percentage}%`, backgroundColor: meta.color }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
