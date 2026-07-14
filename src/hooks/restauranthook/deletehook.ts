import { deleteMenu } from "@/lib/api";
import { DeleteResponse, ErrorResponse } from "@/types/deletemenu";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface DeleteMenu {
  menuType: string;
  itemId: string;
}

export function useDeleteMenu(): UseMutationResult<
  DeleteResponse,
  ErrorResponse,
  DeleteMenu
> {
  return useMutation<DeleteResponse, ErrorResponse, DeleteMenu>({
    mutationFn: ({ menuType, itemId }) => {
      return deleteMenu(menuType, itemId);
    },
    onSuccess: (data: DeleteResponse) => {
      toast.success(data.message);
    },
    onError: (error: ErrorResponse) => {
       toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    },
  });
}
