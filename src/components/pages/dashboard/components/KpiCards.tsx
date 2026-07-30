import * as React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type KpiColor = "teal" | "rose" | "indigo" | "violet";

const KPI_THEME: Record<KpiColor, { chipBg: string; iconColor: string; hex: string }> = {
  teal: { chipBg: "bg-teal-50", iconColor: "text-teal-600", hex: "#0f766e" },
  rose: { chipBg: "bg-rose-50", iconColor: "text-rose-600", hex: "#e11d48" },
  indigo: { chipBg: "bg-indigo-50", iconColor: "text-indigo-600", hex: "#4f46e5" },
  violet: { chipBg: "bg-violet-50", iconColor: "text-violet-600", hex: "#7c3aed" },
};

export interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  color: KpiColor;
  changePercent?: number;
  sparklineData?: { value: number }[];
  footer?: React.ReactNode;
  valueClassName?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  changePercent,
  sparklineData,
  footer,
  valueClassName,
}: KpiCardProps) {
  const theme = KPI_THEME[color];
  const hasDelta = typeof changePercent === "number";
  const isPositive = (changePercent ?? 0) >= 0;
  const gradientId = `spark-${color}`;

  return (
    <div className="bodyfont bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-500 mb-1.5">{title}</p>
          <h3 className={`font-bold text-gray-900 truncate ${valueClassName ?? "text-3xl"}`}>
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${theme.chipBg}`}>
          <Icon className={`h-5 w-5 ${theme.iconColor}`} />
        </div>
      </div>
      
      {footer ? (
        footer
      ) : (
        <div className="flex items-center justify-between mt-auto">
          {hasDelta ? (
            <div
              className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${
                isPositive ? "text-teal-700 bg-teal-50" : "text-rose-700 bg-rose-50"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
              )}
              {Math.abs(changePercent ?? 0).toFixed(1)}%
            </div>
          ) : (
            <div />
          )}

          {sparklineData && sparklineData.length > 0 && (
            <div className="h-9 w-24">
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
                    strokeWidth={2.5}
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
