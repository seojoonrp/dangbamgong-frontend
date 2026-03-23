import { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import TabHeader from "../../../components/navigation/TabHeader";
import DateNavigator from "../../../components/stats/DateNavigator";
import Histogram from "../../../components/stats/Histogram";
import Timetable from "../../../components/stats/Timetable";
import StatsText from "../../../components/stats/StatsText";
import StatsIcon from "../../../../assets/icons/header/stats.svg";
import { useDailyStats } from "../../../hooks/useStats";
import { getTargetDay } from "../../../lib/dateUtils";
import { MOCK_DAILY_STATS } from "../../../lib/mockStats";
import LoadingView from "../../../components/shared/LoadingView";

const MIN_DATE = "2026-03-20"; // 앱 출시일
const USE_MOCK = false; // TODO: 실제 데이터가 충분해지면 false로 변경

export default function StatsScreen() {
  const insets = useSafeAreaInsets();

  const [currentDay, setCurrentDay] = useState(getTargetDay());
  const { data: dailyStats, isLoading: dailyLoading } =
    useDailyStats(currentDay);

  const isToday = currentDay === getTargetDay();
  const isLoading = !USE_MOCK && dailyLoading;

  const stats = USE_MOCK ? MOCK_DAILY_STATS : dailyStats;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TabHeader icon={StatsIcon} title="Statistics" />

      <DateNavigator
        currentDay={currentDay}
        minDate={MIN_DATE}
        onDayChange={setCurrentDay}
      />

      {isLoading ? (
        <LoadingView />
      ) : (
        <View style={styles.content}>
          <Histogram buckets={stats?.buckets ?? []} isToday={isToday} />

          <View style={styles.timetableSection}>
            <Timetable sessions={stats?.mySessions ?? []} />
          </View>

          <StatsText
            myTotalDurationSec={stats?.myTotalDurationSec ?? 0}
            totalSleptUsers={stats?.totalSleptUsers ?? 0}
            allTotalDurationSec={stats?.allTotalDurationSec ?? 0}
          />
        </View>
      )}
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
