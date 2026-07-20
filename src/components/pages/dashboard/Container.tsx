"use client";

import * as React from "react";
import {
  Bar,
  ComposedChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Calendar,
  CreditCard,
  MapPin,
  Users,
  Utensils,
  UtensilsCrossed,
  CalendarClock,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useSocketData from "@/hooks/socket/useSocketData";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/hooks/orderhook/fetchorder";
import {
  useDashboardStats,
  type DashboardPeriod,
  type AreaOccupancy as AreaOccupancyPoint,
  type TopItem,
  type PaymentMethodBreakdown,
  type UpcomingReservation,
  WeeklyRevenuePoint,
} from "@/hooks/dashboardhook/useDashboard";


export interface OrderItem {
  _id: string;
  name: string;
  cost: number;
  quantity: number;
}

export type OrderStatus = "placed" | "served" | "ready_to_pay" | "completed" | "cancelled";

export interface Order {
  _id: string;
  userId: string;
  restaurantId: string;
  reservationId: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: "paid" | "unpaid";
  paymentMethod: "card" | "mpesa" | "cash" | "airtel_money" | null;
  servedBy?: string | null;
  createdAt: string;
}

type KpiColor = "indigo" | "rose" | "emerald" | "violet";

const KPI_THEME: Record<KpiColor, { chipBg: string; iconColor: string; hex: string }> = {
  indigo: { chipBg: "bg-indigo-50", iconColor: "text-indigo-500", hex: "#6366f1" },
  rose: { chipBg: "bg-rose-50", iconColor: "text-rose-500", hex: "#f43f5e" },
  emerald: { chipBg: "bg-emerald-50", iconColor: "text-emerald-500", hex: "#10b981" },
  violet: { chipBg: "bg-violet-50", iconColor: "text-violet-500", hex: "#8b5cf6" },
};

const AREA_BAR_COLORS = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-sky-500"];

const PAYMENT_META: Record<string, { label: string; color: string }> = {
  mpesa: { label: "M-Pesa", color: "#10b981" },
  card: { label: "Card", color: "#6366f1" },
  cash: { label: "Cash", color: "#f59e0b" },
  airtel_money: { label: "Airtel Money", color: "#ef4444" },
};

const ORDER_STATUS_META: Record<string, { label: string; className: string }> = {
  placed: { label: "Placed", className: "bg-amber-50 text-amber-700 border-amber-200" },
  served: { label: "Served", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ready_to_pay: { label: "Bill Requested", className: "bg-rose-50 text-rose-700 border-rose-200" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(
    amount || 0,
  );


function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  changePercent,
  sparklineData,
  footer,
  valueClassName,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  color: KpiColor;
  changePercent?: number;
  sparklineData?: { value: number }[];
  footer?: React.ReactNode;
  valueClassName?: string;
}) {
  const theme = KPI_THEME[color];
  const hasDelta = typeof changePercent === "number";
  const isPositive = (changePercent ?? 0) >= 0;
  const gradientId = `spark-${color}`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className={`font-bold text-gray-900 truncate ${valueClassName ?? "text-3xl"}`}>{value}</h3>
        </div>
        <div className={`p-2 rounded-xl shrink-0 ${theme.chipBg}`}>
          <Icon className={`h-5 w-5 ${theme.iconColor}`} />
        </div>
      </div>
      {footer ? (
        footer
      ) : (
        <div className="flex items-center justify-between mt-auto">
          {hasDelta ? (
            <span
              className={`flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              )}
              {Math.abs(changePercent ?? 0)}%
            </span>
          ) : (
            <span />
          )}
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-8 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.hex} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.hex} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.hex}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersTrendCard({
  data,
  period,
  onPeriodChange,
  isLoading,
}: {
  data?: WeeklyRevenuePoint[];
  period: DashboardPeriod;
  onPeriodChange: (p: DashboardPeriod) => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:col-span-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Orders &amp; Revenue</h3>
          <p className="text-sm text-gray-500">Trend over time</p>
        </div>
        <div className="flex bg-gray-100/80 p-1 rounded-lg">
          {(["weekly", "monthly", "yearly"] as const).map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              onClick={() => onPeriodChange(p)}
              className={`text-xs h-7 px-3 rounded-md capitalize ${
                period === p
                  ? "bg-white text-gray-900 shadow-sm hover:bg-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span className="h-2 w-2 rounded-full bg-indigo-500" /> Orders
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span className="h-2 w-2 rounded-full bg-violet-500" /> Revenue
        </span>
      </div>

      <div className="h-[280px] w-full">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-xl bg-gray-100" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data ?? []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  fontWeight: 500,
                }}
                // formatter={(value: number, name: string) => [
                //   name === "Revenue" ? formatCurrency(value) : value,
                //   name,
                // ]}
              />
              <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={22} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function AreaOccupancyCard({ areas, isLoading }: { areas?: AreaOccupancyPoint[]; isLoading: boolean }) {
  const overall = React.useMemo(() => {
    if (!areas?.length) return 0;
    const occupied = areas.reduce((s, a) => s + a.occupied, 0);
    const total = areas.reduce((s, a) => s + a.total, 0);
    return total ? Math.round((occupied / total) * 100) : 0;
  }, [areas]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:col-span-1 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Areas</h3>
          <p className="text-sm text-gray-500">Live floor utilization</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-5 flex-1">
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg bg-gray-100" />)
        ) : areas?.length ? (
          areas.map((area, i) => (
            <div key={area.area}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">{area.area}</span>
                <span className="text-sm font-bold text-gray-900">{area.percentage}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${AREA_BAR_COLORS[i % AREA_BAR_COLORS.length]}`}
                  style={{ width: `${area.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">
                {area.occupied} of {area.total} tables occupied
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">No floor layout set up yet.</p>
        )}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">Overall</span>
        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">{overall}%</span>
      </div>
    </div>
  );
}


function TopItemsCard({ items, isLoading }: { items?: TopItem[]; isLoading: boolean }) {
  const maxQty = items?.[0]?.quantity || 1;
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-50 rounded-xl">
          <UtensilsCrossed className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Top Dishes</h3>
          <p className="text-sm text-gray-500">Best sellers, 30 days</p>
        </div>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-9 w-full rounded-lg bg-gray-100" />)
        ) : items?.length ? (
          items.map((item, i) => (
            <div key={item.name}>
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <span className="text-sm font-semibold text-gray-700 truncate">
                  <span className="text-gray-400 font-normal mr-1.5">{i + 1}.</span>
                  {item.name}
                </span>
                <span className="text-sm font-bold text-gray-900 shrink-0">{item.quantity} sold</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(item.quantity / maxQty) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">No orders in the last 30 days.</p>
        )}
      </div>
    </div>
  );
}

function UpcomingReservationsCard({
  reservations,
  isLoading,
}: {
  reservations?: UpcomingReservation[];
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-xl">
          <CalendarClock className="h-4 w-4 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Upcoming Today</h3>
          <p className="text-sm text-gray-500">Next reservations</p>
        </div>
      </div>
      <div className="space-y-1">
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl bg-gray-100" />)
        ) : reservations?.length ? (
          reservations.map((r) => (
            <div
              key={r._id}
              className="flex items-center gap-3 py-2 -mx-2 px-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg h-11 w-11 shrink-0 text-xs font-bold">
                {new Date(r.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {r.guests} guests · {r.diningArea}, Table {r.tableNumber}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">Nothing else booked today.</p>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// New widget: Payment Methods
// ----------------------------------------------------------------------------
function PaymentMethodsCard({ methods, isLoading }: { methods?: PaymentMethodBreakdown[]; isLoading: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-50 rounded-xl">
          <Wallet className="h-4 w-4 text-violet-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-6 w-full rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : methods?.length ? (
        <>
          <div className="h-2.5 w-full rounded-full overflow-hidden flex mb-5 bg-gray-100">
            {methods.map((m) => (
              <div
                key={m.method}
                style={{ width: `${m.percentage}%`, backgroundColor: PAYMENT_META[m.method]?.color ?? "#94a3b8" }}
              />
            ))}
          </div>
          <div className="space-y-3">
            {methods.map((m) => (
              <div key={m.method} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PAYMENT_META[m.method]?.color ?? "#94a3b8" }}
                  />
                  <span className="font-medium text-gray-700">{PAYMENT_META[m.method]?.label ?? m.method}</span>
                </div>
                <span className="font-bold text-gray-900">{m.percentage}%</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500 text-center py-6">No paid orders in the last 30 days.</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = React.useState<DashboardPeriod>("monthly");
  const { data: stats, isLoading: statsLoading } = useDashboardStats(period);
  const realtimeData = useSocketData("realTimeData");


  const { data, error, isPending } = useQuery<{ orders: Order[] }>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const recentOrders = React.useMemo(() => {
    return (
      data?.orders
        ?.slice() // don't sort the cached query array in place
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5) || []
    );
  }, [data]);

  const activeTables = realtimeData?.tableStatus?.activeTables ?? 0;
  const totalTables = realtimeData?.tableStatus?.totalTables ?? 0;
  const occupancyRate = totalTables ? (activeTables / totalTables) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 p-4 md:p-8 oswald">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <KpiCard
            title="Reservations Today"
            value={realtimeData?.reservations ?? 0}
            icon={Calendar}
            color="indigo"
            changePercent={stats?.kpiTrends.reservations.changePercent}
            sparklineData={stats?.kpiTrends.reservations.sparkline}
          />
          <KpiCard
            title="Seated Tables"
            value={
              <>
                {activeTables}
                <span className="text-lg text-gray-400 font-medium">/{totalTables}</span>
              </>
            }
            icon={Utensils}
            color="rose"
            footer={
              <div className="mt-auto">
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                  <span>Occupancy</span>
                  <span>{occupancyRate.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            }
          />
          <KpiCard
            title="Active Guests"
            value={realtimeData?.totalCustomers ?? 0}
            icon={Users}
            color="emerald"
            changePercent={stats?.kpiTrends.guests.changePercent}
            sparklineData={stats?.kpiTrends.guests.sparkline}
          />
          <KpiCard
            title="Revenue Today"
            value={formatCurrency(stats?.kpiTrends.revenue.today ?? 0)}
            icon={CreditCard}
            color="violet"
            valueClassName="text-2xl"
            changePercent={stats?.kpiTrends.revenue.changePercent}
            sparklineData={stats?.kpiTrends.revenue.sparkline}
          />
        </div>

        {/* Trend chart + Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <OrdersTrendCard
            data={stats?.weeklyRevenue}
            period={period}
            onPeriodChange={setPeriod}
            isLoading={statsLoading}
          />
          <AreaOccupancyCard areas={stats?.areaOccupancy} isLoading={statsLoading} />
        </div>

        {/* New widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <TopItemsCard items={stats?.topItems} isLoading={statsLoading} />
          <UpcomingReservationsCard reservations={stats?.upcomingReservations} isLoading={statsLoading} />
          <PaymentMethodsCard methods={stats?.paymentMethods} isLoading={statsLoading} />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Recent Orders
                {isPending && <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />}
              </h3>
              <p className="text-sm text-gray-500">Latest tickets from the floor</p>
            </div>
            <Button variant="ghost" className="text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="p-0">
            {error && <div className="p-6 text-sm text-red-500">Failed to load recent orders.</div>}
            {isPending && (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-gray-100 rounded-lg" />
                ))}
              </div>
            )}

            {!isPending && !error && recentOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No active orders right now.</div>
            ) : !isPending && !error ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b-gray-100">
                      <TableHead className="font-semibold text-gray-600 pl-6 w-[110px]">Order #</TableHead>
                      <TableHead className="font-semibold text-gray-600">Time</TableHead>
                      <TableHead className="font-semibold text-gray-600">Table</TableHead>
                      <TableHead className="font-semibold text-gray-600">Items</TableHead>
                      <TableHead className="font-semibold text-gray-600">Status</TableHead>
                      <TableHead className="font-semibold text-gray-600 text-right pr-6">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => {
                      const statusMeta =
                        ORDER_STATUS_META[order.orderStatus] ?? {
                          label: order.orderStatus,
                          className: "bg-gray-100 text-gray-500 border-gray-200",
                        };
                      return (
                        <TableRow
                          key={order._id}
                          className="hover:bg-gray-50/80 transition-colors border-b-gray-50 last:border-0"
                        >
                          <TableCell className="pl-6 font-medium text-gray-900 font-mono text-xs">
                            #{order._id.slice(-6).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-3.5 h-3.5 mr-1.5" />
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-white text-gray-700 font-semibold border-gray-200 shadow-sm">
                              Table {order.tableNumber}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 truncate max-w-[200px]">
                            {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusMeta.className}>
                              {statusMeta.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                            {order.paymentStatus === "unpaid" && (
                              <span className="block text-[11px] font-medium text-rose-500 mt-0.5">Unpaid</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}