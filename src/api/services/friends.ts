import { client } from "../client";
import type {
  FriendListResponse,
  FriendRequestType,
  SendFriendRequestResponse,
  ReceivedRequestsResponse,
  SentRequestsResponse,
  UnreadRequestCountResponse,
} from "../../types/dto/friends";

export async function getFriends(): Promise<FriendListResponse> {
  return client.get<never, FriendListResponse>("/friends");
}

export async function sendFriendRequest(
  receiverId: string,
): Promise<SendFriendRequestResponse> {
  return client.post<never, SendFriendRequestResponse>("/friends/requests", {
    receiverId,
  });
}

export async function getFriendRequests(
  type: "received",
): Promise<ReceivedRequestsResponse>;
export async function getFriendRequests(
  type: "sent",
): Promise<SentRequestsResponse>;
export async function getFriendRequests(
  type: FriendRequestType,
): Promise<ReceivedRequestsResponse | SentRequestsResponse> {
  return client.get("/friends/requests", { params: { type } });
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  await client.post(`/friends/requests/${requestId}/accept`);
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  await client.post(`/friends/requests/${requestId}/reject`);
}

export async function deleteFriendRequest(requestId: string): Promise<void> {
  await client.delete(`/friends/requests/${requestId}`);
}

export async function removeFriend(userId: string): Promise<void> {
  await client.delete(`/friends/${userId}`);
}

export async function nudgeFriend(userId: string): Promise<void> {
  await client.post(`/friends/${userId}/nudge`);
}

export async function getUnreadRequestCount(): Promise<UnreadRequestCountResponse> {
  return client.get<never, UnreadRequestCountResponse>(
    "/friends/requests/unread-count",
  );
}

export async function markRequestsAsRead(): Promise<void> {
  await client.patch("/friends/requests/read");
}
