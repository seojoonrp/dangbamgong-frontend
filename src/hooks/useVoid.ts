import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  startVoid,
  endVoid,
  cancelVoid,
  getVoidHistory,
  createTestVoid,
} from "../api/services/void";
import type { VoidEndRequest, TestVoidRequest } from "../types/dto/void";
import type { UserMeResponse } from "../types/dto/users";

export function useStartVoid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startVoid,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() });
      const previous = queryClient.getQueryData<UserMeResponse>(
        queryKeys.user.me(),
      );
      queryClient.setQueryData<UserMeResponse>(queryKeys.user.me(), (old) =>
        old
          ? {
              ...old,
              isInVoid: true,
              currentVoidStartedAt: new Date().toISOString(),
            }
          : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.user.me(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.home() });
    },
  });
}

export function useEndVoid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: VoidEndRequest) => endVoid(req),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() });
      const previous = queryClient.getQueryData<UserMeResponse>(
        queryKeys.user.me(),
      );
      queryClient.setQueryData<UserMeResponse>(queryKeys.user.me(), (old) =>
        old ? { ...old, isInVoid: false, currentVoidStartedAt: "" } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.user.me(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.home() });
    },
  });
}

export function useCancelVoid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelVoid,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() });
      const previous = queryClient.getQueryData<UserMeResponse>(
        queryKeys.user.me(),
      );
      queryClient.setQueryData<UserMeResponse>(queryKeys.user.me(), (old) =>
        old ? { ...old, isInVoid: false, currentVoidStartedAt: "" } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.user.me(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.home() });
    },
  });
}

export function useVoidHistory(targetDay: string) {
  return useQuery({
    queryKey: queryKeys.void.history(targetDay),
    queryFn: () => getVoidHistory(targetDay),
    enabled: !!targetDay,
  });
}

export function useCreateTestVoid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: TestVoidRequest) => createTestVoid(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.home() });
    },
  });
}
