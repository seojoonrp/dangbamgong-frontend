import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  getHomeStats,
  getDailyStats,
  getMyStats,
} from "../api/services/stats";
import { addDays, canNavigatePrev } from "../lib/dateUtils";

export function useHomeStats(isInVoid: boolean = false) {
  return useQuery({
    queryKey: queryKeys.stats.home(),
    queryFn: getHomeStats,
    refetchInterval: isInVoid ? 60_000 : false,
  });
}

export function useDailyStats(targetDay: string) {
  return useQuery({
    queryKey: queryKeys.stats.daily(targetDay),
    queryFn: () => getDailyStats(targetDay),
    enabled: !!targetDay,
  });
}

export function usePrefetchAdjacentDayStats(
  currentDay: string,
  minDate: string,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const prevDay = addDays(currentDay, -1);
    if (canNavigatePrev(currentDay, minDate)) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.stats.daily(prevDay),
        queryFn: () => getDailyStats(prevDay),
        staleTime: 30_000,
      });
    }
  }, [currentDay, minDate, queryClient]);
}

export function useMyStats() {
  return useQuery({
    queryKey: queryKeys.stats.me(),
    queryFn: getMyStats,
  });
}
