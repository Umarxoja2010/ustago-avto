import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { ApiNotification } from "@/lib/api-types";

const key = ["notifications"] as const;

export function useNotifications() {
  return useQuery({
    queryKey: key,
    queryFn: () => api.get<ApiNotification[]>("/notifications"),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.patch<ApiNotification>(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
