import { AddRestaurant } from "@/lib/api";
import {
  ErrorResponse,
  RestaurantResponse,
} from "@/types/restaurant";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useAddRestaurant(): UseMutationResult<
  RestaurantResponse,
  ErrorResponse,
  FormData
> {
  return useMutation<RestaurantResponse, ErrorResponse, FormData>({
    mutationFn: (formData: FormData) => {
      return AddRestaurant(formData);
    },
    onSuccess: (data: RestaurantResponse) => {
     toast.success(data.message);
      if (data) {
        localStorage.setItem("RestaurantData", JSON.stringify(data));
      }
    },
    onError: (error: ErrorResponse) => {
       toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    },
  });
}
