import { editMenuItem } from "@/lib/api";
import { EditResponse, ErrorResponse, MenuItem } from "@/types/editmenu";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface EditMutationVariables {
    updatedItem: MenuItem;
    menuType: string;
  }

export function useEditMenuItem(): UseMutationResult<
  EditResponse,
  ErrorResponse,
  EditMutationVariables
> {
   const queryClient = useQueryClient();
  return useMutation<EditResponse, ErrorResponse, EditMutationVariables>({
    mutationFn: ({ updatedItem, menuType }) =>
      editMenuItem(updatedItem, menuType),
    onSuccess: (data: EditResponse) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
    onError: (error: ErrorResponse) => {
       toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    },
  });
}