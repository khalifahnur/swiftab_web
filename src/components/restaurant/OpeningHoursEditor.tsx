"use client";

import { Copy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { OpeningHour } from "@/types/api";

interface Props {
  value: OpeningHour[];
  onChange: (hours: OpeningHour[]) => void;
  error?: string | null;
}

/** Edits the week's opening hours, one row per day. */
export function OpeningHoursEditor({ value, onChange, error }: Props) {
  const update = (index: number, patch: Partial<OpeningHour>) => {
    onChange(value.map((hour, i) => (i === index ? { ...hour, ...patch } : hour)));
  };

  const toggle = (index: number, open: boolean) => {
    const current = value[index];
    // Reopening a day restores usable times rather than leaving it blank.
    update(index, open ? { open, from: current.from || "08:00", to: current.to || "22:00" } : { open });
  };

  const first = value.find((h) => h.open);
  const copyToAll = () => {
    if (!first) return;
    onChange(value.map((hour) => ({ ...hour, open: true, from: first.from, to: first.to })));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">A closing time earlier than the opening time means you close after midnight.</p>
        <button
          type="button"
          onClick={copyToAll}
          disabled={!first}
          className="ml-4 inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal transition hover:bg-teal/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy className="h-3.5 w-3.5" />
          Same hours every day
        </button>
      </div>

      <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
        {value.map((hour, index) => (
          <li key={hour.day} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <label className="flex w-36 shrink-0 cursor-pointer items-center gap-3">
              <Switch
                checked={hour.open}
                onCheckedChange={(open) => toggle(index, open)}
                aria-label={`Open on ${hour.day}`}
              />
              <span className={cn("text-sm font-medium", hour.open ? "text-gray-900" : "text-gray-400")}>{hour.day}</span>
            </label>

            {hour.open ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  aria-label={`${hour.day} opening time`}
                  value={hour.from}
                  onChange={(e) => update(index, { from: e.target.value })}
                  className={cn(inputClass, "h-9 w-[7.5rem] px-2.5")}
                />
                <span className="text-sm text-gray-400">to</span>
                <input
                  type="time"
                  aria-label={`${hour.day} closing time`}
                  value={hour.to}
                  onChange={(e) => update(index, { to: e.target.value })}
                  className={cn(inputClass, "h-9 w-[7.5rem] px-2.5")}
                />
              </div>
            ) : (
              <span className="text-sm text-gray-400">Closed</span>
            )}
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
