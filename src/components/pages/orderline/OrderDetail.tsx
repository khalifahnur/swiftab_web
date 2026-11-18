"use client";

import { useEffect, useState } from "react";
import { Ban, CheckCircle2, Loader2, Printer, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Chip, Field, inputClass } from "@/components/ui/field";
import { useUpdateOrder } from "@/hooks/queries";
import { ORDER_STATUS, PAYMENT_METHODS, formatDateTime, formatKes, formatTime, paymentMeta } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";

interface Props {
  order: Order | null;
  onClose: () => void;
  restaurantName?: string;
  /** VAT as a fraction (0.16), used to show how much of the total is tax. */
  taxRate?: number;
}

export function orderNumber(order: Order): string {
  // Order codes end in a unique run of digits; older orders only have their id.
  const code = order.orderId?.split("-").pop() ?? order._id.slice(-6);
  return `#${code.toUpperCase()}`;
}

/** The bill for one order, with the actions a manager can take on it. */
export function OrderDetail({ order, onClose, restaurantName, taxRate = 0 }: Props) {
  const update = useUpdateOrder();
  const [mode, setMode] = useState<"view" | "pay" | "cancel">("view");
  const [method, setMethod] = useState<string>("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    setMode("view");
    setMethod(order?.paymentMethod ?? "");
    setReference(order?.paymentReference ?? "");
  }, [order?._id, order?.paymentMethod, order?.paymentReference]);

  if (!order) {
    return (
      <Sheet open={false} onOpenChange={onClose}>
        <SheetContent />
      </Sheet>
    );
  }

  const status = ORDER_STATUS[order.orderStatus] ?? ORDER_STATUS.placed;
  const payment = paymentMeta(order.paymentMethod);
  const paid = order.paymentStatus === "paid";
  const open = order.orderStatus === "placed" || order.orderStatus === "served" || order.orderStatus === "ready_to_pay";
  const vat = taxRate > 0 ? order.totalAmount - order.totalAmount / (1 + taxRate) : 0;

  const run = (change: Parameters<typeof update.mutate>[0]["change"]) =>
    update.mutate({ orderId: order._id, change }, { onSuccess: () => setMode("view") });

  return (
    <Sheet open onOpenChange={(next) => !next && onClose()}>
      <SheetContent showCloseButton={false} className="w-full gap-0 overflow-hidden border-l border-gray-200 bg-white p-0 sm:!max-w-md">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 print:hidden">
          <div className="min-w-0">
            <SheetTitle className="text-base font-semibold text-gray-900">
              Table {order.tableNumber} · {orderNumber(order)}
            </SheetTitle>
            <SheetDescription className="mt-0.5 text-[13px] text-gray-500">Placed {formatDateTime(order.createdAt)}</SheetDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div id="receipt" className="px-5 py-5">
            {/* Only shown on paper, where the sheet's header is hidden. */}
            <div className="mb-4 hidden text-center print:block">
              <p className="text-lg font-bold">{restaurantName}</p>
              <p className="text-xs">
                Table {order.tableNumber} · {orderNumber(order)} · {formatDateTime(order.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", status.badge)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", payment.badge)}>
                {paid ? `Paid by ${payment.label}` : order.paymentMethod ? `Paying by ${payment.label}` : "Payment not chosen yet"}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Guest</dt>
                <dd className="font-medium text-gray-900">{order.userId?.name || "Walk-in"}</dd>
                {order.userId?.phoneNumber && <dd className="text-xs text-gray-500">{order.userId.phoneNumber}</dd>}
              </div>
              <div>
                <dt className="text-xs text-gray-500">Party</dt>
                <dd className="font-medium text-gray-900">{order.guests ? `${order.guests} guest${order.guests === 1 ? "" : "s"}` : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Served by</dt>
                <dd className="font-medium text-gray-900">
                  {order.servedBy ? `${order.servedBy.firstname} ${order.servedBy.lastname ?? ""}`.trim() : "Not picked up yet"}
                </dd>
                {order.servedAt && <dd className="text-xs text-gray-500">at {formatTime(order.servedAt)}</dd>}
              </div>
              <div>
                <dt className="text-xs text-gray-500">{paid ? "Paid" : "Payment"}</dt>
                <dd className="font-medium text-gray-900">{paid ? formatTime(order.paidAt) : "Outstanding"}</dd>
                {order.paymentReference && <dd className="font-mono text-xs text-gray-500">Ref {order.paymentReference}</dd>}
              </div>
            </dl>

            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="w-10 pb-2 text-center font-medium">Qty</th>
                  <th className="w-24 pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, index) => (
                  <tr key={`${item._id}-${index}`} className="align-top">
                    <td className="py-2.5 pr-3">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {item.addedBy && (
                        <span className="ml-1.5 inline-flex rounded-full bg-teal/10 px-1.5 text-[11px] font-semibold leading-[18px] text-teal-deep">for {item.addedBy}</span>
                      )}
                      {item.note && <span className="mt-0.5 block text-xs text-amber-700">Note: {item.note}</span>}
                    </td>
                    <td className="py-2.5 text-center tabular-nums text-gray-600">{item.quantity}</td>
                    <td className="py-2.5 text-right tabular-nums text-gray-900">{formatKes(item.cost * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td colSpan={2} className="pt-3 text-base font-semibold text-gray-900">
                    Total
                  </td>
                  <td className="pt-3 text-right text-base font-semibold tabular-nums text-gray-900">{formatKes(order.totalAmount)}</td>
                </tr>
                {vat > 0 && (
                  <tr>
                    <td colSpan={2} className="pt-1 text-xs text-gray-500">
                      Includes VAT at {Math.round(taxRate * 100)}%
                    </td>
                    <td className="pt-1 text-right text-xs tabular-nums text-gray-500">{formatKes(vat)}</td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          {mode === "pay" && (
            <div className="space-y-4 border-t border-gray-100 bg-gray-50/70 px-5 py-5 print:hidden">
              <div>
                <p className="mb-2 text-[13px] font-medium text-gray-700">{paid ? "How was this bill paid?" : "How did the guest pay?"}</p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((key) => (
                    <Chip key={key} selected={method === key} onClick={() => setMethod(key)}>
                      {paymentMeta(key).label}
                    </Chip>
                  ))}
                </div>
              </div>
              <Field label="Reference" htmlFor="payment-reference" optional hint="For example the M-Pesa confirmation code.">
                <input
                  id="payment-reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase().slice(0, 40))}
                  placeholder="SKL7X2M9QP"
                  className={cn(inputClass, "font-mono")}
                />
              </Field>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!method || update.isPending}
                  onClick={() => run(paid ? { paymentMethod: method, paymentReference: reference } : { orderStatus: "completed", paymentMethod: method, paymentReference: reference })}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white transition hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {paid ? "Save payment details" : `Confirm ${formatKes(order.totalAmount)} paid`}
                </button>
                <button type="button" onClick={() => setMode("view")} className="h-10 rounded-xl px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                  Back
                </button>
              </div>
            </div>
          )}

          {mode === "cancel" && (
            <div className="space-y-3 border-t border-gray-100 bg-rose-50/60 px-5 py-5 print:hidden">
              <p className="text-sm font-semibold text-gray-900">Cancel this order?</p>
              <p className="text-[13px] text-gray-600">
                The guest is told their order was cancelled and it leaves the waiters' queue. This can't be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={update.isPending}
                  onClick={() => run({ orderStatus: "cancelled" })}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Cancel order
                </button>
                <button type="button" onClick={() => setMode("view")} className="h-10 rounded-xl px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                  Keep order
                </button>
              </div>
            </div>
          )}
        </div>

        {mode === "view" && (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 px-5 py-4 print:hidden">
            {open && (
              <button
                type="button"
                onClick={() => setMode("pay")}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white transition hover:bg-teal-deep"
              >
                <CheckCircle2 className="h-4 w-4" /> Mark as paid
              </button>
            )}
            {paid && (
              <button
                type="button"
                onClick={() => setMode("pay")}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Correct payment details
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            {open && (
              <button
                type="button"
                onClick={() => setMode("cancel")}
                aria-label="Cancel order"
                title="Cancel order"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-rose-600 transition hover:bg-rose-50"
              >
                <Ban className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
