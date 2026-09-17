import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type Paginated } from "@/lib/api-client";
import type {
  AdminMaster,
  AdminReportOverview,
  AdminRevenuePoint,
  AdminSignupPoint,
  AdminTopService,
  AdminUser,
} from "@/lib/api-admin-types";
import type { ApiBooking, ApiNotification, ApiReview, ApiService } from "@/lib/api-types";

/* ---------------------------------- Users ---------------------------------- */

export interface AdminUserFilters {
  role?: string;
  status?: string;
  q?: string;
  perPage?: number;
  page?: number;
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => api.get<Paginated<AdminUser>>("/admin/users", { ...filters }),
  });
}

export function useUpdateAdminUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: "active" | "suspended" }) =>
      api.patch<AdminUser>(`/admin/users/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

/* --------------------------------- Masters ---------------------------------- */

export interface AdminMasterFilters {
  verificationStatus?: string;
  q?: string;
  perPage?: number;
  page?: number;
}

export function useAdminMasters(filters: AdminMasterFilters = {}) {
  return useQuery({
    queryKey: ["admin", "masters", filters],
    queryFn: () => api.get<Paginated<AdminMaster>>("/admin/masters", { ...filters }),
  });
}

export function useUpdateAdminMasterVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      verificationStatus,
    }: {
      id: number;
      verificationStatus: AdminMaster["verificationStatus"];
    }) => api.patch<AdminMaster>(`/admin/masters/${id}/verification`, { verificationStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "masters"] }),
  });
}

/* --------------------------------- Bookings --------------------------------- */

export interface AdminBookingFilters {
  status?: string;
  masterProfileId?: number;
  userId?: number;
  perPage?: number;
  page?: number;
}

export function useAdminBookings(filters: AdminBookingFilters = {}) {
  return useQuery({
    queryKey: ["admin", "bookings", filters],
    queryFn: () => api.get<Paginated<ApiBooking>>("/admin/bookings", { ...filters }),
  });
}

/** Admin override — not gated by the normal transition-legality rules the customer/mechanic endpoint uses. */
export function useUpdateAdminBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApiBooking["status"] }) =>
      api.patch<ApiBooking>(`/admin/bookings/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] }),
  });
}

/* --------------------------------- Reviews ---------------------------------- */

export interface AdminReviewFilters {
  masterProfileId?: number;
  hidden?: boolean;
  perPage?: number;
  page?: number;
}

export function useAdminReviews(filters: AdminReviewFilters = {}) {
  return useQuery({
    queryKey: ["admin", "reviews", filters],
    queryFn: () => api.get<Paginated<ApiReview>>("/admin/reviews", { ...filters }),
  });
}

export function useToggleAdminReviewHidden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.patch<ApiReview>(`/admin/reviews/${id}/hide`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
}

/* --------------------------------- Services (catalog) ------------------------ */

export function useAdminServices() {
  return useQuery({
    queryKey: ["admin", "services"],
    queryFn: () => api.get<ApiService[]>("/admin/services"),
  });
}

export function useCreateAdminService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; icon?: string; color?: string }) =>
      api.post<ApiService>("/admin/services", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "services"] }),
  });
}

export function useUpdateAdminService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number; name?: string; icon?: string; color?: string }) =>
      api.patch<ApiService>(`/admin/services/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "services"] }),
  });
}

export function useDeleteAdminService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/services/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "services"] }),
  });
}

/* ------------------------------- Notifications -------------------------------- */

export function useAdminNotifications(perPage = 20) {
  return useQuery({
    queryKey: ["admin", "notifications", perPage],
    queryFn: () => api.get<Paginated<ApiNotification>>("/admin/notifications", { perPage }),
  });
}

export function useSendAdminBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      body: string;
      audience: "all" | "customers" | "mechanics";
      kind?: string;
    }) => api.post("/admin/notifications/broadcast", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });
}

/* ---------------------------------- Reports ----------------------------------- */

export function useAdminReportOverview() {
  return useQuery({
    queryKey: ["admin", "reports", "overview"],
    queryFn: () => api.get<AdminReportOverview>("/admin/reports/overview"),
  });
}

export function useAdminSignupsReport(days = 30) {
  return useQuery({
    queryKey: ["admin", "reports", "signups", days],
    queryFn: () => api.get<AdminSignupPoint[]>("/admin/reports/signups", { days }),
  });
}

export function useAdminRevenueReport(days = 30) {
  return useQuery({
    queryKey: ["admin", "reports", "revenue", days],
    queryFn: () => api.get<AdminRevenuePoint[]>("/admin/reports/revenue", { days }),
  });
}

export function useAdminTopServices(limit = 5) {
  return useQuery({
    queryKey: ["admin", "reports", "top-services", limit],
    queryFn: () => api.get<AdminTopService[]>("/admin/reports/top-services", { limit }),
  });
}
