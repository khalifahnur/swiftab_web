import apiClient, { isUnauthorized } from "./axios";
import type { AuthData } from "@/types/auth";
import type {
  AdminInfo,
  DashboardPeriod,
  DashboardStats,
  Floor,
  FloorTable,
  Layout,
  LiveFloor,
  MenuCategory,
  MenuItemInput,
  Order,
  Promotion,
  PromotionInput,
  Reservation,
  ReservationStatus,
  RestaurantInput,
  Waiter,
  WaiterInput,
  WaiterList,
} from "@/types/api";

/**
 * Every call to the Swiftab API lives here. Functions throw the axios error
 * untouched; use `errorMessage` from ./axios to show it to a person.
 */

type Message = { message: string };

// --- Account -----------------------------------------------------------------

export async function loginAdmin(data: AuthData): Promise<Message> {
  return (await apiClient.post<Message>("/admin/login", data)).data;
}

export async function signUpAdmin(data: AuthData): Promise<Message> {
  return (await apiClient.post<Message>("/admin/signup", data)).data;
}

export async function logoutAdmin(): Promise<void> {
  await apiClient.post("/admin/logout");
}

/** The signed-in admin, or null when there is no session. */
export async function fetchAdminInfo(): Promise<AdminInfo | null> {
  try {
    return (await apiClient.get<AdminInfo>("/admin/info")).data;
  } catch (error) {
    if (isUnauthorized(error)) return null;
    throw error;
  }
}

export async function updateProfile(data: { name: string; phoneNumber: string }): Promise<Message> {
  return (await apiClient.put<Message>("/admin/profile", data)).data;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<Message> {
  return (await apiClient.put<Message>("/admin/password", data)).data;
}

// --- Restaurant --------------------------------------------------------------

/** Creates the restaurant from the setup wizard. The cover photo is required. */
export async function createRestaurant(
  input: RestaurantInput,
  images: { cover: File; logo?: File | null },
): Promise<Message> {
  const form = new FormData();
  form.append("data", JSON.stringify({ title: "New Restaurants", data: [input] }));
  form.append("cover", images.cover);
  if (images.logo) form.append("logo", images.logo);
  return (await apiClient.post<Message>("/admin/restaurant", form)).data;
}

/** Saves the restaurant fields that are passed; everything else is left alone. */
export async function updateRestaurant(
  input: RestaurantInput,
  images: { cover?: File | null; logo?: File | null } = {},
): Promise<Message> {
  if (!images.cover && !images.logo) {
    return (await apiClient.put<Message>("/admin/restaurant", input)).data;
  }
  const form = new FormData();
  form.append("data", JSON.stringify(input));
  if (images.cover) form.append("cover", images.cover);
  if (images.logo) form.append("logo", images.logo);
  return (await apiClient.put<Message>("/admin/restaurant", form)).data;
}

// --- Dashboard ---------------------------------------------------------------

export async function fetchDashboardStats(period: DashboardPeriod): Promise<DashboardStats> {
  return (await apiClient.get<DashboardStats>("/admin/dashboard", { params: { period } })).data;
}

// --- Menu --------------------------------------------------------------------

export async function fetchMenu(): Promise<MenuCategory[]> {
  const { data } = await apiClient.get<{ categories: MenuCategory[] }>("/admin/menu");
  return data.categories ?? [];
}

export async function addCategory(label: string): Promise<Message> {
  return (await apiClient.post<Message>("/admin/menu/categories", { label })).data;
}

export async function renameCategory(key: string, label: string): Promise<Message> {
  return (await apiClient.put<Message>(`/admin/menu/categories/${key}`, { label })).data;
}

export async function reorderCategories(order: string[]): Promise<Message> {
  return (await apiClient.put<Message>("/admin/menu/categories", { order })).data;
}

/** With `force`, the category's dishes are deleted along with it. */
export async function deleteCategory(key: string, force = false): Promise<Message> {
  return (await apiClient.delete<Message>(`/admin/menu/categories/${key}`, { params: force ? { force: true } : undefined })).data;
}

function menuItemForm(input: Partial<MenuItemInput>): FormData {
  const form = new FormData();
  if (input.name !== undefined) form.append("name", input.name);
  if (input.description !== undefined) form.append("description", input.description);
  if (input.cost !== undefined) form.append("cost", String(input.cost));
  if (input.available !== undefined) form.append("available", String(input.available));
  if (input.tags !== undefined) form.append("tags", JSON.stringify(input.tags));
  if (input.prepTime !== undefined) form.append("prepTime", String(input.prepTime));
  if (input.category) form.append("category", input.category);
  if (input.image) form.append("file", input.image);
  return form;
}

export async function addMenuItem(category: string, input: MenuItemInput): Promise<Message> {
  return (await apiClient.post<Message>(`/admin/menu/${category}`, menuItemForm(input))).data;
}

export async function updateMenuItem(category: string, itemId: string, input: Partial<MenuItemInput>): Promise<Message> {
  return (await apiClient.put<Message>(`/admin/menu/${category}/${itemId}`, menuItemForm(input))).data;
}

/** Switches a dish on or off without touching anything else about it. */
export async function setMenuItemAvailability(category: string, itemId: string, available: boolean): Promise<Message> {
  return (await apiClient.put<Message>(`/admin/menu/${category}/${itemId}`, { available })).data;
}

export async function deleteMenuItem(category: string, itemId: string): Promise<Message> {
  return (await apiClient.delete<Message>(`/admin/menu/${category}/${itemId}`)).data;
}

// --- Floor plan --------------------------------------------------------------

export async function fetchLayout(): Promise<Layout> {
  const { data } = await apiClient.get<{ restaurantLayoutData?: { floors?: Floor[]; tablePosition?: FloorTable[] } }>(
    "/admin/layout/tables",
  );
  return {
    floors: data.restaurantLayoutData?.floors ?? [],
    tables: (data.restaurantLayoutData?.tablePosition ?? []).map((t) => ({ ...t, chairs: t.chairs ?? [] })),
  };
}

/** Saves floors, tables and chairs together. Returns what the server stored. */
export async function saveLayout(layout: Layout): Promise<Layout> {
  const { data } = await apiClient.post<{ floors: Floor[]; tables: FloorTable[] }>("/admin/layout/tables", layout);
  return { floors: data.floors ?? [], tables: data.tables ?? [] };
}

export async function fetchLiveFloor(): Promise<LiveFloor> {
  return (await apiClient.get<LiveFloor>("/admin/layout/live")).data;
}

// --- Orders ------------------------------------------------------------------

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<{ orders: Order[] }>("/admin/orders");
  return data.orders ?? [];
}

export async function updateOrder(
  orderId: string,
  change: { orderStatus?: "completed" | "cancelled"; paymentMethod?: string; paymentReference?: string },
): Promise<Message> {
  return (await apiClient.put<Message>(`/admin/orders/${orderId}`, change)).data;
}

// --- Reservations ------------------------------------------------------------

export async function fetchReservations(): Promise<Reservation[]> {
  return (await apiClient.get<Reservation[]>("/admin/reservations")).data ?? [];
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<Message> {
  return (await apiClient.put<Message>(`/admin/reservations/${id}/status`, { status })).data;
}

// --- Staff -------------------------------------------------------------------

export async function fetchWaiters(): Promise<WaiterList> {
  const { data } = await apiClient.get<Partial<WaiterList>>("/admin/waiters");
  return { waiter: data.waiter ?? [], emailConfigured: Boolean(data.emailConfigured) };
}

type WaiterResult = Message & { waiter: Waiter; emailed: boolean };

export async function addWaiter(input: WaiterInput): Promise<WaiterResult> {
  return (await apiClient.post<WaiterResult>("/admin/waiters/signup", input)).data;
}

/**
 * Issues a new invite code. With `reset`, an active waiter's password is
 * cleared so they can sign up again with the new code.
 */
export async function resendWaiterInvite(waiterId: string, reset = false): Promise<WaiterResult> {
  return (
    await apiClient.post<WaiterResult>(`/admin/waiters/${waiterId}/invite`, undefined, {
      params: reset ? { reset: true } : undefined,
    })
  ).data;
}

export async function deleteWaiter(waiterId: string): Promise<Message> {
  return (await apiClient.delete<Message>(`/admin/waiters/${waiterId}`)).data;
}

// --- Promotions --------------------------------------------------------------

export async function fetchPromotions(): Promise<Promotion[]> {
  const { data } = await apiClient.get<{ promotions: Promotion[] }>("/admin/promotions");
  return data.promotions ?? [];
}

function promotionBody(input: Partial<PromotionInput>): FormData | Partial<PromotionInput> {
  const { image, ...fields } = input;
  if (!image) return fields;
  const form = new FormData();
  form.append("data", JSON.stringify(fields));
  form.append("image", image);
  return form;
}

export async function createPromotion(input: PromotionInput): Promise<Message> {
  return (await apiClient.post<Message>("/admin/promotions", promotionBody(input))).data;
}

export async function updatePromotion(id: string, input: Partial<PromotionInput>): Promise<Message> {
  return (await apiClient.put<Message>(`/admin/promotions/${id}`, promotionBody(input))).data;
}

export async function deletePromotion(id: string): Promise<Message> {
  return (await apiClient.delete<Message>(`/admin/promotions/${id}`)).data;
}
