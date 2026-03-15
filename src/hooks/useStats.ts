import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  getHomeStats,
  getDailyStats,
  getMyStats,
} from "../api/services/stats";

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

export function useMyStats() {
  return useQuery({
    queryKey: queryKeys.stats.me(),
    queryFn: getMyStats,
  });
}
