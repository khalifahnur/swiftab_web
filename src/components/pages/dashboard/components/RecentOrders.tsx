import * as React from "react";
import { Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "../types";
import { formatCurrency } from "@/lib/utils"; // Assume this is provided. 

const ORDER_STATUS_META: Record<string, { label: string; className: string }> = {
  placed: { label: "Placed", className: "bg-amber-50 text-amber-700 border-amber-200" },
  served: { label: "Served", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  ready_to_pay: { label: "Bill Requested", className: "bg-rose-50 text-rose-700 border-rose-200" },
  completed: { label: "Completed", className: "bg-teal-50 text-teal-700 border-teal-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

export function RecentOrdersTable({
  orders,
  isLoading,
  error,
}: {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Recent Orders
            {isLoading && <span className="flex h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />}
          </h3>
          <p className="text-sm font-medium text-gray-500 mt-0.5">Live updates from the floor</p>
        </div>
        <Button variant="outline" className="text-sm font-bold text-teal-700 border-teal-200 hover:bg-teal-50 shrink-0">
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="p-0 overflow-x-auto">
        {error && <div className="p-6 text-sm font-medium text-rose-600 bg-rose-50/50">Failed to load recent orders.</div>}
        
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : !error && orders.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
             <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
               <Clock className="h-6 w-6 text-gray-400" />
             </div>
             <p className="text-gray-900 font-bold text-base">No active orders</p>
             <p className="text-gray-500 font-medium text-sm mt-1">New orders will appear here automatically.</p>
          </div>
        ) : !error ? (
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-600 pl-6 w-[110px] uppercase text-xs tracking-wider">Order #</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-xs tracking-wider">Time</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-xs tracking-wider">Table</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-xs tracking-wider">Items</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-xs tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-gray-600 text-right pr-6 uppercase text-xs tracking-wider">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const statusMeta =
                    ORDER_STATUS_META[order.orderStatus] ?? {
                      label: order.orderStatus,
                      className: "bg-gray-100 text-gray-600 border-gray-200",
                    };
                  return (
                    <TableRow
                      key={order._id}
                      className="hover:bg-gray-50/80 transition-colors border-b-gray-100 last:border-0"
                    >
                      <TableCell className="pl-6 font-bold text-gray-900 font-mono text-xs">
                        #{order._id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm font-medium text-gray-600">
                          <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700">
                          Table {order.tableNumber}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-600 truncate max-w-[250px]">
                        {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusMeta.className} shadow-none font-bold text-[11px] px-2 py-0.5`}>
                          {statusMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                        {order.paymentStatus === "unpaid" && (
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-500 mt-1">Unpaid</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
