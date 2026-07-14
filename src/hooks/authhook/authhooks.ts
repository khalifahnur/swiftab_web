import { useMutation, UseMutationResult } from "@tanstack/react-query";
import {
  AuthData,
  AuthResponse,
  Authwaiter,
  AuthWaiterResponse,
  ErrorResponse,
} from "@/types/auth";
import { loginAdmin, signUpAdmin, signUpWaiter } from "@/lib/api";
import apiClient from "@/lib/axios";
import { useAuth } from "@/components/auth/AuthContext";
import toast from "react-hot-toast";

export function useLogin(): UseMutationResult<
  AuthResponse,
  ErrorResponse,
  AuthData
> {
  const { refreshUser } = useAuth();

  return useMutation<AuthResponse, ErrorResponse, AuthData>({
    mutationFn: loginAdmin,
    onSuccess: async () => {
      setTimeout(() => {
        refreshUser();
      }, 1000);
    },
    onError: (error: ErrorResponse) => {
     toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    },
  });
}

export function useSignUp(): UseMutationResult<
  AuthResponse,
  ErrorResponse,
  AuthData
> {
  return useMutation<AuthResponse, ErrorResponse, AuthData>({
    mutationFn: signUpAdmin,
    onError: (error: ErrorResponse) => {
      toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    },
  });
}

export const fetchLogout = async (): Promise<void> => {
  const response = await apiClient.post("/auth/admin/logout");

  if (!response || response.status !== 200) {
    throw new Error("Logout failed");
  }
};

export function useWaiterSignUp(): UseMutationResult<
  AuthWaiterResponse,
  ErrorResponse,
  Authwaiter
> {
  return useMutation<AuthWaiterResponse, ErrorResponse, Authwaiter>({
    mutationFn: signUpWaiter,
    onSuccess: (data:AuthWaiterResponse) => {
      toast.success(data.message);
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    },
  });
}
