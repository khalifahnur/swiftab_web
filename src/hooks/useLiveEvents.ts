"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/axios";
import { keys } from "./queries";
import type { LiveEvent } from "@/types/api";

/**
 * Listens to the restaurant's live event stream and refreshes whatever the
 * event touched, so new orders and bookings appear without a reload.
 *
 * The stream is an enhancement: the same queries also poll, so the dashboard
 * stays correct when the stream is unavailable. Returns whether it is
 * currently connected.
 */
export function useLiveEvents(enabled: boolean): boolean {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  // Announce each order once, even if the stream replays after a reconnect.
  const announced = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || !API_BASE_URL || typeof EventSource === "undefined") return;

    const source = new EventSource(`${API_BASE_URL}/admin/events`, { withCredentials: true });

    const refresh = (...queryKeys: (typeof keys)[keyof typeof keys][]) =>
      queryKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));

    const parse = (raw: MessageEvent): LiveEvent | null => {
      try {
        return JSON.parse(raw.data) as LiveEvent;
      } catch {
        return null;
      }
    };

    const onOrder = (raw: MessageEvent) => {
      refresh(keys.orders, keys.dashboard, keys.liveFloor);
      const event = parse(raw);
      if (!event?.id) return;
      const tag = `${event.id}:${event.action}:${event.status}`;
      if (announced.current.has(tag)) return;
      announced.current.add(tag);

      if (event.action === "created") {
        toast(`New order · Table ${event.table}`, { icon: "🧾" });
      } else if (event.status === "ready_to_pay") {
        toast(`Table ${event.table} asked for the bill`, { icon: "💳" });
      }
    };

    const onReservation = (raw: MessageEvent) => {
      refresh(keys.reservations, keys.dashboard, keys.liveFloor);
      const event = parse(raw);
      if (event?.action === "created" && event.id && !announced.current.has(event.id)) {
        announced.current.add(event.id);
        toast(`New reservation · Table ${event.table}`, { icon: "📅" });
      }
    };

    source.addEventListener("ready", () => setConnected(true));
    source.addEventListener("order", onOrder as EventListener);
    source.addEventListener("reservation", onReservation as EventListener);
    // EventSource reconnects by itself; this only reflects the gap in the UI.
    source.onerror = () => setConnected(false);

    return () => {
      source.close();
      setConnected(false);
    };
  }, [enabled, queryClient]);

  return connected;
}
