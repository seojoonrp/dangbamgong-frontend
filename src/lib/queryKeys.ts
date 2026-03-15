import type { FriendRequestType } from "../types/dto/friends";

export const queryKeys = {
  user: {
    me: () => ["user", "me"] as const,
    blocks: () => ["user", "blocks"] as const,
  },
  void: {
    history: (targetDay: string) => ["void", "history", targetDay] as const,
  },
  stats: {
    home: () => ["stats", "home"] as const,
    daily: (targetDay: string) => ["stats", "daily", targetDay] as const,
    me: () => ["stats", "me"] as const,
  },
  activities: {
    list: () => ["activities"] as const,
  },
  friends: {
    list: () => ["friends", "list"] as const,
    requests: (type: FriendRequestType) =>
      ["friends", "requests", type] as const,
  },
  notifications: {
    list: () => ["notifications"] as const,
    unread: () => ["notifications", "unread"] as const,
  },
} as const;
