import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  getMe,
  changeNickname,
  updateSettings,
  searchUsers,
  blockUser,
  unblockUser,
  getBlockList,
} from "../api/services/users";
import type { UpdateSettingsRequest } from "../types/dto/users";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: getMe,
  });
}

export function useChangeNickname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nickname: string) => changeNickname(nickname),
    onMutate: async (nickname) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() });
      const previous = queryClient.getQueryData(queryKeys.user.me());
      queryClient.setQueryData(queryKeys.user.me(), (old: any) => {
        if (!old) return old;
        return { ...old, nickname };
      });
      return { previous };
    },
    onError: (_err, _nickname, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.user.me(), context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: UpdateSettingsRequest) => updateSettings(req),
    onMutate: async (req) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() });
      const previous = queryClient.getQueryData(queryKeys.user.me());
      queryClient.setQueryData(queryKeys.user.me(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          notificationSettings: { ...old.notificationSettings, ...req },
        };
      });
      return { previous };
    },
    onError: (_err, _req, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.user.me(), context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
}

export function useSearchUsers(tag: string) {
  return useQuery({
    queryKey: ["users", "search", tag],
    queryFn: () => searchUsers(tag),
    enabled: tag.length > 0,
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.blocks() });
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.list() });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.blocks() });
    },
  });
}

export function useBlockList() {
  return useQuery({
    queryKey: queryKeys.user.blocks(),
    queryFn: getBlockList,
  });
}
