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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: UpdateSettingsRequest) => updateSettings(req),
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
