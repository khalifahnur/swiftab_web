"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchAdminInfo, logoutAdmin } from "@/lib/api";
import { keys } from "@/hooks/queries";
import type { AdminInfo } from "@/types/api";

interface AuthContextType {
  /** The signed-in admin, or null when there is no session. */
  user: AdminInfo | null;
  isLoading: boolean;
  /** True when the session check itself failed (for example, offline). */
  isError: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<AdminInfo | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: keys.admin,
    queryFn: fetchAdminInfo,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const refreshUser = useCallback(async () => {
    const result = await refetch();
    return result.data ?? null;
  }, [refetch]);

  const signOut = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      // The local session is cleared regardless, so the user is never stuck
      // signed in on this device.
    }
    queryClient.clear();
    queryClient.setQueryData(keys.admin, null);
    toast.success("Signed out");
    router.replace("/signin");
  }, [queryClient, router]);

  return (
    <AuthContext.Provider value={{ user: data ?? null, isLoading, isError, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
