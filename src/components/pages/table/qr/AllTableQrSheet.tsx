"use client";

import { Loader2, Printer, QrCode, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useTableCodes } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { printCards, tableQrUrl } from "@/lib/tableQr";
import { TableQr } from "./TableQrDialog";

/**
 * Every table's QR code at once, to print a full set of table cards or open
 * one table's card.
 */
export function AllTableQrSheet({ open, onClose, onOpenTable }: { open: boolean; onClose: () => void; onOpenTable: (id: string) => void }) {
  const { data, isPending, isError, refetch } = useTableCodes(open);
  const [floor, setFloor] = useState<string>("all");
  const grid = useRef<HTMLDivElement>(null);

  const floors = useMemo(() => {
    const seen = new Map<string, string>();
    data?.tables.forEach((t) => seen.set(t.floorId, t.floorName || "Floor"));
    return [...seen.entries()];
  }, [data]);
  const shown = (data?.tables ?? []).filter((t) => floor === "all" || t.floorId === floor);

  const printShown = () => {
    if (!data || !grid.current) return;
    const cards = shown.map((t) => ({
      restaurantName: data.restaurantName,
      tableName: t.name,
      floorName: t.floorName,
      svg: grid.current!.querySelector(`[data-qr="${CSS.escape(t.id)}"] svg`)?.outerHTML ?? "",
    }));
    if (!printCards(cards)) toast.error("Allow pop-ups for this site to print the codes.");
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 overflow-y-auto bg-white p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[640px]">
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-6 pb-4 pt-6 backdrop-blur">
          <SheetClose
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </SheetClose>
          <SheetTitle className="pr-10 text-lg font-semibold text-gray-900">Table QR codes</SheetTitle>
          <SheetDescription className="mt-1 text-[13px] text-gray-500">
            Put a code on each table. Guests scan it to check in, see the menu and order without the app.
          </SheetDescription>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {floors.length > 1 &&
              [["all", "All floors"] as [string, string], ...floors].map(([id, name]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={floor === id}
                  onClick={() => setFloor(id)}
                  className={cn(
                    "h-8 rounded-full px-3 text-[13px] font-semibold transition",
                    floor === id ? "bg-teal text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {name}
                </button>
              ))}
            <button
              type="button"
              onClick={printShown}
              disabled={!shown.length}
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-xl bg-teal px-3.5 text-[13px] font-semibold text-white transition hover:bg-teal-deep disabled:opacity-50"
            >
              <Printer className="h-4 w-4" /> Print {shown.length > 1 ? `all ${shown.length}` : ""}
            </button>
          </div>
        </div>

        <div ref={grid} className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
          {isPending &&
            Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[190px] animate-pulse rounded-2xl bg-gray-100" />)}
          {isError && (
            <div className="col-span-full py-10 text-center text-sm text-gray-500">
              Could not load the codes.{" "}
              <button type="button" onClick={() => refetch()} className="font-semibold text-teal hover:underline">
                Try again
              </button>
            </div>
          )}
          {data && shown.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-12 text-center">
              <QrCode className="h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-900">No tables yet</p>
              <p className="mt-1 max-w-xs text-[13px] text-gray-500">Add tables to your floor plan and save it. Each table gets its own code.</p>
            </div>
          )}
          {data &&
            shown.map((t) => (
              <button
                key={t.id}
                type="button"
                data-qr={t.id}
                onClick={() => onOpenTable(t.id)}
                className="group flex flex-col items-center rounded-2xl border border-gray-200 p-3 text-center transition hover:border-teal hover:shadow-sm"
              >
                <TableQr url={tableQrUrl(data.restaurantId, t)} size={116} />
                <span className="mt-2.5 text-sm font-semibold text-gray-900">Table {t.name}</span>
                <span className="text-[12px] text-gray-500">
                  {t.floorName}
                  {t.seats ? ` · ${t.seats} seats` : ""}
                </span>
              </button>
            ))}
        </div>
        {isPending && <Loader2 className="sr-only" />}
      </SheetContent>
    </Sheet>
  );
}
