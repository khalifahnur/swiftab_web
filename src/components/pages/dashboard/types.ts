export interface OrderItem {
  _id: string;
  name: string;
  cost: number;
  quantity: number;
}

export type OrderStatus = "placed" | "served" | "ready_to_pay" | "completed" | "cancelled";

export interface Order {
  _id: string;
  userId: string;
  restaurantId: string;
  reservationId: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: "paid" | "unpaid";
  paymentMethod: "card" | "mpesa" | "cash" | "airtel_money" | null;
  servedBy?: string | null;
  createdAt: string;
}
