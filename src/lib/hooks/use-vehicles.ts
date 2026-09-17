import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { ApiVehicle } from "@/lib/api-types";

const key = ["vehicles"] as const;

export function useVehicles() {
  return useQuery({
    queryKey: key,
    queryFn: () => api.get<ApiVehicle[]>("/vehicles"),
  });
}

export type VehicleInput = Omit<ApiVehicle, "id">;

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleInput) => api.post<ApiVehicle>("/vehicles", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<VehicleInput> & { id: number }) =>
      api.patch<ApiVehicle>(`/vehicles/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/vehicles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
