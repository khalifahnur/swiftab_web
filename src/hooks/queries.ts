"use client";

import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as api from "@/lib/api";
import { errorMessage } from "@/lib/axios";
import type { DashboardPeriod } from "@/types/api";

/** Cache keys, in one place so invalidation stays in step with the queries. */
export const keys = {
  admin: ["userInfo"] as QueryKey,
  dashboard: ["dashboard-stats"] as QueryKey,
  menu: ["menu"] as QueryKey,
  layout: ["layout"] as QueryKey,
  liveFloor: ["live-floor"] as QueryKey,
  orders: ["orders"] as QueryKey,
  reservations: ["reservations"] as QueryKey,
  waiters: ["waiters"] as QueryKey,
  promotions: ["promotions"] as QueryKey,
};

/**
 * How often live screens re-check the server. The event stream usually
 * updates them sooner; this covers a dropped stream.
 */
const LIVE_POLL_MS = 20_000;

// --- Queries -----------------------------------------------------------------

export function useDashboardStats(period: DashboardPeriod) {
  return useQuery({
    queryKey: [...keys.dashboard, period],
    queryFn: () => api.fetchDashboardStats(period),
    refetchInterval: 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useMenu() {
  return useQuery({ queryKey: keys.menu, queryFn: api.fetchMenu });
}

export function useLayout() {
  return useQuery({ queryKey: keys.layout, queryFn: api.fetchLayout, refetchOnWindowFocus: false });
}

export function useLiveFloor(enabled = true) {
  return useQuery({ queryKey: keys.liveFloor, queryFn: api.fetchLiveFloor, enabled, refetchInterval: LIVE_POLL_MS });
}

export function useOrders() {
  return useQuery({ queryKey: keys.orders, queryFn: api.fetchOrders, refetchInterval: LIVE_POLL_MS });
}

export function useReservations() {
  return useQuery({ queryKey: keys.reservations, queryFn: api.fetchReservations, refetchInterval: 60_000 });
}

export function useWaiters() {
  return useQuery({ queryKey: keys.waiters, queryFn: api.fetchWaiters });
}

export function usePromotions() {
  return useQuery({ queryKey: keys.promotions, queryFn: api.fetchPromotions });
}

// --- Mutations ---------------------------------------------------------------

/**
 * Wraps a write so that it always tells the user how it went and refreshes
 * the data it changed.
 */
function useWrite<TInput, TResult>(
  fn: (input: TInput) => Promise<TResult>,
  options: { invalidate: QueryKey[]; success?: string | false; failure: string },
) {
  const queryClient = useQueryClient();
  return useMutation<TResult, unknown, TInput>({
    mutationFn: fn,
    onSuccess: (result) => {
      options.invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      if (options.success === false) return;
      // Prefer the server's own wording when it sent one.
      const fromServer = (result as { message?: string } | null | undefined)?.message;
      toast.success(options.success ?? fromServer ?? "Saved");
    },
    onError: (error) => {
      toast.error(errorMessage(error, options.failure));
    },
  });
}

// Account
export const useUpdateProfile = () =>
  useWrite(api.updateProfile, { invalidate: [keys.admin], failure: "Could not update your profile." });

export const useChangePassword = () =>
  useWrite(api.changePassword, { invalidate: [], failure: "Could not change your password." });

// Restaurant
export const useUpdateRestaurant = () =>
  useWrite(
    (input: Parameters<typeof api.updateRestaurant>) => api.updateRestaurant(...input),
    { invalidate: [keys.admin], failure: "Could not save your restaurant settings." },
  );

// Menu
export const useAddCategory = () =>
  useWrite(api.addCategory, { invalidate: [keys.menu], failure: "Could not add the category." });

export const useRenameCategory = () =>
  useWrite(({ key, label }: { key: string; label: string }) => api.renameCategory(key, label), {
    invalidate: [keys.menu],
    failure: "Could not rename the category.",
  });

export const useReorderCategories = () =>
  useWrite(api.reorderCategories, { invalidate: [keys.menu], success: false, failure: "Could not reorder the categories." });

export const useDeleteCategory = () =>
  useWrite(({ key, force }: { key: string; force?: boolean }) => api.deleteCategory(key, force), {
    invalidate: [keys.menu],
    failure: "Could not delete the category.",
  });

export const useAddMenuItem = () =>
  useWrite(({ category, input }: { category: string; input: Parameters<typeof api.addMenuItem>[1] }) => api.addMenuItem(category, input), {
    invalidate: [keys.menu],
    success: "Dish added to the menu",
    failure: "Could not add the dish.",
  });

export const useUpdateMenuItem = () =>
  useWrite(
    ({ category, itemId, input }: { category: string; itemId: string; input: Parameters<typeof api.updateMenuItem>[2] }) =>
      api.updateMenuItem(category, itemId, input),
    { invalidate: [keys.menu], success: "Dish updated", failure: "Could not update the dish." },
  );

export const useSetAvailability = () =>
  useWrite(
    ({ category, itemId, available }: { category: string; itemId: string; available: boolean }) =>
      api.setMenuItemAvailability(category, itemId, available),
    { invalidate: [keys.menu], success: false, failure: "Could not change availability." },
  );

export const useDeleteMenuItem = () =>
  useWrite(({ category, itemId }: { category: string; itemId: string }) => api.deleteMenuItem(category, itemId), {
    invalidate: [keys.menu],
    success: "Dish removed from the menu",
    failure: "Could not delete the dish.",
  });

// Floor plan
export const useSaveLayout = () =>
  useWrite(api.saveLayout, {
    // The editor keeps its own copy of the plan, so only the views derived
    // from it need refreshing.
    invalidate: [keys.liveFloor, keys.dashboard],
    success: "Floor plan saved",
    failure: "Could not save the floor plan.",
  });

// Orders
export const useUpdateOrder = () =>
  useWrite(
    ({ orderId, change }: { orderId: string; change: Parameters<typeof api.updateOrder>[1] }) => api.updateOrder(orderId, change),
    { invalidate: [keys.orders, keys.dashboard, keys.liveFloor], failure: "Could not update the order." },
  );

// Reservations
export const useUpdateReservation = () =>
  useWrite(
    ({ id, status }: { id: string; status: Parameters<typeof api.updateReservationStatus>[1] }) => api.updateReservationStatus(id, status),
    { invalidate: [keys.reservations, keys.dashboard, keys.liveFloor], failure: "Could not update the reservation." },
  );

// Staff
export const useAddWaiter = () =>
  useWrite(api.addWaiter, { invalidate: [keys.waiters], failure: "Could not add the waiter." });

export const useResendInvite = () =>
  useWrite(({ waiterId, reset }: { waiterId: string; reset?: boolean }) => api.resendWaiterInvite(waiterId, reset), {
    invalidate: [keys.waiters],
    failure: "Could not create a new invite code.",
  });

export const useDeleteWaiter = () =>
  useWrite(api.deleteWaiter, { invalidate: [keys.waiters], success: "Waiter removed", failure: "Could not remove the waiter." });

// Promotions
export const useCreatePromotion = () =>
  useWrite(api.createPromotion, { invalidate: [keys.promotions], failure: "Could not create the promotion." });

export const useUpdatePromotion = () =>
  useWrite(({ id, input }: { id: string; input: Parameters<typeof api.updatePromotion>[1] }) => api.updatePromotion(id, input), {
    invalidate: [keys.promotions],
    failure: "Could not update the promotion.",
  });

export const useDeletePromotion = () =>
  useWrite(api.deletePromotion, { invalidate: [keys.promotions], failure: "Could not delete the promotion." });
