import { addMenu } from "@/lib/api";
import { ErrorResponse, MenuResponse } from "@/types/addmenu";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface AddMenuVariables {
  data: FormData; 
  menuType: string;
}

export function useAddMenu(): UseMutationResult<
  MenuResponse,
  ErrorResponse,
  AddMenuVariables
> { 
  const queryClient = useQueryClient();
  return useMutation<MenuResponse, ErrorResponse, AddMenuVariables>({
    mutationFn: ({ data, menuType }: AddMenuVariables) => {
      return addMenu(data, menuType); 
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
    onError: (error) => {
     toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    },
  });
}
