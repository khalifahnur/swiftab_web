"use client";

import { Check, Copy, Download, Loader2, Printer, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useTableCodes } from "@/hooks/queries";
import { printCards, qrFileName, svgToPng, tableQrUrl } from "@/lib/tableQr";
import type { TableCode } from "@/types/api";

export const QR_MARK = "/assets/logo/qr-mark.png";

/** The code itself: high error correction so the logo in the middle never stops it scanning. */
export function TableQr({ url, size, svgRef }: { url: string; size: number; svgRef?: React.Ref<SVGSVGElement> }) {
  return (
    <QRCodeSVG
      ref={svgRef}
      value={url}
      size={size}
      level="H"
      marginSize={0}
      fgColor="#0f1f1d"
      bgColor="#ffffff"
      imageSettings={{ src: QR_MARK, height: Math.round(size * 0.22), width: Math.round(size * 0.22), excavate: true }}
    />
  );
}

/**
 * The QR card for one table: what a guest scans to check in at that table,
 * see the menu and order. Print it for the table, share it, or save it.
 */
export function TableQrDialog({ tableId, tableName, onClose }: { tableId: string | null; tableName?: string; onClose: () => void }) {
  const { data, isPending, isError, refetch } = useTableCodes(Boolean(tableId));
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"share" | "download" | null>(null);

  const table: TableCode | undefined = data?.tables.find((t) => t.id === tableId);
  const url = data && table ? tableQrUrl(data.restaurantId, table) : "";

  const print = () => {
    if (!data || !table || !svgRef.current) return;
    const ok = printCards([{ restaurantName: data.restaurantName, tableName: table.name, floorName: table.floorName, svg: svgRef.current.outerHTML }]);
    if (!ok) toast.error("Allow pop-ups for this site to print the code.");
  };

  const png = async () => {
    if (!data || !table || !svgRef.current) throw new Error("not ready");
    return svgToPng(svgRef.current, 1024, qrFileName(data.restaurantName, table.name));
  };

  const download = async () => {
    setBusy("download");
    try {
      const file = await png();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    } catch {
      toast.error("Could not save the image. Try printing instead.");
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  const share = async () => {
    if (!data || !table) return;
    setBusy("share");
    try {
      const file = await png().catch(() => null);
      const title = `${data.restaurantName} · Table ${table.name}`;
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text: "Scan to check in and order", files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await copy();
        toast.success("Link copied. Paste it wherever you want to share it.");
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") toast.error("Could not share the code.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={Boolean(tableId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl sm:max-w-[400px]">
        {/* Header in the brand colour; the code sits across its lower edge. */}
        <div className="relative bg-teal px-6 pb-24 pt-6 text-center text-white">
          <DialogClose
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </DialogClose>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Table QR code</p>
          <DialogTitle className="mt-1.5 text-[22px] font-bold leading-tight text-white">{data?.restaurantName || "Your restaurant"}</DialogTitle>
        </div>

        <div className="relative -mt-20 flex justify-center px-6">
          <div className="rounded-2xl bg-white p-3.5 shadow-[0_12px_30px_-10px_rgba(15,31,29,0.35)] ring-1 ring-gray-100">
            {isPending ? (
              <div className="flex h-[176px] w-[176px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-teal" />
              </div>
            ) : table ? (
              <TableQr url={url} size={176} svgRef={svgRef} />
            ) : (
              <div className="flex h-[176px] w-[176px] items-center justify-center p-3 text-center text-[13px] text-gray-500">
                {isError ? "Could not load the code." : "Save the floor plan first. New tables get their code once saved."}
              </div>
            )}
          </div>
        </div>

        <div className="px-7 pb-7 pt-5 text-center">
          <p className="text-lg font-semibold text-gray-900">Table {table?.name ?? tableName ?? ""}</p>
          {table?.floorName && (
            <p className="mt-0.5 text-[13px] text-gray-500">
              {table.floorName}
              {table.seats ? ` · ${table.seats} seats` : ""}
            </p>
          )}
          <DialogDescription className="mx-auto mt-3 max-w-[290px] text-[13px] leading-relaxed text-gray-600">
            Guests scan this code to check in at this table, browse your menu and order from their phone, no app needed.
          </DialogDescription>

          {isError && (
            <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-teal hover:underline">
              Try again
            </button>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={print}
              disabled={!table}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal/10 text-sm font-semibold text-teal-deep transition hover:bg-teal/15 disabled:opacity-50"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              type="button"
              onClick={share}
              disabled={!table || busy !== null}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal/10 text-sm font-semibold text-teal-deep transition hover:bg-teal/15 disabled:opacity-50"
            >
              {busy === "share" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} Share
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-[13px] font-semibold text-gray-500">
            <button type="button" onClick={download} disabled={!table || busy !== null} className="inline-flex items-center gap-1.5 transition hover:text-gray-900 disabled:opacity-50">
              {busy === "download" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Save image
            </button>
            <span aria-hidden className="h-3.5 w-px bg-gray-200" />
            <button type="button" onClick={copy} disabled={!table} className="inline-flex items-center gap-1.5 transition hover:text-gray-900 disabled:opacity-50">
              {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
