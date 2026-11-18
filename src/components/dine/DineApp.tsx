"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCheck,
  ChefHat,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  ShoppingBag,
  Smartphone,
  UtensilsCrossed,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  cancelOrder,
  checkIn,
  DineError,
  fetchMenu,
  fetchTable,
  fetchVisit,
  paymentKey,
  placeOrder,
  requestBill,
  type DineItem,
  type DineOrder,
  type DineVisit,
} from "@/lib/dineApi";
import { formatKes, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------------
 * The page a table's QR code opens. A guest says who they are (name or phone),
 * is seated at that table, then orders from the menu and follows the order
 * until it is paid, all in the browser, with no app or account.
 * --------------------------------------------------------------------------- */

const storageKey = (restaurantId: string, tableId: string) => `swiftab-visit:${restaurantId}:${tableId}`;

function readToken(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeToken(key: string, token: string | null) {
  try {
    if (token) window.localStorage.setItem(key, token);
    else window.localStorage.removeItem(key);
  } catch {
    // Private browsing: the visit lasts until the tab is closed.
  }
}

export default function DineApp({ restaurantId, tableId, code }: { restaurantId: string; tableId: string; code: string }) {
  const key = storageKey(restaurantId, tableId);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(readToken(key));
    setReady(true);
  }, [key]);

  const startVisit = (next: string) => {
    writeToken(key, next);
    setToken(next);
  };
  const endVisit = () => {
    writeToken(key, null);
    setToken(null);
  };

  return (
    <div className="min-h-dvh bg-[#F4F7F6] font-sans text-[#0F1F1D]">
      <div className="mx-auto min-h-dvh max-w-md bg-[#F4F7F6] sm:border-x sm:border-gray-200">
        {!ready ? (
          <FullScreenLoader />
        ) : token ? (
          <Visit token={token} onEnd={endVisit} />
        ) : (
          <CheckIn restaurantId={restaurantId} tableId={tableId} code={code} onCheckedIn={startVisit} />
        )}
      </div>
    </div>
  );
}

function FullScreenLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-sm text-gray-500">
      <Loader2 className="h-6 w-6 animate-spin text-teal" />
      {label}
    </div>
  );
}

function Problem({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
        <QrCode className="h-7 w-7 text-teal" />
      </div>
      <h1 className="mt-5 text-lg font-semibold">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function Hero({ image, name, children }: { image?: string; name: string; children?: React.ReactNode }) {
  return (
    <div className="relative h-56 overflow-hidden bg-teal-deep">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/75" />
      <div className="absolute inset-x-0 bottom-0 px-5 pb-12 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Welcome to</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight">{name}</h1>
        {children}
      </div>
    </div>
  );
}

// --- Step 1: who are you? --------------------------------------------------------

function CheckIn({
  restaurantId,
  tableId,
  code,
  onCheckedIn,
}: {
  restaurantId: string;
  tableId: string;
  code: string;
  onCheckedIn: (token: string) => void;
}) {
  const table = useQuery({
    queryKey: ["dine-table", restaurantId, tableId, code],
    queryFn: () => fetchTable(restaurantId, tableId, code),
    retry: (count, error) => !(error instanceof DineError && error.status > 0 && error.status < 500) && count < 2,
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState("");

  const seat = useMutation({
    mutationFn: () => checkIn(restaurantId, tableId, { code, name: name.trim(), phoneNumber: phone.trim(), guests }),
    onSuccess: (data) => {
      toast.success(data.returning ? `Welcome back${data.visit.name ? `, ${data.visit.name.split(" ")[0]}` : ""}` : `You are seated at table ${data.table.name}`);
      onCheckedIn(data.token);
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not check you in."),
  });

  if (!code) {
    return <Problem title="This link is incomplete" message="Scan the QR code on your table again with your phone's camera." />;
  }
  if (table.isPending) return <FullScreenLoader label="Finding your table…" />;
  if (table.isError) {
    return (
      <Problem
        title="We could not open this table"
        message={table.error instanceof Error ? table.error.message : "Please try again."}
        action={
          <button type="button" onClick={() => table.refetch()} className="h-11 rounded-xl bg-teal px-5 text-sm font-semibold text-white">
            Try again
          </button>
        }
      />
    );
  }

  const { restaurant, table: t, status } = table.data;
  const digits = phone.replace(/\D/g, "");
  const phoneValid = !phone.trim() || (digits.length >= 9 && digits.length <= 12);
  const canSubmit = (name.trim().length > 1 || digits.length >= 9) && phoneValid && !seat.isPending;

  return (
    <div className="pb-10">
      <Hero image={restaurant.image} name={restaurant.name}>
        {restaurant.location && (
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/80">
            <MapPin className="h-3.5 w-3.5" /> {restaurant.location}
          </p>
        )}
      </Hero>

      <div className="relative -mt-8 px-4">
        <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_-12px_rgba(15,31,29,0.25)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal text-white">
              <span className="text-[15px] font-bold">{t.name}</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold">Table {t.name}</p>
              <p className="text-[13px] text-gray-500">
                {[t.floor, t.seats ? `${t.seats} seats` : ""].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          {status === "busy" && (
            <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-amber-900">
              Someone is already checked in at this table. If you are with them, or you checked in earlier, enter the same phone number.
            </p>
          )}

          <form
            className="mt-5 space-y-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              if (canSubmit) seat.mutate();
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-gray-700">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="e.g. Wanjiku Kamau"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-[15px] outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/15"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-gray-700">Phone number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0712 345 678"
                aria-invalid={!phoneValid}
                className={cn(
                  "h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] outline-none transition focus:ring-2",
                  phoneValid ? "border-gray-200 focus:border-teal focus:ring-teal/15" : "border-rose-400 focus:ring-rose-100",
                )}
              />
              <span className={cn("mt-1.5 block text-[12px]", phoneValid ? "text-gray-500" : "text-rose-600")}>
                {phoneValid ? "Use it again to find your order from another phone." : "Enter a valid phone number."}
              </span>
            </label>

            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-[14px] font-medium text-gray-700">
                <Users className="h-4 w-4 text-gray-400" /> Guests
              </span>
              <Stepper value={guests} min={1} max={30} onChange={setGuests} />
            </div>

            {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-rose-700">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal text-[15px] font-semibold text-white shadow-sm transition hover:bg-teal-deep disabled:opacity-50"
            >
              {seat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {seat.isPending ? "Checking you in…" : "Take my seat"}
            </button>
            <p className="text-center text-[12px] text-gray-500">Enter your name, your phone number, or both.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        aria-label="Fewer"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-5 text-center text-[15px] font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="More"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-white disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// --- Step 2: menu, cart and orders -----------------------------------------------

type Line = { item: DineItem; quantity: number; note: string };

const STATUS: Record<DineOrder["status"], { label: string; tone: string; hint: string }> = {
  placed: { label: "Preparing", tone: "bg-amber-50 text-amber-800", hint: "The kitchen has your order." },
  served: { label: "Served", tone: "bg-sky-50 text-sky-700", hint: "Enjoy! Ask for the bill here when you are ready." },
  ready_to_pay: { label: "Bill requested", tone: "bg-violet-50 text-violet-700", hint: "Your waiter is bringing the bill." },
  completed: { label: "Paid", tone: "bg-emerald-50 text-emerald-700", hint: "All settled. Thank you!" },
  cancelled: { label: "Cancelled", tone: "bg-rose-50 text-rose-700", hint: "This order was cancelled." },
};

function Visit({ token, onEnd }: { token: string; onEnd: () => void }) {
  const client = useQueryClient();
  const visit = useQuery({
    queryKey: ["dine-visit", token],
    queryFn: () => fetchVisit(token),
    refetchInterval: (q) => (q.state.data?.orders.some((o) => ["placed", "served", "ready_to_pay"].includes(o.status)) ? 8000 : 30000),
    retry: (count, error) => !(error instanceof DineError && error.status === 401) && count < 2,
  });
  const restaurantId = visit.data?.restaurant.id;
  const menu = useQuery({ queryKey: ["dine-menu", restaurantId], queryFn: () => fetchMenu(restaurantId!), enabled: Boolean(restaurantId) });

  const [tab, setTab] = useState<"menu" | "orders">("menu");
  const [cart, setCart] = useState<Record<string, Line>>({});
  const [cartOpen, setCartOpen] = useState(false);

  // A rejected visit token means the visit is over: back to check-in.
  useEffect(() => {
    if (visit.error instanceof DineError && visit.error.status === 401) {
      toast(visit.error.message);
      onEnd();
    }
  }, [visit.error, onEnd]);

  // Announce each change the restaurant makes to an order.
  const seen = useRef<Map<string, string> | null>(null);
  useEffect(() => {
    const orders = visit.data?.orders;
    if (!orders) return;
    const previous = seen.current;
    seen.current = new Map(orders.map((o) => [o._id, o.status]));
    if (!previous) return;
    for (const o of orders) {
      const before = previous.get(o._id);
      if (before && before !== o.status) {
        const s = STATUS[o.status];
        if (o.status === "cancelled") toast.error(s.hint);
        else toast.success(`${s.label}: ${s.hint}`);
      }
    }
  }, [visit.data]);

  const refresh = () => client.invalidateQueries({ queryKey: ["dine-visit", token] });

  const order = useMutation({
    mutationFn: () =>
      placeOrder(
        token,
        Object.values(cart).map((l) => ({ _id: l.item._id, quantity: l.quantity, note: l.note.trim() || undefined })),
      ),
    onSuccess: () => {
      setCart({});
      setCartOpen(false);
      setTab("orders");
      toast.success("Order sent to the kitchen");
      refresh();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not place the order."),
  });

  if (visit.isPending) return <FullScreenLoader label="Opening your table…" />;
  if (visit.isError || !visit.data) {
    return (
      <Problem
        title="We could not load your table"
        message={visit.error instanceof Error ? visit.error.message : "Please try again."}
        action={
          <button type="button" onClick={() => visit.refetch()} className="h-11 rounded-xl bg-teal px-5 text-sm font-semibold text-white">
            Try again
          </button>
        }
      />
    );
  }

  const data = visit.data;
  const lines = Object.values(cart);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const total = lines.reduce((n, l) => n + l.quantity * l.item.cost, 0);
  const openOrders = data.orders.filter((o) => ["placed", "served", "ready_to_pay"].includes(o.status)).length;

  const add = (item: DineItem) => setCart((c) => ({ ...c, [item._id]: { item, quantity: (c[item._id]?.quantity ?? 0) + 1, note: c[item._id]?.note ?? "" } }));
  const remove = (id: string) =>
    setCart((c) => {
      const line = c[id];
      if (!line) return c;
      const next = { ...c };
      if (line.quantity <= 1) delete next[id];
      else next[id] = { ...line, quantity: line.quantity - 1 };
      return next;
    });

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-white/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center gap-3">
          {data.restaurant.logo || data.restaurant.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.restaurant.logo || data.restaurant.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
              <UtensilsCrossed className="h-4 w-4 text-teal" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{data.restaurant.name}</p>
            <p className="truncate text-[12.5px] text-gray-500">
              Table {data.table.name}
              {data.table.floor ? ` · ${data.table.floor}` : ""}
              {data.visit.name ? ` · ${data.visit.name}` : ""}
            </p>
          </div>
          <button type="button" onClick={onEnd} className="shrink-0 rounded-lg px-2 py-1 text-[12px] font-semibold text-gray-500 hover:bg-gray-100">
            Not you?
          </button>
        </div>
        <div role="tablist" className="mt-3 grid grid-cols-2 rounded-full bg-gray-100 p-1">
          {(
            [
              ["menu", "Menu", null],
              ["orders", "My order", openOrders || null],
            ] as const
          ).map(([id, label, badge]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex h-9 items-center justify-center gap-1.5 rounded-full text-[13.5px] font-semibold transition",
                tab === id ? "bg-teal text-white shadow-sm" : "text-gray-600",
              )}
            >
              {label}
              {badge ? (
                <span className={cn("rounded-full px-1.5 text-[11px] leading-[18px]", tab === id ? "bg-white/25" : "bg-white text-gray-700")}>{badge}</span>
              ) : null}
            </button>
          ))}
        </div>
      </header>

      {!data.visit.open && (
        <div className="mx-4 mt-4 rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-[15px] font-semibold">Thanks for dining with us</p>
          <p className="mt-1 text-[13px] text-gray-500">This visit is closed. Scan the table&apos;s code again to start a new one.</p>
          <button type="button" onClick={onEnd} className="mt-3 h-10 rounded-xl bg-teal px-4 text-[13px] font-semibold text-white">
            Start a new visit
          </button>
        </div>
      )}

      {tab === "menu" ? (
        <MenuView sections={menu.data} loading={menu.isPending} error={menu.isError} cart={cart} onAdd={add} onRemove={remove} canOrder={data.visit.open} />
      ) : (
        <OrdersView data={data} token={token} onChanged={refresh} onBrowse={() => setTab("menu")} />
      )}

      {count > 0 && data.visit.open && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex h-14 w-full items-center rounded-2xl bg-[#0B3B36] px-3 text-white shadow-[0_12px_30px_-10px_rgba(11,59,54,0.6)]"
          >
            <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-white/15 px-2 text-[14px] font-bold">{count}</span>
            <span className="ml-3 flex-1 text-left text-[15px] font-semibold">View order</span>
            <span className="text-[15px] font-bold">{formatKes(total)}</span>
            <ChevronRight className="ml-1 h-4 w-4 opacity-70" />
          </button>
        </div>
      )}

      {cartOpen && (
        <CartSheet
          lines={lines}
          total={total}
          tableName={data.table.name}
          busy={order.isPending}
          onClose={() => setCartOpen(false)}
          onAdd={add}
          onRemove={remove}
          onNote={(id, note) => setCart((c) => (c[id] ? { ...c, [id]: { ...c[id], note } } : c))}
          onSubmit={() => order.mutate()}
        />
      )}
    </div>
  );
}

function MenuView({
  sections,
  loading,
  error,
  cart,
  onAdd,
  onRemove,
  canOrder,
}: {
  sections?: { key: string; label: string; items: DineItem[] }[];
  loading: boolean;
  error: boolean;
  cart: Record<string, Line>;
  onAdd: (item: DineItem) => void;
  onRemove: (id: string) => void;
  canOrder: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const filled = useMemo(() => (sections ?? []).filter((s) => s.items.length > 0), [sections]);
  const needle = query.trim().toLowerCase();
  const shown = filled
    .filter((s) => !category || s.key === category)
    .map((s) => ({
      ...s,
      items: needle ? s.items.filter((i) => `${i.name} ${i.description ?? ""} ${(i.tags ?? []).join(" ")}`.toLowerCase().includes(needle)) : s.items,
    }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="px-4 pt-4">
      <div className="flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the menu"
          className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-gray-400"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {filled.length > 1 && (
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {[{ key: null as string | null, label: "All" }, ...filled.map((s) => ({ key: s.key as string | null, label: s.label }))].map((c) => (
            <button
              key={c.key ?? "all"}
              type="button"
              aria-pressed={category === c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition",
                category === c.key ? "bg-[#0B3B36] text-white" : "border border-gray-200 bg-white text-gray-600",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200/70" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-10 text-center text-sm text-gray-500">The menu could not be loaded. Pull down to refresh.</p>
      ) : shown.length === 0 ? (
        <div className="mt-14 text-center">
          <UtensilsCrossed className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-semibold">{filled.length ? "No dishes match" : "The menu is not ready yet"}</p>
          <p className="mt-1 text-[13px] text-gray-500">{filled.length ? "Try another word or category." : "Ask a member of staff to take your order."}</p>
        </div>
      ) : (
        shown.map((section) => (
          <section key={section.key} className="mt-5">
            <h2 className="mb-2.5 text-[15px] font-semibold">{section.label}</h2>
            <div className="space-y-2.5">
              {section.items.map((item) => {
                const qty = cart[item._id]?.quantity ?? 0;
                return (
                  <div key={item._id} className="flex gap-3 rounded-2xl border border-gray-200/80 bg-white p-2.5">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <UtensilsCrossed className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="text-[14.5px] font-semibold leading-snug">{item.name}</p>
                      {item.description && <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-gray-500">{item.description}</p>}
                      <div className="mt-auto flex items-center justify-between pt-1.5">
                        <span className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-teal-deep">{formatKes(item.cost)}</span>
                          {item.prepTime ? (
                            <span className="flex items-center gap-1 text-[11.5px] text-gray-400">
                              <Clock className="h-3 w-3" /> {item.prepTime} min
                            </span>
                          ) : null}
                        </span>
                        {canOrder &&
                          (qty > 0 ? (
                            <span className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label={`One less ${item.name}`}
                                onClick={() => onRemove(item._id)}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-4 text-center text-[14px] font-semibold tabular-nums">{qty}</span>
                              <button
                                type="button"
                                aria-label={`One more ${item.name}`}
                                onClick={() => onAdd(item)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-white"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              aria-label={`Add ${item.name}`}
                              onClick={() => onAdd(item)}
                              className="flex h-8 items-center gap-1 rounded-full bg-teal/10 px-3 text-[13px] font-semibold text-teal-deep"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function CartSheet({
  lines,
  total,
  tableName,
  busy,
  onClose,
  onAdd,
  onRemove,
  onNote,
  onSubmit,
}: {
  lines: Line[];
  total: number;
  tableName: string;
  busy: boolean;
  onClose: () => void;
  onAdd: (item: DineItem) => void;
  onRemove: (id: string) => void;
  onNote: (id: string, note: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal aria-label="Your order">
      <button type="button" aria-label="Close" onClick={busy ? undefined : onClose} className="absolute inset-0 bg-black/45" />
      <div className="relative max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-gray-200" />
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[17px] font-semibold">Your order</p>
            <p className="text-[12.5px] text-gray-500">Table {tableName}</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} disabled={busy} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-gray-100">
          {lines.map((line) => (
            <div key={line.item._id} className="py-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{line.item.name}</p>
                  <p className="text-[12.5px] text-gray-500">{formatKes(line.item.cost * line.quantity)}</p>
                </div>
                <span className="flex items-center gap-2">
                  <button type="button" aria-label="One less" onClick={() => onRemove(line.item._id)} className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-4 text-center text-[14px] font-semibold tabular-nums">{line.quantity}</span>
                  <button type="button" aria-label="One more" onClick={() => onAdd(line.item)} className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-white">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
              <input
                value={line.note}
                onChange={(e) => onNote(line.item._id, e.target.value.slice(0, 140))}
                placeholder="Add a note (no onions, extra spicy…)"
                className="mt-2 h-9 w-full rounded-lg bg-gray-50 px-3 text-[13px] outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-teal/15"
              />
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-baseline justify-between border-t border-gray-100 pt-4">
          <span className="text-[14px] text-gray-500">Total</span>
          <span className="text-[20px] font-bold">{formatKes(total)}</span>
        </div>
        <p className="mt-1 text-[12px] text-gray-500">You pay at the table when you are done.</p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || lines.length === 0}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal text-[15px] font-semibold text-white transition hover:bg-teal-deep disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {busy ? "Sending to the kitchen…" : "Place order"}
        </button>
      </div>
    </div>
  );
}

const STEPS = [
  { key: "placed", label: "Received", icon: ReceiptText },
  { key: "served", label: "Served", icon: ChefHat },
  { key: "ready_to_pay", label: "Bill", icon: CreditCard },
  { key: "completed", label: "Paid", icon: CheckCheck },
] as const;

const METHOD_LOOK: Record<string, { label: string; icon: typeof Banknote }> = {
  mpesa: { label: "M-Pesa", icon: Smartphone },
  card: { label: "Card", icon: CreditCard },
  cash: { label: "Cash", icon: Banknote },
  airtel_money: { label: "Airtel Money", icon: Smartphone },
};

function OrdersView({ data, token, onChanged, onBrowse }: { data: DineVisit; token: string; onChanged: () => void; onBrowse: () => void }) {
  const [paying, setPaying] = useState<DineOrder | null>(null);
  const accepted = Array.from(new Set(data.restaurant.paymentMethods.map(paymentKey))).filter((m) => METHOD_LOOK[m]);
  const methods = accepted.length ? accepted : Object.keys(METHOD_LOOK);

  const cancel = useMutation({
    mutationFn: (orderId: string) => cancelOrder(token, orderId),
    onSuccess: () => {
      toast.success("Order cancelled");
      onChanged();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not cancel."),
  });

  if (data.orders.length === 0) {
    return (
      <div className="px-8 pt-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
          <ShoppingBag className="h-7 w-7 text-teal" />
        </div>
        <p className="mt-4 text-[15px] font-semibold">Nothing ordered yet</p>
        <p className="mt-1 text-[13px] text-gray-500">Pick something from the menu and follow it here from kitchen to table.</p>
        <button type="button" onClick={onBrowse} className="mt-5 h-11 rounded-xl bg-teal px-5 text-sm font-semibold text-white">
          Browse the menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pt-4">
      {data.orders.map((o) => {
        const s = STATUS[o.status] ?? STATUS.placed;
        const reached = o.status === "cancelled" ? -1 : STEPS.findIndex((step) => step.key === o.status);
        return (
          <article key={o._id} className="rounded-2xl bg-white p-4 shadow-[0_6px_20px_-12px_rgba(15,31,29,0.25)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14.5px] font-semibold">Order {o.orderId || `#${o._id.slice(-6).toUpperCase()}`}</p>
                <p className="text-[12px] text-gray-500">
                  {formatTime(o.createdAt)}
                  {o.waiter ? ` · Served by ${o.waiter}` : ""}
                </p>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold", s.tone)}>{s.label}</span>
            </div>

            {reached >= 0 && (
              <div className="mt-4 flex items-center" aria-label={`Step ${reached + 1} of ${STEPS.length}: ${STEPS[reached].label}`}>
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const on = i <= reached;
                  return (
                    <div key={step.key} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center">
                        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", on ? "bg-teal text-white" : "bg-gray-100 text-gray-400")}>
                          {i < reached ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </span>
                        <span className={cn("mt-1 text-[10.5px] font-semibold", on ? "text-gray-800" : "text-gray-400")}>{step.label}</span>
                      </div>
                      {i < STEPS.length - 1 && <span className={cn("mx-1 mb-4 h-0.5 flex-1 rounded", i < reached ? "bg-teal" : "bg-gray-200")} />}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-[12.5px] text-gray-600">{s.hint}</p>

            <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
              {o.items.map((item, idx) => (
                <div key={`${item._id}-${idx}`} className="text-[13.5px]">
                  <div className="flex gap-2">
                    <span className="w-6 font-semibold text-teal-deep">{item.quantity}×</span>
                    <span className="flex-1">{item.name}</span>
                    <span className="tabular-nums text-gray-700">{formatKes(item.cost * (item.quantity ?? 1))}</span>
                  </div>
                  {item.note && <p className="ml-8 text-[12px] text-gray-500">{item.note}</p>}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-[13px] text-gray-500">
                {o.paymentStatus === "paid"
                  ? `Paid${o.paymentMethod ? ` · ${METHOD_LOOK[o.paymentMethod]?.label ?? o.paymentMethod}` : ""}`
                  : o.paymentMethod
                    ? `Paying by ${METHOD_LOOK[o.paymentMethod]?.label ?? o.paymentMethod}`
                    : "Total"}
              </span>
              <span className="text-[17px] font-bold">{formatKes(o.totalAmount)}</span>
            </div>

            {o.status === "served" && (
              <button
                type="button"
                onClick={() => setPaying(o)}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal text-[14px] font-semibold text-white"
              >
                <CreditCard className="h-4 w-4" /> Ask for the bill
              </button>
            )}
            {o.status === "placed" && (
              <button
                type="button"
                disabled={cancel.isPending}
                onClick={() => {
                  if (window.confirm("Cancel this order? You can only cancel before it is served.")) cancel.mutate(o._id);
                }}
                className="mt-3 h-10 w-full rounded-xl bg-rose-50 text-[13.5px] font-semibold text-rose-600 disabled:opacity-50"
              >
                Cancel order
              </button>
            )}
          </article>
        );
      })}

      {paying && (
        <BillSheet
          order={paying}
          methods={methods}
          token={token}
          onClose={() => setPaying(null)}
          onDone={() => {
            setPaying(null);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function BillSheet({ order, methods, token, onClose, onDone }: { order: DineOrder; methods: string[]; token: string; onClose: () => void; onDone: () => void }) {
  const [method, setMethod] = useState<string | null>(null);
  const bill = useMutation({
    mutationFn: () => requestBill(token, order._id, method!),
    onSuccess: () => {
      toast.success("Bill requested. Your waiter is on the way.");
      onDone();
    },
  });

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal aria-label="How would you like to pay?">
      <button type="button" aria-label="Close" onClick={bill.isPending ? undefined : onClose} className="absolute inset-0 bg-black/45" />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-gray-200" />
        <div className="mt-3 flex items-start justify-between">
          <div>
            <p className="text-[17px] font-semibold">How would you like to pay?</p>
            <p className="text-[12.5px] text-gray-500">{formatKes(order.totalAmount)} · you pay your waiter at the table</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {methods.map((m) => {
            const look = METHOD_LOOK[m];
            const Icon = look.icon;
            const on = method === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setMethod(m)}
                className={cn(
                  "flex h-14 w-full items-center gap-3 rounded-xl border-2 px-3.5 text-left transition",
                  on ? "border-teal bg-teal/5" : "border-gray-100 bg-white",
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <Icon className="h-4 w-4 text-gray-700" />
                </span>
                <span className="flex-1 text-[14.5px] font-semibold">{look.label}</span>
                <span className={cn("h-5 w-5 rounded-full border-2", on ? "border-teal bg-teal shadow-[inset_0_0_0_3px_white]" : "border-gray-300")} />
              </button>
            );
          })}
        </div>
        {bill.isError && <p className="mt-3 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700">{(bill.error as Error).message}</p>}
        <button
          type="button"
          disabled={!method || bill.isPending}
          onClick={() => bill.mutate()}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal text-[15px] font-semibold text-white disabled:opacity-50"
        >
          {bill.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {method ? "Request the bill" : "Choose how to pay"}
        </button>
      </div>
    </div>
  );
}
