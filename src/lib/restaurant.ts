import type { OpeningHour } from "@/types/api";

export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export const CUISINE_OPTIONS = [
  "Swahili", "Kenyan", "Nyama Choma", "Indian", "Italian", "Chinese", "Ethiopian", "Seafood",
  "Grill", "Café", "Fast food", "Vegetarian", "Bakery", "Continental",
];

export const AMENITY_OPTIONS = [
  "Wi-Fi", "Parking", "Outdoor seating", "Wheelchair access", "Kids friendly", "Live music",
  "Private dining", "Bar", "Air conditioning", "Halal", "Delivery", "Takeaway",
];

/** Labels as they are stored and shown to diners. */
export const PAYMENT_OPTIONS = ["M-Pesa", "Cash", "Card", "Airtel Money"];

/** A sensible starting week: open daily, a little later on weekends. */
export function defaultOpeningHours(): OpeningHour[] {
  return WEEK_DAYS.map((day, index) => ({ day, open: true, from: "08:00", to: index >= 4 ? "23:00" : "22:00" }));
}

/** Always seven days, Monday first, whatever the server returned. */
export function completeOpeningHours(hours?: OpeningHour[] | null): OpeningHour[] {
  if (!hours || hours.length === 0) return defaultOpeningHours();
  return WEEK_DAYS.map((day) => {
    const found = hours.find((h) => h.day?.toLowerCase() === day.toLowerCase());
    return found ? { ...found, day } : { day, open: false, from: "", to: "" };
  });
}

/** Explains what is wrong with a week of hours, or returns null when it is fine. */
export function openingHoursError(hours: OpeningHour[]): string | null {
  if (!hours.some((h) => h.open)) return "Mark at least one day as open.";
  for (const h of hours) {
    if (!h.open) continue;
    if (!h.from || !h.to) return `Add opening and closing times for ${h.day}.`;
    if (h.from === h.to) return `${h.day} opens and closes at the same time.`;
  }
  return null;
}

/** Whether the restaurant is open at `now` according to its weekly hours. */
export function isOpenNow(hours: OpeningHour[] | undefined, now = new Date()): boolean | null {
  if (!hours || hours.length === 0) return null;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (clock: string) => {
    const [h, m] = clock.split(":").map(Number);
    return h * 60 + m;
  };
  // getDay() is Sunday-first; the week here starts on Monday.
  const todayIndex = (now.getDay() + 6) % 7;
  const today = hours.find((h) => h.day === WEEK_DAYS[todayIndex]);
  const yesterday = hours.find((h) => h.day === WEEK_DAYS[(todayIndex + 6) % 7]);

  if (today?.open && today.from && today.to) {
    const from = toMinutes(today.from);
    const to = toMinutes(today.to);
    if (to > from ? minutesNow >= from && minutesNow < to : minutesNow >= from) return true;
  }
  // A late shift that started yesterday and runs past midnight.
  if (yesterday?.open && yesterday.from && yesterday.to) {
    const from = toMinutes(yesterday.from);
    const to = toMinutes(yesterday.to);
    if (to < from && minutesNow < to) return true;
  }
  return false;
}
