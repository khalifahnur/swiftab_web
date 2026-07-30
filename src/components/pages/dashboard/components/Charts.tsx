import * as React from "react";
import {
  ComposedChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
  Tooltip,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardPeriod, WeeklyRevenuePoint, AreaOccupancy } from "@/hooks/dashboardhook/useDashboard";

export function OrdersTrendCard({
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
    <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm lg:col-span-2 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Orders &amp; Revenue</h3>
          <p className="text-sm font-medium text-gray-500">Trend over time</p>
        </div>
        <div className="flex bg-gray-100/80 p-1 rounded-xl">
          {(["weekly", "monthly", "yearly"] as const).map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              onClick={() => onPeriodChange(p)}
              className={`text-xs h-8 px-4 rounded-lg capitalize transition-all ${
                period === p
                  ? "bg-white text-gray-900 shadow-sm hover:bg-white font-bold"
                  : "text-gray-500 hover:text-gray-900 font-medium"
              }`}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-5 mb-4">
        <span className="flex items-center gap-2 text-xs font-bold text-gray-600">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Orders
        </span>
        <span className="flex items-center gap-2 text-xs font-bold text-gray-600">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-500" /> Revenue
        </span>
      </div>

      <div className="flex-1 min-h-[280px] w-full">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-xl bg-gray-100" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data ?? []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                fontSize={12} 
                fontWeight={500} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                yAxisId="left" 
                stroke="#64748b" 
                fontSize={12} 
                fontWeight={500} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `KES ${val}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
              />
              <Bar yAxisId="left" dataKey="orders" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#0f766e"
                strokeWidth={3}
                fillOpacity={0.1}
                fill="#0f766e"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

const AREA_BAR_COLORS = ["#0f766e", "#3b82f6", "#f59e0b", "#e11d48", "#8b5cf6"];

export function AreaOccupancyCard({
  areas,
  isLoading,
}: {
  areas?: AreaOccupancy[];
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Area Occupancy</h3>
        <p className="text-sm font-medium text-gray-500">Live seating status</p>
      </div>
      <div className="flex-1 min-h-[280px] w-full">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-xl bg-gray-100" />
        ) : !areas || areas.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm font-medium text-gray-500">
            No active areas.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={areas} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="area"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={24}>
                {areas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={AREA_BAR_COLORS[index % AREA_BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
