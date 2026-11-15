import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { loginAdmin, signUpAdmin } from "@/lib/api";
import { errorMessage } from "@/lib/axios";
import { useAuth } from "@/components/auth/AuthContext";
import type { AuthData } from "@/types/auth";

/**
 * Signs in and loads the account before resolving, so the caller can
 * navigate straight to the dashboard.
 */
export function useLogin() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: async (data: AuthData) => {
      await loginAdmin(data);
      const user = await refreshUser();
      if (!user) {
        // The sign-in succeeded but the session cookie did not come back,
        // which happens when the browser blocks it.
        throw new Error("Signed in, but your browser did not keep the session. Allow cookies for this site and try again.");
      }
      return user;
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not sign in. Please try again."));
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: signUpAdmin,
    onError: (error) => {
      toast.error(errorMessage(error, "Could not create your account. Please try again."));
    },
  });
}
