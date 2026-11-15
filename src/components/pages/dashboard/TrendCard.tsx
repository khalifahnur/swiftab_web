"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compactNumber, formatKes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardPeriod, DashboardStats } from "@/types/api";

const PERIODS: { key: DashboardPeriod; label: string }[] = [
  { key: "weekly", label: "7 days" },
  { key: "monthly", label: "30 days" },
  { key: "yearly", label: "12 months" },
];

type Measure = "revenue" | "orders";

interface Props {
  trend?: DashboardStats["trend"];
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  loading: boolean;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg bg-gray-100 p-0.5">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={value === option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-teal",
            value === option.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Revenue or orders over the chosen period. The two are shown one at a time
 * so each keeps a single, honest axis.
 */
export function TrendCard({ trend, period, onPeriodChange, loading }: Props) {
  const [measure, setMeasure] = useState<Measure>("revenue");
  const data = trend ?? [];
  const total = data.reduce((sum, point) => sum + point[measure], 0);
  const empty = !loading && total === 0;

  return (
    <section className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">{measure === "revenue" ? "Revenue" : "Orders"}</h2>
          <p className="mt-0.5 text-[13px] text-gray-500">
            {measure === "revenue" ? "Paid bills" : "Orders placed"}, last {PERIODS.find((p) => p.key === period)?.label}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Segmented
            label="Measure"
            value={measure}
            onChange={setMeasure}
            options={[
              { key: "revenue", label: "Revenue" },
              { key: "orders", label: "Orders" },
            ]}
          />
          <Segmented label="Period" value={period} onChange={onPeriodChange} options={PERIODS} />
        </div>
      </div>

      <div className="mt-5 h-[260px] w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-gray-100" />
        ) : empty ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-gray-50 text-center">
            <p className="text-sm font-medium text-gray-700">Nothing to chart yet</p>
            <p className="mt-1 max-w-xs text-xs text-gray-500">
              {measure === "revenue" ? "Revenue appears here once bills are paid." : "Orders appear here as guests place them."}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#eef0f3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickMargin={10}
                minTickGap={24}
              />
              <YAxis
                width={48}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value: number) => compactNumber(value)}
              />
              <Tooltip
                cursor={{ stroke: "#9ca3af", strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as DashboardStats["trend"][number];
                  return (
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg">
                      <p className="text-xs font-medium text-gray-500">{point.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        {measure === "revenue" ? formatKes(point.revenue) : `${point.orders} order${point.orders === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey={measure}
                stroke="#008080"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#008080"
                fillOpacity={0.1}
                dot={false}
                activeDot={{ r: 5, fill: "#008080", stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
