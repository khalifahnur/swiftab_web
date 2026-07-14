"use client";

import * as React from "react";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ListOrdered,
  UtensilsCrossed,
  CalendarClock,
  CreditCard,
  Banknote
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const { data, error, isPending } = useQuery<{ orders: Order[] }>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const orders = data?.orders || [];

  const filteredOrders = React.useMemo(() => {
    return orders.filter(
      (order) =>
        order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  // Updated logic to handle the new Payment and Completed states
  const getFilteredOrdersByStatus = React.useCallback(
    (status: string) => {
      if (status === "all") return filteredOrders;
      if (status === "preparing") return filteredOrders.filter((o) => o.orderStatus === "placed");
      if (status === "payment") return filteredOrders.filter((o) => o.orderStatus === "ready_to_pay" || (o.orderStatus === "served" && o.paid === "Unpaid"));
      if (status === "completed") return filteredOrders.filter((o) => o.orderStatus === "completed" || (o.orderStatus === "served" && o.paid === "Paid"));
      if (status === "cancelled") return filteredOrders.filter((o) => o.orderStatus === "cancelled");
      return filteredOrders;
    },
    [filteredOrders]
  );

  const calculateOrderTotal = (order: Order): number => {
    return order.items.reduce((total, item) => total + item.cost * item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return (price).toLocaleString("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-KE', { 
      year: 'numeric',
    month: 'numeric',
    day: 'numeric',
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
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
    if (status === "ready_to_pay" || (status === "served" && paid === "Unpaid")) {
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
      awaitingPayment: orders.filter((o) => o.orderStatus === "ready_to_pay" || (o.orderStatus === "served" && o.paid === "Unpaid")).length,
      revenue: orders.filter((o) => o.paid === "Paid" || o.orderStatus === "completed").reduce((total, o) => total + calculateOrderTotal(o), 0),
    };
  }, [orders]);

  if (error) {
    return (
      <div className="w-full flex-1 p-6">
        <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center max-w-2xl mx-auto mt-12 shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load orders</h3>
          <p className="text-red-600 text-sm">Please check your connection and try refreshing the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 p-4 md:p-8 bg-gray-50/50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Metrics Section */}
        <div>
          {!isPending && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <ListOrdered className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{metrics.total}</div>
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Preparing</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <UtensilsCrossed className="h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{metrics.preparing}</div>
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Awaiting Payment</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">{metrics.awaitingPayment}</div>
                </CardContent>
              </Card>

              <Card className="border-[#008080]/20 shadow-sm bg-[#008080]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#008080]/10 rounded-bl-full -mr-4 -mt-4"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-[#008080]">Cleared Revenue</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Banknote className="h-5 w-5 text-[#008080]" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl font-bold text-[#008080]">{formatPrice(metrics.revenue)}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden z-10 relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 border-b border-gray-100">
              <TabsList className="h-11 bg-gray-50/80 p-1 w-full xl:w-auto overflow-x-auto justify-start border border-gray-100">
                <TabsTrigger 
                  value="all" 
                  className="rounded-md text-sm px-5 py-2 data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-sm transition-all"
                >
                  All Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="preparing" 
                  className="rounded-md text-sm px-5 py-2 data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-sm transition-all"
                >
                  Preparing
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="rounded-md text-sm px-5 py-2 data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-sm transition-all"
                >
                  Awaiting Payment
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="rounded-md text-sm px-5 py-2 data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-sm transition-all"
                >
                  Completed
                </TabsTrigger>
              </TabsList>

              <div className="relative w-full xl:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search order ID, table, or item..."
                  className="pl-9 h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-[#008080]/20 focus:border-[#008080] transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {["all", "preparing", "payment", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="m-0 focus-visible:outline-none">
                {isPending ? (
                  <div className="p-6"><OrdersLoadingSkeleton /></div>
                ) : getFilteredOrdersByStatus(tab).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                      <ListOrdered className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No orders found in this view</h3>
                    <p className="text-sm text-gray-500 max-w-sm mt-1">Try adjusting your search filters or changing the status tab.</p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[180px] font-medium text-gray-500 h-12 pl-6">#</TableHead>
                            <TableHead className="w-[180px] font-medium text-gray-500 h-12 pl-6">Date</TableHead>
                            <TableHead className="font-medium text-gray-500 h-12">Items</TableHead>
                            <TableHead className="font-medium text-gray-500 h-12">Table</TableHead>
                            <TableHead className="font-medium text-gray-500 h-12">Status</TableHead>
                            <TableHead className="text-right font-medium text-gray-500 pr-6 h-12">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredOrdersByStatus(tab).map((order) => {
                            const { icon, classes, label } = getStatusDetails(order.orderStatus, order.paid);
                            
                            return (
                              <TableRow key={order._id} className="cursor-pointer hover:bg-gray-50/80 transition-colors group">
                                <TableCell className="pl-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 group-hover:text-[#008080] transition-colors">#{order._id.slice(0,4)}</span>
                                    
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="flex flex-col">
                                    
                                    <span className="text-xs text-gray-500 flex items-center mt-1">
                                      
                                      {formatTime(order.createdAt)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[250px] lg:max-w-[400px]">
                                      {order.items.map(m => `${m.quantity}x ${m.name}`).join(', ')}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="pl-2 py-4">
                                  <div className="inline-flex items-center px-2.5 py-1 rounded bg-gray-100 text-gray-800 text-xs font-semibold">
                                    {order.tableNumber}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${classes}`}>
                                    {icon}
                                    {label}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right pr-6 py-4">
                                  <span className="font-bold text-gray-900">{formatPrice(calculateOrderTotal(order))}</span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden flex flex-col divide-y divide-gray-100">
                      {getFilteredOrdersByStatus(tab).map((order) => {
                        const { icon, classes, label } = getStatusDetails(order.orderStatus, order.paid);
                        
                        return (
                          <div key={order._id} className="p-5 flex flex-col gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-gray-900">{order.orderId}</h3>
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                                  <CalendarClock className="w-3 h-3 mr-1" />
                                  {formatTime(order.createdAt)}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${classes}`}>
                                {icon}
                                {label}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                               {order.items.map(m => `${m.quantity}x ${m.name}`).join(', ')}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                               <div className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                 Table <span className="text-gray-900 font-bold">{order.tableNumber}</span>
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
    </div>
  );
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0 px-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-gray-100" />
            <Skeleton className="h-3 w-24 bg-gray-100" />
          </div>
          <div className="hidden md:block space-y-2">
             <Skeleton className="h-4 w-48 bg-gray-100" />
          </div>
          <Skeleton className="h-6 w-16 bg-gray-100 rounded" />
          <Skeleton className="h-6 w-24 rounded-full bg-gray-100" />
          <Skeleton className="h-5 w-20 bg-gray-100" />
        </div>
      ))}
    </div>
  );
}