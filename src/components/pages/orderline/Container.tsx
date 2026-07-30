"use client";

import * as React from "react";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ListOrdered,
  UtensilsCrossed,
  CalendarClock,
  CreditCard,
  Banknote,
  Receipt,
  Printer,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/hooks/orderhook/fetchorder";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export interface MenuItem {
  _id: string;
  image: string;
  name: string;
  description: string;
  cost: number;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: string;
  orderId: string;
  restaurantId: string;
  reservationId: string;
  tableNumber: string;
  items: MenuItem[];
  orderStatus: "placed" | "served" | "ready_to_pay" | "completed" | "cancelled";
  paid: "Paid" | "Unpaid";
  takenBy?: string;
  createdAt: string;
}

export default function OrdersContainer() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  const { data, error, isPending } = useQuery<{ orders: Order[] }>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const orders = data?.orders || [];

  const filteredOrders = React.useMemo(() => {
    return orders.filter(
      (order) =>
        order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [orders, searchQuery]);

  const getFilteredOrdersByStatus = React.useCallback(
    (status: string) => {
      if (status === "all") return filteredOrders;
      if (status === "preparing")
        return filteredOrders.filter((o) => o.orderStatus === "placed");
      if (status === "payment")
        return filteredOrders.filter(
          (o) =>
            o.orderStatus === "ready_to_pay" ||
            (o.orderStatus === "served" && o.paid === "Unpaid"),
        );
      if (status === "completed")
        return filteredOrders.filter(
          (o) =>
            o.orderStatus === "completed" ||
            (o.orderStatus === "served" && o.paid === "Paid"),
        );
      return filteredOrders;
    },
    [filteredOrders],
  );

  const getCount = (status: string) => getFilteredOrdersByStatus(status).length;

  const calculateOrderTotal = (order: Order): number => {
    return order.items.reduce(
      (total, item) => total + item.cost * item.quantity,
      0,
    );
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const getStatusDetails = (status: string, paid: string) => {
    if (status === "completed" || (status === "served" && paid === "Paid")) {
      return {
        icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />,
        classes: "bg-[#008080]/10 text-[#008080] border border-[#008080]/20",
        label: "Completed",
      };
    }
    if (
      status === "ready_to_pay" ||
      (status === "served" && paid === "Unpaid")
    ) {
      return {
        icon: <CreditCard className="h-3.5 w-3.5 mr-1" />,
        classes: "bg-amber-50 text-amber-700 border border-amber-200",
        label: "Awaiting Payment",
      };
    }
    if (status === "placed") {
      return {
        icon: <UtensilsCrossed className="h-3.5 w-3.5 mr-1" />,
        classes: "bg-blue-50 text-blue-700 border border-blue-200",
        label: "Preparing",
      };
    }
    return {
      icon: <XCircle className="h-3.5 w-3.5 mr-1" />,
      classes: "bg-red-50 text-red-700 border border-red-200",
      label: "Cancelled",
    };
  };

  const metrics = React.useMemo(() => {
    return {
      total: orders.length,
      preparing: orders.filter((o) => o.orderStatus === "placed").length,
      awaitingPayment: orders.filter(
        (o) =>
          o.orderStatus === "ready_to_pay" ||
          (o.orderStatus === "served" && o.paid === "Unpaid"),
      ).length,
      revenue: orders
        .filter((o) => o.paid === "Paid" || o.orderStatus === "completed")
        .reduce((total, o) => total + calculateOrderTotal(o), 0),
    };
  }, [orders]);

  if (error) {
    return (
      <div className="w-full flex-1 p-6">
        <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center max-w-2xl mx-auto mt-12 shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to load orders
          </h3>
          <p className="text-red-600 text-sm">
            Please check your connection and try refreshing the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 p-4 md:p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          {!isPending && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bodyfont">
              <Card className="border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Orders
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <ListOrdered className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {metrics.total}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Preparing
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <UtensilsCrossed className="h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {metrics.preparing}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Awaiting Payment
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">
                    {metrics.awaitingPayment}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#008080]/20 shadow-sm bg-[#008080]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#008080]/10 rounded-bl-full -mr-4 -mt-4"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-[#008080]">
                    Cleared Revenue
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Banknote className="h-5 w-5 text-[#008080]" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl font-bold text-[#008080]">
                    {formatPrice(metrics.revenue)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden z-10 relative monofont">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 border-b border-gray-100 bg-white">
              <div className="w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
                <TabsList className="inline-flex h-11 bg-slate-100 p-1 rounded-lg w-max xl:w-auto border border-slate-200/60">
                  <TabsTrigger
                    value="all"
                    // Added 'group', tightened padding, improved inactive text color
                    className="group flex items-center gap-2 rounded-md text-[13px] font-medium px-4 py-1.5 text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all"
                  >
                    All Orders
                    <Badge
                      variant="secondary"
                      // Badge now dynamically changes to teal when the parent tab is active
                      className="bg-slate-200/70 text-slate-600 border-none shadow-none px-1.5 py-0.5 rounded-md text-[11px] group-data-[state=active]:bg-teal-50 group-data-[state=active]:text-teal-700 transition-colors"
                    >
                      {getCount("all")}
                    </Badge>
                  </TabsTrigger>

                  <TabsTrigger
                    value="preparing"
                    className="group flex items-center gap-2 rounded-md text-[13px] font-medium px-4 py-1.5 text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all"
                  >
                    Preparing
                    <Badge
                      variant="secondary"
                      className="bg-slate-200/70 text-slate-600 border-none shadow-none px-1.5 py-0.5 rounded-md text-[11px] group-data-[state=active]:bg-teal-50 group-data-[state=active]:text-teal-700 transition-colors"
                    >
                      {getCount("preparing")}
                    </Badge>
                  </TabsTrigger>

                  <TabsTrigger
                    value="payment"
                    className="group flex items-center gap-2 rounded-md text-[13px] font-medium px-4 py-1.5 text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all"
                  >
                    Awaiting Payment
                    <Badge
                      variant="secondary"
                      className="bg-slate-200/70 text-slate-600 border-none shadow-none px-1.5 py-0.5 rounded-md text-[11px] group-data-[state=active]:bg-teal-50 group-data-[state=active]:text-teal-700 transition-colors"
                    >
                      {getCount("payment")}
                    </Badge>
                  </TabsTrigger>

                  <TabsTrigger
                    value="completed"
                    className="group flex items-center gap-2 rounded-md text-[13px] font-medium px-4 py-1.5 text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm transition-all"
                  >
                    Completed
                    <Badge
                      variant="secondary"
                      className="bg-slate-200/70 text-slate-600 border-none shadow-none px-1.5 py-0.5 rounded-md text-[11px] group-data-[state=active]:bg-teal-50 group-data-[state=active]:text-teal-700 transition-colors"
                    >
                      {getCount("completed")}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="relative w-full xl:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search order ID, table..."
                  className="pl-9 h-10 bg-slate-50 border-slate-200 text-[14px] rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-full shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {["all", "preparing", "payment", "completed"].map((tab) => (
              <TabsContent
                key={tab}
                value={tab}
                className="m-0 focus-visible:outline-none"
              >
                {isPending ? (
                  <div className="p-6">
                    <OrdersLoadingSkeleton />
                  </div>
                ) : getFilteredOrdersByStatus(tab).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-16 w-16 rounded-full bg-[#008080]/5 flex items-center justify-center mb-4">
                      <ListOrdered className="h-8 w-8 text-[#008080]/40" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No orders found
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mt-1">
                      Try adjusting your search filters or changing the status
                      tab.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[140px] font-medium text-gray-500 h-12 pl-6">
                              Order ID
                            </TableHead>
                            <TableHead className="w-[200px] font-medium text-gray-500 h-12">
                              Date & Time
                            </TableHead>
                            <TableHead className="font-medium text-gray-500 h-12">
                              Summary
                            </TableHead>
                            <TableHead className="w-[120px] font-medium text-gray-500 h-12">
                              Table
                            </TableHead>
                            <TableHead className="w-[160px] font-medium text-gray-500 h-12">
                              Status
                            </TableHead>
                            <TableHead className="text-right font-medium text-gray-500 pr-6 h-12 w-[140px]">
                              Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredOrdersByStatus(tab).map((order) => {
                            const { icon, classes, label } = getStatusDetails(
                              order.orderStatus,
                              order.paid,
                            );

                            return (
                              <TableRow
                                key={order._id}
                                onClick={() => setSelectedOrder(order)}
                                className="cursor-pointer hover:bg-gray-50/80 transition-colors group"
                              >
                                <TableCell className="pl-6 py-4">
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-mono text-gray-500 bg-gray-50 border-gray-200 uppercase group-hover:border-[#008080]/30 group-hover:text-[#008080] transition-colors"
                                  >
                                    {order.orderId
                                      ? `#${order.orderId}`
                                      : `#${order._id.slice(-6)}`}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-sm text-gray-600 font-medium">
                                    {formatTime(order.createdAt)}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-sm text-gray-500 truncate block max-w-[250px] lg:max-w-[400px]">
                                    {order.items
                                      .map((m) => `${m.quantity}x ${m.name}`)
                                      .join(", ")}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-sm font-semibold">
                                    {order.tableNumber}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${classes}`}
                                  >
                                    {icon}
                                    {label}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right pr-6 py-4">
                                  <span className="font-bold text-gray-900 group-hover:text-[#008080] transition-colors">
                                    {formatPrice(calculateOrderTotal(order))}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="md:hidden flex flex-col divide-y divide-gray-100">
                      {getFilteredOrdersByStatus(tab).map((order) => {
                        const { icon, classes, label } = getStatusDetails(
                          order.orderStatus,
                          order.paid,
                        );

                        return (
                          <div
                            key={order._id}
                            onClick={() => setSelectedOrder(order)}
                            className="p-5 flex flex-col gap-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <Badge
                                  variant="outline"
                                  className="text-xs font-mono text-gray-500 bg-gray-50 border-gray-200 mb-1"
                                >
                                  {order.orderId
                                    ? `#${order.orderId}`
                                    : `#${order._id.slice(-6)}`}
                                </Badge>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <CalendarClock className="w-3 h-3 mr-1" />
                                  {formatTime(order.createdAt)}
                                </p>
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${classes}`}
                              >
                                {icon}
                                {label}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100 line-clamp-2">
                              {order.items
                                .map((m) => `${m.quantity}x ${m.name}`)
                                .join(", ")}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                Table{" "}
                                <span className="text-gray-900 font-bold">
                                  {order.tableNumber}
                                </span>
                              </div>
                              <div className="font-bold text-gray-900 text-lg">
                                {formatPrice(calculateOrderTotal(order))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white rounded-xl shadow-2xl border-0">
          {selectedOrder && (
            <div className="flex flex-col h-full max-h-[85vh]">
              <div className="bg-[#008080] text-white p-6 text-center relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50"></div>
                <h2 className="text-xl font-bold tracking-tight">
                  Order Receipt
                </h2>
                <p className="text-white/80 text-sm mt-1 font-mono uppercase tracking-wider">
                  {selectedOrder.orderId
                    ? `#${selectedOrder.orderId}`
                    : `#${selectedOrder._id.slice(-6)}`}
                </p>
              </div>

              <div className="p-6 overflow-y-auto font-mono text-sm bg-gray-50/30">
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-300">
                  <div className="text-gray-500">
                    <p>Date:</p>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {formatTime(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="text-right text-gray-500">
                    <p>Table:</p>
                    <p className="font-bold text-gray-900 text-lg mt-0.5">
                      {selectedOrder.tableNumber}
                    </p>
                  </div>
                </div>

                <div className="py-4 space-y-4">
                  <div className="grid grid-cols-12 text-xs text-gray-400 font-semibold tracking-wider uppercase mb-2">
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-6">Item</div>
                    <div className="col-span-4 text-right">Amount</div>
                  </div>

                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 text-gray-700 items-start"
                    >
                      <div className="col-span-2 font-medium">
                        {item.quantity}x
                      </div>
                      <div className="col-span-6 pr-2">
                        <span className="font-semibold text-gray-900">
                          {item.name}
                        </span>
                        {item.description && (
                          <span className="block text-xs text-gray-400 line-clamp-1 mt-0.5 font-sans">
                            {item.description}
                          </span>
                        )}
                      </div>
                      <div className="col-span-4 text-right font-medium">
                        {formatPrice(item.cost * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-dashed border-gray-300">
                  <div className="flex justify-between items-center text-gray-600 mb-2">
                    <span>Subtotal</span>
                    <span>
                      {formatPrice(calculateOrderTotal(selectedOrder))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 mb-4">
                    <span>Tax (0%)</span>
                    <span>KES 0</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold text-gray-900 py-3 border-y border-dashed border-gray-300 bg-white px-2">
                    <span>TOTAL</span>
                    <span className="text-[#008080]">
                      {formatPrice(calculateOrderTotal(selectedOrder))}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <div className="flex gap-[2px] h-10 items-center opacity-60">
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-800"
                        style={{
                          width: `${Math.random() * 3 + 1}px`,
                          height: "100%",
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 font-sans"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  className="flex-1 bg-[#008080] hover:bg-[#006666] text-white font-sans shadow-md shadow-[#008080]/20"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0 px-6"
        >
          <div className="space-y-2">
            <Skeleton className="h-6 w-24 bg-gray-100 rounded-md" />
            <Skeleton className="h-4 w-32 bg-gray-100" />
          </div>
          <div className="hidden md:block space-y-2 flex-1 px-8">
            <Skeleton className="h-4 w-full bg-gray-100" />
          </div>
          <Skeleton className="h-7 w-16 bg-gray-100 rounded-md mx-4" />
          <Skeleton className="h-7 w-28 rounded-full bg-gray-100" />
          <Skeleton className="h-6 w-24 bg-gray-100 ml-4" />
        </div>
      ))}
    </div>
  );
}
