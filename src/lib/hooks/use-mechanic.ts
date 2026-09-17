import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type {
  ApiMasterProfile,
  ApiMasterService,
  ApiReview,
  ApiWorkingHour,
} from "@/lib/api-types";

/* ---------------------------- Workshop profile --------------------------- */

const profileKey = ["master", "profile"] as const;

export function useMasterProfile() {
  return useQuery({
    queryKey: profileKey,
    queryFn: () => api.get<ApiMasterProfile>("/master/profile"),
  });
}

export interface UpdateMasterProfileInput {
  workshopName?: string;
  about?: string;
  cover?: string;
  logo?: string;
  address?: string;
  district?: string;
  city?: string;
  lat?: number;
  lng?: number;
  experienceYears?: number;
  isOpen?: boolean;
}

export function useUpdateMasterProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMasterProfileInput) =>
      api.patch<ApiMasterProfile>("/master/profile", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey }),
  });
}

/* ------------------------------ Own services ------------------------------ */

const servicesKey = ["master", "services"] as const;

export function useMasterServicesMine() {
  return useQuery({
    queryKey: servicesKey,
    queryFn: () => api.get<ApiMasterService[]>("/master/services"),
  });
}

export interface CreateMasterServiceInput {
  serviceId: number;
  price?: number;
  duration?: string;
  active?: boolean;
}

export function useCreateMasterService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMasterServiceInput) =>
      api.post<ApiMasterService>("/master/services", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: servicesKey }),
  });
}

export function useUpdateMasterService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: Partial<Omit<CreateMasterServiceInput, "serviceId">> & { id: number }) =>
      api.patch<ApiMasterService>(`/master/services/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: servicesKey }),
  });
}

export function useDeleteMasterService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/master/services/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: servicesKey }),
  });
}

/* ----------------------------- Working hours ------------------------------ */

const hoursKey = ["master", "working-hours"] as const;

export function useMasterWorkingHours() {
  return useQuery({
    queryKey: hoursKey,
    queryFn: () => api.get<ApiWorkingHour[]>("/master/working-hours"),
  });
}

export function useUpdateMasterWorkingHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hours: ApiWorkingHour[]) =>
      api.put<ApiWorkingHour[]>("/master/working-hours", { hours }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hoursKey }),
  });
}

/* -------------------------------- Reviews ---------------------------------- */

export function useMasterReviewsMine() {
  return useQuery({
    queryKey: ["master", "reviews"],
    queryFn: () => api.get<ApiReview[]>("/master/reviews"),
  });
}
