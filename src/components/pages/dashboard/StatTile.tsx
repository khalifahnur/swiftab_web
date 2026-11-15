import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: React.ReactNode;
  /** Percentage change against `versus`. Omit to show no delta. */
  change?: number;
  versus?: string;
  /** Recent values, oldest first. The last point is the current one. */
  trend?: number[];
  footer?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

/** A headline number with its change and a small trend line. */
export function StatTile({ label, value, change, versus = "vs yesterday", trend, footer, icon: Icon, loading }: Props) {
  const direction = change === undefined ? null : change > 0 ? "up" : change < 0 ? "down" : "flat";

  return (
    <div className="flex min-h-[132px] flex-col rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-gray-500">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      {loading ? (
        <div className="mt-2 h-8 w-28 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <p className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-gray-900">{value}</p>
      )}

      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
        {footer ??
          (direction && !loading ? (
            <p className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-500">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
                  direction === "up" && "bg-emerald-50 text-emerald-700",
                  direction === "down" && "bg-rose-50 text-rose-700",
                  direction === "flat" && "bg-gray-100 text-gray-600",
                )}
              >
                {direction === "up" && <ArrowUpRight className="h-3 w-3" />}
                {direction === "down" && <ArrowDownRight className="h-3 w-3" />}
                {direction === "flat" && <Minus className="h-3 w-3" />}
                {Math.abs(change!)}%
              </span>
              {versus}
            </p>
          ) : (
            <span />
          ))}
        {trend && trend.length > 1 && !loading && <Sparkline values={trend} />}
      </div>
    </div>
  );
}

/** Seven-day trend: a quiet line with the current day marked. */
function Sparkline({ values }: { values: number[] }) {
  const width = 68;
  const height = 28;
  const pad = 4;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (width - pad * 2),
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));
  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend over the last 7 days" className="shrink-0">
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={4} fill="#008080" stroke="#fff" strokeWidth={2} />
    </svg>
  );
}
