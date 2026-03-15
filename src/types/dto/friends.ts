import type { UserSearchItem } from "./users";

export interface FriendItem {
  userId: string;
  nickname: string;
  tag: string;
  isInVoid: boolean;
  lastVoidEndedAt: string;
  createdAt: string;
}

export interface FriendListResponse {
  friends: FriendItem[];
}

export type FriendRequestType = "received" | "sent";

export interface SendFriendRequestRequest {
  receiverId: string;
}

export interface SendFriendRequestResponse {
  requestId: string;
}

export interface ReceivedRequestItem {
  requestId: string;
  sender: UserSearchItem;
  createdAt: string;
}

export interface ReceivedRequestsResponse {
  requests: ReceivedRequestItem[];
}
