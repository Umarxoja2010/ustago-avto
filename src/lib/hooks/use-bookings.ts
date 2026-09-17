import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type Paginated } from "@/lib/api-client";
import type { ApiBooking, ApiBookingStatus } from "@/lib/api-types";

const listKey = (status?: string) => ["bookings", { status: status ?? "all" }] as const;

/** Customer: own bookings. Mechanic: bookings against their own workshop. Scoped server-side. */
export function useBookings(status?: ApiBookingStatus) {
  return useQuery({
    queryKey: listKey(status),
    queryFn: () => api.get<Paginated<ApiBooking>>("/bookings", status ? { status } : undefined),
  });
}

export function useBooking(id: number | string | undefined) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => api.get<ApiBooking>(`/bookings/${id}`),
    enabled: id !== undefined,
  });
}

export interface CreateBookingInput {
  masterServiceId: number;
  vehicleId?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => api.post<ApiBooking>("/bookings", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

/** Customer: only "cancelled" is allowed. Mechanic: "accepted" / "rejected" / "completed". */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApiBookingStatus }) =>
      api.patch<ApiBooking>(`/bookings/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

/** Customer-only, and only while the booking is still "pending". */
export function useRescheduleBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, time }: { id: number; date: string; time: string }) =>
      api.patch<ApiBooking>(`/bookings/${id}/reschedule`, { date, time }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
}
