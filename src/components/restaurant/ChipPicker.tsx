"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Chip, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface Props {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Lets the user add a choice that is not in the list. */
  allowCustom?: boolean;
  customPlaceholder?: string;
  max?: number;
}

/** Multi-select as pills, with an optional "add your own". */
export function ChipPicker({ options, value, onChange, allowCustom, customPlaceholder, max = 12 }: Props) {
  const [draft, setDraft] = useState("");

  const has = (option: string) => value.some((v) => v.toLowerCase() === option.toLowerCase());
  const toggle = (option: string) => {
    if (has(option)) onChange(value.filter((v) => v.toLowerCase() !== option.toLowerCase()));
    else if (value.length < max) onChange([...value, option]);
  };

  const addCustom = () => {
    const next = draft.trim();
    if (!next) return;
    if (!has(next) && value.length < max) onChange([...value, next]);
    setDraft("");
  };

  // Choices the user typed themselves are shown alongside the presets.
  const custom = value.filter((v) => !options.some((o) => o.toLowerCase() === v.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[...options, ...custom].map((option) => (
          <Chip key={option} selected={has(option)} onClick={() => toggle(option)}>
            {has(option) && <Check className="h-3.5 w-3.5" />}
            {option}
          </Chip>
        ))}
      </div>
      {allowCustom && (
        <div className="flex max-w-xs gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            maxLength={40}
            placeholder={customPlaceholder ?? "Add another"}
            aria-label={customPlaceholder ?? "Add another"}
            className={cn(inputClass, "h-9")}
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!draft.trim()}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-[13px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      )}
    </div>
  );
}
