import apiClient from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type DashboardPeriod = "weekly" | "monthly" | "yearly";

export interface KpiTrend {
  today: number;
  yesterday: number;
  changePercent: number;
  sparkline: { value: number }[];
}

// MATCH THE BACKEND: changed from OrdersOverTimePoint
export interface WeeklyRevenuePoint {
  day: string;
  revenue: number;
}

export interface AreaOccupancy {
  area: string;
  occupied: number;
  total: number;
  percentage: number;
}

export interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface UpcomingReservation {
  _id: string;
  name: string;
  time: string;
  guests: number;
  tableNumber: string;
  diningArea: string;
}

export interface DashboardStats {
  kpiTrends: {
    revenue: KpiTrend;
    reservations: KpiTrend;
    guests: KpiTrend;
  };
  // MATCH THE BACKEND: Changed from ordersOverTime
  weeklyRevenue: WeeklyRevenuePoint[];
  areaOccupancy: AreaOccupancy[];
  topItems: TopItem[];
  paymentMethods: PaymentMethodBreakdown[];
  upcomingReservations: UpcomingReservation[];
}

export async function fetchDashboardStats(
  period: DashboardPeriod = "monthly",
): Promise<DashboardStats> {
  try {
    // FIX: Pass the period as a query parameter so the backend can use it
    const response = await apiClient.get(`/restaurant/dashboard/stats?period=${period}`);
    return response.data;
  } catch (error: any) {
    throw new Error("Network error or no response from server.");
  }
}

// FIX: Assuming your apiClient automatically attaches the auth token (which holds the restaurantId),
// you only need to trigger refetches when the period changes.
export function useDashboardStats(period: DashboardPeriod = "monthly") {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", period],
    queryFn: () => fetchDashboardStats(period),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}