import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { ApiMasterProfile } from "@/lib/api-types";

const key = ["favorites"] as const;

export function useFavorites() {
  return useQuery({
    queryKey: key,
    queryFn: () => api.get<ApiMasterProfile[]>("/favorites"),
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (masterId: number) => api.post(`/masters/${masterId}/favorite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (masterId: number) => api.delete(`/masters/${masterId}/favorite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
