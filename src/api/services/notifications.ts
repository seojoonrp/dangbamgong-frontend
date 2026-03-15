import { client } from "../client";
import type {
  NotificationListResponse,
  UnreadCountResponse,
} from "../../types/dto/notifications";

export async function getNotifications(params?: {
  limit?: number;
  offset?: number;
}): Promise<NotificationListResponse> {
  return client.get<never, NotificationListResponse>("/notifications", {
    params,
  });
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return client.get<never, UnreadCountResponse>(
    "/notifications/unread-count",
  );
}

export async function markAsRead(notificationId: string): Promise<void> {
  await client.patch(`/notifications/${notificationId}/read`);
}
