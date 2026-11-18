import { API_BASE_URL } from "./axios";

/**
 * Calls made by the guest page a table's QR code opens. Guests have no
 * account: after checking in they hold a token for that one visit, sent as a
 * bearer header. Kept apart from the dashboard client, which uses the
 * manager's session cookie.
 */

export interface DineRestaurant {
  id: string;
  name: string;
  image?: string;
  logo?: string;
  location?: string;
  paymentMethods: string[];
}

export interface DineTable {
  id: string;
  name: string;
  floor: string;
  seats: number;
}

export interface DineItem {
  _id: string;
  name: string;
  description?: string;
  cost: number;
  image?: string;
  quantity?: number;
  note?: string;
  tags?: string[];
  prepTime?: number;
  available?: boolean;
  /** Who added the line, when a friend ordered it on a shared tab. */
  addedBy?: string;
  addedById?: string;
}

export interface DineOrder {
  _id: string;
  orderId?: string;
  status: "placed" | "served" | "ready_to_pay" | "completed" | "cancelled";
  items: DineItem[];
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  servedAt?: string | null;
  paidAt?: string | null;
  waiter?: string;
}

export interface TabGuest {
  id: string;
  name: string;
  joinedAt: string;
  items: number;
  total: number;
}

/** The host's share link and the friends who joined through it. */
export interface DineTab {
  open: boolean;
  canShare: boolean;
  url?: string;
  code?: string;
  openedAt?: string;
  guests: TabGuest[];
  maxGuests: number;
}

/** Who is looking: the person seated, or a friend ordering on their tab. */
export type DineYou = { role: "host"; name: string } | { role: "friend"; id: string; name: string; host: string };

export interface DineVisit {
  restaurant: DineRestaurant;
  table: DineTable;
  visit: {
    reservationId: string;
    name: string;
    guests: number;
    status: string;
    since: string;
    until: string;
    open: boolean;
  };
  you?: DineYou;
  /** Only sent to the host. */
  tab?: DineTab;
  orders: DineOrder[];
}

export interface TabPreview {
  restaurant: DineRestaurant;
  host: string;
  table: string;
  floor?: string;
  since: string;
  until: string;
  status: string;
  canJoin: boolean;
  guests: number;
  full: boolean;
}

export interface MenuSection {
  key: string;
  label: string;
  items: DineItem[];
}

export class DineError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function call<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new DineError("You appear to be offline. Check your connection and try again.", 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (body && (body.message || body.error)) || (res.status >= 500 ? "Something went wrong on our side. Please try again." : "That did not work.");
    throw new DineError(String(message), res.status);
  }
  return body as T;
}

const tablePath = (restaurantId: string, tableId: string) => `/dine/tables/${restaurantId}/${encodeURIComponent(tableId)}`;

export const fetchTable = (restaurantId: string, tableId: string, code: string) =>
  call<{ restaurant: DineRestaurant; table: DineTable; status: "free" | "busy" }>(
    `${tablePath(restaurantId, tableId)}?code=${encodeURIComponent(code)}`,
  );

export const checkIn = (restaurantId: string, tableId: string, input: { code: string; name: string; phoneNumber: string; guests: number }) =>
  call<DineVisit & { token: string; returning: boolean }>(`${tablePath(restaurantId, tableId)}/checkin`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const fetchVisit = (token: string) => call<DineVisit>("/dine/visit", { token });

export const fetchMenu = async (restaurantId: string) =>
  (await call<{ categories: MenuSection[] }>(`/restaurants/${restaurantId}/menu/sections`)).categories ?? [];

export const placeOrder = (token: string, menu: { _id: string; quantity: number; note?: string }[]) =>
  call<{ message: string }>("/dine/visit/orders", { method: "POST", token, body: JSON.stringify({ menu }) });

export const requestBill = (token: string, orderId: string, paymentMethod: string) =>
  call<{ message: string }>(`/dine/visit/orders/${orderId}/bill`, {
    method: "PUT",
    token,
    body: JSON.stringify({ status: "ready_to_pay", paymentMethod }),
  });

export const cancelOrder = (token: string, orderId: string) =>
  call<{ message: string }>(`/dine/visit/orders/${orderId}/cancel`, { method: "PUT", token });

export const shareTab = (token: string) => call<DineTab>("/dine/visit/tab", { method: "POST", token });

export const stopTab = (token: string) => call<DineTab>("/dine/visit/tab", { method: "DELETE", token });

export const fetchTabPreview = (code: string) => call<TabPreview>(`/tab/${encodeURIComponent(code)}`);

export const joinTab = (code: string, name: string) =>
  call<DineVisit & { token: string }>(`/tab/${encodeURIComponent(code)}/join`, { method: "POST", body: JSON.stringify({ name }) });

/** Payment methods as the API names them, from whatever the restaurant saved. */
export function paymentKey(method: string): string {
  const m = method.toLowerCase().replace(/[^a-z]/g, "");
  if (m.includes("mpesa")) return "mpesa";
  if (m.includes("airtel")) return "airtel_money";
  if (m.includes("card") || m.includes("visa") || m.includes("master")) return "card";
  if (m.includes("cash")) return "cash";
  return m;
}
