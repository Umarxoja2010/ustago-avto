import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { ApiReview } from "@/lib/api-types";

export interface CreateReviewInput {
  bookingId: number;
  rating: number;
  comment?: string;
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => api.post<ApiReview>("/reviews", input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["masters"] });
    },
  });
}
