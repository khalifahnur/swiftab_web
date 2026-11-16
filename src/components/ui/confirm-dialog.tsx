"use client";

import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  /** Use for actions that delete or revoke something. */
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before doing something that cannot be undone. */
export function ConfirmDialog({ open, title, description, confirmLabel, destructive, busy, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onCancel()}>
      <DialogContent showCloseButton={false} className="gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl sm:max-w-md">
        <DialogTitle className="text-base font-semibold text-gray-900">{title}</DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-relaxed text-gray-600">{description}</DialogDescription>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-10 rounded-xl px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition disabled:opacity-60",
              destructive ? "bg-rose-600 hover:bg-rose-700" : "bg-teal hover:bg-teal-deep",
            )}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
