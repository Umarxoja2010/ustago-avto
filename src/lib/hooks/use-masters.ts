import { useQuery } from "@tanstack/react-query";

import { api, type Paginated } from "@/lib/api-client";
import type { ApiMasterProfile, ApiReview, ApiService } from "@/lib/api-types";

/** Global catalog of service categories a mechanic can price and offer. */
export function useServiceCatalog() {
  return useQuery({
    queryKey: ["services", "catalog"],
    queryFn: () => api.get<ApiService[]>("/services", undefined, true),
    staleTime: 5 * 60 * 1000, // catalog changes rarely — avoid refetching on every mount
  });
}

export interface MasterSearchFilters {
  q?: string;
  city?: string;
  district?: string;
  service?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDistance?: number;
  lat?: number;
  lng?: number;
  sort?: "rating" | "price" | "name" | "nearest" | "distance";
  perPage?: number;
}

export function useMasters(filters: MasterSearchFilters = {}) {
  return useQuery({
    queryKey: ["masters", filters],
    queryFn: () => api.get<Paginated<ApiMasterProfile>>("/masters", { ...filters }, true),
  });
}

export function useMaster(id: number | string | undefined) {
  return useQuery({
    queryKey: ["masters", id],
    queryFn: () => api.get<ApiMasterProfile>(`/masters/${id}`, undefined, true),
    enabled: id !== undefined,
  });
}

export function useMasterReviews(id: number | string | undefined) {
  return useQuery({
    queryKey: ["masters", id, "reviews"],
    queryFn: () => api.get<Paginated<ApiReview>>(`/masters/${id}/reviews`, undefined, true),
    enabled: id !== undefined,
  });
}
