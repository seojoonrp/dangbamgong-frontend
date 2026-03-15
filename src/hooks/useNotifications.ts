import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from "../api/services/notifications";
import type { NotificationListResponse } from "../types/dto/notifications";

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => getNotifications(),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.list(),
      });
      const previous = queryClient.getQueryData<NotificationListResponse>(
        queryKeys.notifications.list(),
      );
      queryClient.setQueryData<NotificationListResponse>(
        queryKeys.notifications.list(),
        (old) =>
          old
            ? {
                ...old,
                notifications: old.notifications.map((n) =>
                  n.id === notificationId ? { ...n, isRead: true } : n,
                ),
              }
            : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.notifications.list(),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread(),
      });
    },
  });
}
