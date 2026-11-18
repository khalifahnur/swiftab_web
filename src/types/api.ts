// Shapes returned by the Swiftab API (swiftab-server, /api/v2).

export type OrderStatus = "placed" | "served" | "ready_to_pay" | "completed" | "cancelled";
export type PaymentStatus = "paid" | "unpaid";
export type ReservationStatus = "active" | "seated" | "completed" | "cancelled" | "no_show";

export interface OpeningHour {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

/** The signed-in admin and, once set up, their restaurant. */
export interface AdminInfo {
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  restaurantId: string | null;
  restaurantName?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  logo?: string;
  rate?: number;
  reviewCount?: number;
  description?: string;
  averagePrice?: number;
  hrsOfOperation?: string;
  phone?: string;
  restaurantEmail?: string;
  cuisines?: string[];
  amenities?: string[];
  paymentMethods?: string[];
  /** Fractions: 0.16 means 16%. */
  taxRate?: number;
  serviceCharge?: number;
  openingHours?: OpeningHour[];
  acceptingReservations?: boolean;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  trialEndsAt?: string | null;
}

/** Fields the setup wizard and Settings can send. Rates are fractions (0.16 for 16%). */
export interface RestaurantInput {
  restaurantName?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  averagePrice?: number;
  phone?: string;
  email?: string;
  cuisines?: string[];
  amenities?: string[];
  paymentMethods?: string[];
  taxRate?: number;
  serviceCharge?: number;
  openingHours?: OpeningHour[];
  acceptingReservations?: boolean;
}

// --- Menu --------------------------------------------------------------------

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  cost: number;
  image?: string;
  /** Missing means available. */
  available?: boolean;
  tags?: string[];
  prepTime?: number;
}

export interface MenuCategory {
  key: string;
  label: string;
  items: MenuItem[];
}

export interface MenuItemInput {
  name: string;
  description: string;
  cost: number;
  available: boolean;
  tags: string[];
  prepTime?: number;
  /** Move the dish to another category (edit only). */
  category?: string;
  image?: File | null;
}

// --- Floor plan --------------------------------------------------------------

export interface Floor {
  id: string;
  name: string;
}

export interface Chair {
  id: string;
  position: string;
}

export type TableShape = "rectangle" | "round" | "square";

export interface FloorTable {
  id: string;
  name: string;
  floorId: string;
  shape: TableShape;
  position: { x: number; y: number };
  rotation: number;
  size: { width: number; height: number };
  chairs: Chair[];
}

export interface Layout {
  floors: Floor[];
  tables: FloorTable[];
}

export type LiveStatus = "free" | "reserved" | "occupied";

export interface LiveTable extends FloorTable {
  seats: number;
  live: {
    status: LiveStatus;
    guests: number;
    /** Guest name for a reservation, order state for a seated table. */
    detail?: string;
    since?: string;
    until?: string;
  };
}

export interface LiveFloor {
  floors: Floor[];
  tables: LiveTable[];
  counts: Record<LiveStatus, number>;
}

// --- Orders ------------------------------------------------------------------

export interface OrderItem {
  _id: string;
  name: string;
  cost: number;
  quantity: number;
  description?: string;
  note?: string;
  /** The friend who ordered it on a host's shared tab. */
  addedBy?: string;
}

export interface Order {
  _id: string;
  orderId?: string;
  reservationId?: string;
  tableNumber: string;
  guests?: number;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  /** "mpesa" | "cash" | "card" | "airtel_money", or empty until the guest chooses. */
  paymentMethod?: string;
  paymentReference?: string;
  userId?: { _id: string; name: string; phoneNumber?: string } | null;
  servedBy?: { _id: string; firstname: string; lastname?: string } | null;
  createdAt: string;
  updatedAt?: string;
  servedAt?: string | null;
  paidAt?: string | null;
}

// --- Reservations ------------------------------------------------------------

export interface Reservation {
  _id: string;
  reservationID: string;
  name: string;
  email: string;
  phoneNumber: string;
  start: string;
  end: string;
  bookedAt?: string;
  guests: number;
  table: string;
  floor: string;
  notes?: string;
  status: ReservationStatus;
  hasOrder?: boolean;
}

// --- Staff -------------------------------------------------------------------

export interface Waiter {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  onDuty?: boolean;
  status: "active" | "pending";
  /** Present only until the waiter finishes signing up in the app. */
  inviteCode?: string;
  inviteExpiresAt?: string;
  inviteExpired?: boolean;
}

export interface WaiterList {
  waiter: Waiter[];
  /** Whether the server can email invite codes itself. */
  emailConfigured: boolean;
}

export interface WaiterInput {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
}

// --- Promotions --------------------------------------------------------------

export type PromotionType = "DISCOUNT" | "PAYMENT_OFFER" | "SPECIAL" | "SEASONAL";

export interface Promotion {
  _id: string;
  title: string;
  description: string;
  type: PromotionType;
  discountPercentage?: number;
  paymentMethod?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  termsAndConditions?: string;
  image?: string;
  createdAt?: string;
}

export interface PromotionInput {
  title: string;
  description: string;
  type: PromotionType;
  discountPercentage?: number;
  paymentMethod?: string;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  isActive: boolean;
  termsAndConditions: string;
  image?: File | null;
}

// --- Dashboard ---------------------------------------------------------------

export type DashboardPeriod = "weekly" | "monthly" | "yearly";

export interface KpiTrend {
  today: number;
  yesterday: number;
  changePercent: number;
  sparkline: { value: number }[];
}

export interface Comparison {
  value: number;
  previous: number;
  changePercent: number;
}

export interface DashboardStats {
  period: DashboardPeriod;
  timezone: string;
  live: {
    reservationsToday: number;
    guestsToday: number;
    seatedTables: number;
    reservedTables: number;
    totalTables: number;
    totalSeats: number;
    occupancyRate: number;
    activeGuests: number;
    openOrders: number;
    awaitingPayment: number;
    unpaidAmount: number;
  };
  kpiTrends: {
    revenue: KpiTrend;
    orders: KpiTrend;
    reservations: KpiTrend;
    guests: KpiTrend;
  };
  summary: {
    revenue: Comparison;
    orders: Comparison;
    avgOrderValue: Comparison;
    reservations: Comparison;
    cancellationRate: Comparison;
  };
  trend: { label: string; date: string; revenue: number; orders: number }[];
  areaOccupancy: { area: string; occupied: number; reserved: number; total: number; percentage: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  paymentMethods: { method: string; label: string; count: number; revenue: number; percentage: number }[];
  peakHours: { hour: number; label: string; orders: number }[];
  staff: { id: string; name: string; orders: number; revenue: number }[];
  upcomingReservations: { _id: string; name: string; time: string; guests: number; tableNumber: string; diningArea: string }[];
}

/** A change pushed over the live event stream. */
export interface LiveEvent {
  type: "order" | "reservation";
  action: string;
  id?: string;
  table?: string;
  status?: string;
}

// --- Table QR codes ------------------------------------------------------------

export interface TableCode {
  id: string;
  name: string;
  floorId: string;
  floorName: string;
  seats: number;
  /** Signed by the server; the guest page sends it back to prove the scan. */
  code: string;
}

export interface TableCodes {
  restaurantId: string;
  restaurantName: string;
  logo?: string;
  image?: string;
  tables: TableCode[];
}
