"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CreditCard, Users, Utensils } from "lucide-react";
import { fetchOrders } from "@/hooks/orderhook/fetchorder";
import { useDashboardStats, type DashboardPeriod } from "@/hooks/dashboardhook/useDashboard";
import useSocketData from "@/hooks/socket/useSocketData";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "./types";
import { DashboardBanner } from "./components/Banner";
import { KpiCard } from "./components/KpiCards";
import { OrdersTrendCard, AreaOccupancyCard } from "./components/Charts";
import { TopItemsCard, UpcomingReservationsCard, PaymentMethodsCard } from "./components/Widgets";
import { RecentOrdersTable } from "./components/RecentOrders";

export default function DashboardContainer() {
  const [period, setPeriod] = React.useState<DashboardPeriod>("monthly");
  const realtimeData = useSocketData("dashboardUpdate");
  const { data: stats, isLoading: statsLoading } = useDashboardStats(period);
  const { data: ordersData, isPending, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const recentOrders: Order[] = React.useMemo(() => {
    if (!ordersData?.orders || !Array.isArray(ordersData.orders)) return [];
    return (
      [...ordersData.orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5) || []
    );
  }, [ordersData]);

  const activeTables = realtimeData?.tableStatus?.activeTables ?? 0;
  const totalTables = realtimeData?.tableStatus?.totalTables ?? 0;
  const occupancyRate = totalTables ? (activeTables / totalTables) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8 monofont">
      <div className="max-w-[1600px] mx-auto w-full space-y-6 lg:space-y-8">
        <DashboardBanner />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
              <div className="flex items-baseline gap-1">
                {activeTables}
                <span className="text-xl text-gray-400 font-medium">/{totalTables}</span>
              </div>
            }
            icon={Utensils}
            color="rose"
            footer={
              <div className="mt-auto">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                  <span>Occupancy</span>
                  <span>{occupancyRate.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-700 ease-in-out"
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
            color="teal"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <OrdersTrendCard
            data={stats?.weeklyRevenue}
            period={period}
            onPeriodChange={setPeriod}
            isLoading={statsLoading}
          />
          <AreaOccupancyCard areas={stats?.areaOccupancy} isLoading={statsLoading} />
        </div>

        {/* Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <TopItemsCard items={stats?.topItems} isLoading={statsLoading} />
          <UpcomingReservationsCard reservations={stats?.upcomingReservations} isLoading={statsLoading} />
          <PaymentMethodsCard methods={stats?.paymentMethods} isLoading={statsLoading} />
        </div>

        {/* Recent Orders */}
        <div className="pb-8">
          <RecentOrdersTable orders={recentOrders} isLoading={isPending} error={error} />
        </div>

      </div>
    </div>
  );
}
