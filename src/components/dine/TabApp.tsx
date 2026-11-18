"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarClock, Loader2, MapPin, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DineError, fetchTabPreview, joinTab } from "@/lib/dineApi";
import { formatTime } from "@/lib/format";
import { FullScreenLoader, Hero, Problem, readToken, Visit, writeToken } from "./DineApp";

/* ------------------------------------------------------------------------------
 * The page a shared tab link opens. The person who booked sent it; a friend
 * enters their name, then orders from the same menu. Their dishes go on the
 * host's bill, marked with their name.
 * --------------------------------------------------------------------------- */

const storageKey = (code: string) => `swiftab-tab:${code}`;

export default function TabApp({ code }: { code: string }) {
  const key = storageKey(code);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(readToken(key));
    setReady(true);
  }, [key]);

  const join = (next: string) => {
    writeToken(key, next);
    setToken(next);
  };
  const leave = () => {
    writeToken(key, null);
    setToken(null);
  };

  return (
    <div className="min-h-dvh bg-[#F4F7F6] font-sans text-[#0F1F1D]">
      <div className="mx-auto min-h-dvh max-w-md bg-[#F4F7F6] sm:border-x sm:border-gray-200">
        {!ready ? <FullScreenLoader /> : token ? <Visit token={token} onEnd={leave} /> : <Join code={code} onJoined={join} />}
      </div>
    </div>
  );
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function whenLabel(since: string, until: string) {
  const start = new Date(since);
  if (Number.isNaN(start.getTime())) return "";
  const day = sameDay(start, new Date())
    ? "Today"
    : start.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });
  return `${day} · ${formatTime(since)}${until ? ` – ${formatTime(until)}` : ""}`;
}

function Join({ code, onJoined }: { code: string; onJoined: (token: string) => void }) {
  const preview = useQuery({
    queryKey: ["tab-preview", code],
    queryFn: () => fetchTabPreview(code),
    retry: (count, error) => !(error instanceof DineError && error.status > 0 && error.status < 500) && count < 2,
  });
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const join = useMutation({
    mutationFn: () => joinTab(code, name.trim()),
    onSuccess: (data) => {
      toast.success(data.you?.role === "friend" ? `You're on ${data.you.host}'s tab` : "You're in");
      onJoined(data.token);
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not join the tab."),
  });

  if (preview.isPending) return <FullScreenLoader label="Opening the menu…" />;
  if (preview.isError) {
    const gone = preview.error instanceof DineError && preview.error.status === 404;
    return (
      <Problem
        title={gone ? "This link has expired" : "We could not open this link"}
        message={preview.error instanceof Error ? preview.error.message : "Please try again."}
        action={
          gone ? undefined : (
            <button type="button" onClick={() => preview.refetch()} className="h-11 rounded-xl bg-teal px-5 text-sm font-semibold text-white">
              Try again
            </button>
          )
        }
      />
    );
  }

  const p = preview.data;
  const canSubmit = name.trim().length > 1 && !join.isPending;
  const blocked = !p.canJoin ? `${p.host}'s booking has ended, so nothing more can be added to this tab.` : p.full ? `This tab is full. Ask ${p.host} to add your order.` : "";

  return (
    <div className="pb-10">
      <Hero image={p.restaurant.image} name={p.restaurant.name} eyebrow={`${p.host} invited you to`}>
        {p.restaurant.location && (
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/80">
            <MapPin className="h-3.5 w-3.5" /> {p.restaurant.location}
          </p>
        )}
      </Hero>

      <div className="relative -mt-8 px-4">
        <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_-12px_rgba(15,31,29,0.25)]">
          <div className="flex items-center gap-3">
            {p.restaurant.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.restaurant.logo} alt="" className="h-12 w-12 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal text-white">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">Order on {p.host}&apos;s tab</p>
              <p className="flex items-center gap-1.5 text-[13px] text-gray-500">
                <CalendarClock className="h-3.5 w-3.5" />
                <span className="truncate">
                  {whenLabel(p.since, p.until)}
                  {p.table ? ` · Table ${p.table}` : ""}
                </span>
              </p>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-teal/5 px-3.5 py-2.5 text-[13px] leading-relaxed text-teal-deep">
            Pick anything from the menu. It goes on {p.host}&apos;s bill with your name on it, so everyone knows who ordered what.
          </p>

          {blocked ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-amber-900">{blocked}</p>
          ) : (
            <form
              className="mt-5 space-y-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                if (canSubmit) join.mutate();
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-gray-700">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 40))}
                  autoComplete="name"
                  autoFocus
                  placeholder="e.g. Achieng"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-[15px] outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/15"
                />
                <span className="mt-1.5 block text-[12px] text-gray-500">Use the same name again to see your dishes on another phone.</span>
              </label>

              {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-rose-700">{error}</p>}

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal text-[15px] font-semibold text-white shadow-sm transition hover:bg-teal-deep disabled:opacity-50"
              >
                {join.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {join.isPending ? "Joining…" : `Join ${p.host}'s tab`}
              </button>
              {p.guests > 0 && (
                <p className="text-center text-[12px] text-gray-500">
                  {p.guests} {p.guests === 1 ? "friend has" : "friends have"} already joined
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
