import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../api/services/activities";
import type { ActivityListResponse } from "../types/dto/activities";

export function useActivities() {
  return useQuery({
    queryKey: queryKeys.activities.list(),
    queryFn: getActivities,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createActivity(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.list() });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, name }: { activityId: string; name: string }) =>
      updateActivity(activityId, name),
    onMutate: async ({ activityId, name }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.activities.list() });
      const previous = queryClient.getQueryData<ActivityListResponse>(
        queryKeys.activities.list(),
      );
      queryClient.setQueryData<ActivityListResponse>(
        queryKeys.activities.list(),
        (old) =>
          old
            ? {
                ...old,
                activities: old.activities.map((a) =>
                  a.id === activityId ? { ...a, name } : a,
                ),
              }
            : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.activities.list(), context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.list() });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => deleteActivity(activityId),
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.activities.list(),
      });
      const previous = queryClient.getQueryData<ActivityListResponse>(
        queryKeys.activities.list(),
      );
      queryClient.setQueryData<ActivityListResponse>(
        queryKeys.activities.list(),
        (old) =>
          old
            ? {
                ...old,
                activities: old.activities.filter((a) => a.id !== activityId),
              }
            : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.activities.list(),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.list() });
    },
  });
}
