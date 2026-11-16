import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared look for text inputs across the dashboard. */
export const inputClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-teal focus:ring-4 focus:ring-teal/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 aria-invalid:border-rose-400 aria-invalid:ring-rose-500/10";

export const textareaClass = cn(inputClass, "h-auto min-h-[104px] resize-y py-3 leading-relaxed");

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** A labelled form control with an optional hint and inline error. */
export function Field({ label, htmlFor, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-[13px] font-medium text-gray-700">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-gray-400">Optional</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** A toggleable pill, used for multi-select choices. */
export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
        selected
          ? "border-teal bg-teal text-white shadow-sm"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Small uppercase heading for a group of fields. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500", className)}>{children}</p>;
}
