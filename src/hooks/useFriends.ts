import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  getFriends,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriendRequest,
  removeFriend,
  nudgeFriend,
  getUnreadRequestCount,
  markRequestsAsRead,
} from "../api/services/friends";
import type {
  FriendRequestType,
  FriendListResponse,
  ReceivedRequestsResponse,
  SentRequestsResponse,
  UnreadRequestCountResponse,
} from "../types/dto/friends";

export function useFriends() {
  return useQuery({
    queryKey: queryKeys.friends.list(),
    queryFn: getFriends,
    refetchInterval: 60_000,
  });
}

export function useReceivedFriendRequests() {
  return useQuery({
    queryKey: queryKeys.friends.requests("received"),
    queryFn: () => getFriendRequests("received"),
    refetchInterval: 60_000,
  });
}

export function useSentFriendRequests() {
  return useQuery({
    queryKey: queryKeys.friends.requests("sent"),
    queryFn: () => getFriendRequests("sent"),
    refetchInterval: 60_000,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receiverId: string) => sendFriendRequest(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.friends.requests("sent"),
      });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => acceptFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.friends.requests("received"),
      });
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => rejectFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.friends.requests("received"),
      });
    },
  });
}

export function useDeleteFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => deleteFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.friends.requests("sent"),
      });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeFriend(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.friends.list() });
      const previous = queryClient.getQueryData<FriendListResponse>(
        queryKeys.friends.list(),
      );
      queryClient.setQueryData<FriendListResponse>(
        queryKeys.friends.list(),
        (old) =>
          old
            ? { ...old, friends: old.friends.filter((f) => f.userId !== userId) }
            : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.friends.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list() });
    },
  });
}

export function useNudgeFriend() {
  return useMutation({
    mutationFn: (userId: string) => nudgeFriend(userId),
  });
}

export function useUnreadRequestCount() {
  return useQuery({
    queryKey: queryKeys.friends.unreadRequestCount(),
    queryFn: getUnreadRequestCount,
    refetchInterval: 60_000,
  });
}

export function useMarkRequestsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markRequestsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.friends.unreadRequestCount(),
      });
      const previous = queryClient.getQueryData<UnreadRequestCountResponse>(
        queryKeys.friends.unreadRequestCount(),
      );
      queryClient.setQueryData<UnreadRequestCountResponse>(
        queryKeys.friends.unreadRequestCount(),
        { count: 0 },
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.friends.unreadRequestCount(),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.friends.unreadRequestCount(),
      });
    },
  });
}
