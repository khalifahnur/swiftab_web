import { deleteWaiter } from "@/lib/api";
import { DeleteResponse, ErrorResponse } from "@/types/deletemenu";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface DeleteWaiter {
  waiterId: string;
}

export function useDeleteWaiter(): UseMutationResult<
  DeleteResponse,
  ErrorResponse,
  DeleteWaiter
> {
  const queryClient = useQueryClient();
  return useMutation<DeleteResponse, ErrorResponse, DeleteWaiter>({
    mutationFn: ({ waiterId }) => {
      return deleteWaiter(waiterId);
    },
    onSuccess: (data: DeleteResponse) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["waiters"] });
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    },
  });
}
