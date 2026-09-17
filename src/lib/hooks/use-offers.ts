import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { ApiSpecialOffer } from "@/lib/api-types";

export interface OfferFormData {
  title: string;
  subtitle?: string | null;
  cta?: string | null;
  image: string;
  link?: string | null;
  badge?: string | null;
  accent?: string | null;
  is_active?: boolean;
  sort_order?: number;
  start_date?: string | null;
  end_date?: string | null;
}

/** Public hook: fetch active offers for customer homepage carousel */
export function useOffers() {
  return useQuery({
    queryKey: ["offers"],
    queryFn: () => api.get<ApiSpecialOffer[]>("/offers", { anonymous: true }),
    staleTime: 5 * 60 * 1000,
  });
}

/** Admin hook: fetch all offers (active and inactive) */
export function useAdminOffers() {
  return useQuery({
    queryKey: ["admin", "offers"],
    queryFn: () => api.get<ApiSpecialOffer[]>("/admin/offers"),
  });
}

/** Admin mutation: create new special offer */
export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OfferFormData) => api.post<ApiSpecialOffer>("/admin/offers", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "offers"] });
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

/** Admin mutation: update special offer */
export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<OfferFormData> }) =>
      api.put<ApiSpecialOffer>(`/admin/offers/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "offers"] });
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

/** Admin mutation: toggle active status */
export function useToggleOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.patch<ApiSpecialOffer>(`/admin/offers/${id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "offers"] });
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

/** Admin mutation: delete special offer */
export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<null>(`/admin/offers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "offers"] });
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
