import { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/queryKeys";
import PullToRefreshView from "../../../components/shared/PullToRefreshView";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import TabHeader from "../../../components/navigation/TabHeader";
import DateNavigator from "../../../components/stats/DateNavigator";
import Histogram from "../../../components/stats/Histogram";
import Timetable from "../../../components/stats/Timetable";
import StatsText from "../../../components/stats/StatsText";
import StatsIcon from "../../../../assets/icons/header/stats.svg";
import {
  useDailyStats,
  usePrefetchAdjacentDayStats,
} from "../../../hooks/useStats";
import { useMe } from "../../../hooks/useUser";
import { getTargetDay } from "../../../lib/dateUtils";
import { MOCK_DAILY_STATS } from "../../../lib/mockStats";
import LoadingView from "../../../components/shared/LoadingView";

const MIN_DATE = "2026-03-20"; // 앱 출시일
const USE_MOCK = false; // TODO: 실제 데이터가 충분해지면 false로 변경

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [currentDay, setCurrentDay] = useState(getTargetDay());

  useFocusEffect(
    useCallback(() => {
      const today = getTargetDay();
      setCurrentDay(today);
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats.daily(today),
      });
    }, [queryClient]),
  );

  const { data: me } = useMe();
  const { data: dailyStats, isLoading: dailyLoading } =
    useDailyStats(currentDay);
  usePrefetchAdjacentDayStats(currentDay, MIN_DATE);

  const isToday = currentDay === getTargetDay();
  const isLoading = !USE_MOCK && dailyLoading;

  const stats = USE_MOCK ? MOCK_DAILY_STATS : dailyStats;

  const isInVoid = isToday && !!me?.isInVoid && !!me?.currentVoidStartedAt;
  const activeVoidStartedAt = isInVoid ? me!.currentVoidStartedAt : undefined;

  // 진행 중 공백을 히스토그램에 반영 (해당 버킷 isMine: true, count +1)
  const augmentedBuckets = (() => {
    const base = stats?.buckets ?? [];
    if (!isInVoid || !activeVoidStartedAt) return base;
    const toOffset = (iso: string) => {
      const d = new Date(iso);
      const m = d.getHours() * 60 + d.getMinutes();
      return m >= 960 ? m - 960 : m + 480;
    };
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const nowOffset = nowMin >= 960 ? nowMin - 960 : nowMin + 480;
    const startBucket = Math.floor(toOffset(activeVoidStartedAt) / 20);
    const endBucket = Math.floor(nowOffset / 20);
    return base.map((b, i) =>
      i >= startBucket && i <= endBucket
        ? { ...b, isMine: true, count: b.count + 1 }
        : b,
    );
  })();

  // 진행 중 공백을 타임테이블에 반영 (현재 시각까지의 가상 세션 추가)
  const augmentedSessions = (() => {
    const base = stats?.mySessions ?? [];
    if (!isInVoid || !activeVoidStartedAt) return base;
    return [
      ...base,
      {
        startedAt: activeVoidStartedAt,
        endedAt: new Date().toISOString(),
        activities: [],
      },
    ];
  })();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.stats.daily(currentDay),
    });
  }, [queryClient, currentDay]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TabHeader icon={StatsIcon} title="Statistics" />

      <PullToRefreshView onRefresh={handleRefresh}>
        <DateNavigator
          currentDay={currentDay}
          minDate={MIN_DATE}
          onDayChange={setCurrentDay}
        />

        {isLoading ? (
          <LoadingView />
        ) : (
          <View style={styles.content}>
            <Histogram buckets={augmentedBuckets} isToday={isToday} />

            <View style={styles.timetableSection}>
              <Timetable
                sessions={augmentedSessions}
                activeVoidStartedAt={activeVoidStartedAt}
              />
            </View>

            <StatsText
              myTotalDurationSec={stats?.myTotalDurationSec ?? 0}
              totalSleptUsers={stats?.totalSleptUsers ?? 0}
              allTotalDurationSec={stats?.allTotalDurationSec ?? 0}
            />
          </View>
        )}
      </PullToRefreshView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    paddingBottom: Layout.bottomTabHeight,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  timetableSection: {
    flex: 1,
    marginTop: 12,
  },
});
