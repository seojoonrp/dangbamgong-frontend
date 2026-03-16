import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import TabHeader from "../../../components/navigation/TabHeader";
import DateNavigator from "../../../components/stats/DateNavigator";
import Histogram from "../../../components/stats/Histogram";
import Timetable from "../../../components/stats/Timetable";
import StatsText from "../../../components/stats/StatsText";
import StatsIcon from "../../../../assets/icons/header/stats.svg";
import { useDailyStats } from "../../../hooks/useStats";
import { useVoidHistory } from "../../../hooks/useVoid";
import { getTargetDay } from "../../../lib/dateUtils";
import { MOCK_DAILY_STATS, MOCK_VOID_HISTORY } from "../../../lib/mockStats";
import LoadingView from "../../../components/shared/LoadingView";

const MIN_DATE = "2026-03-20"; // 앱 출시일
const USE_MOCK = true; // TODO: 실제 데이터가 충분해지면 false로 변경

export default function StatsScreen() {
  const [currentDay, setCurrentDay] = useState(getTargetDay());
  const { data: dailyStats, isLoading: dailyLoading } =
    useDailyStats(currentDay);
  const { data: voidHistory, isLoading: historyLoading } =
    useVoidHistory(currentDay);

  const isToday = currentDay === getTargetDay();
  const isLoading = !USE_MOCK && (dailyLoading || historyLoading);

  const stats = USE_MOCK ? MOCK_DAILY_STATS : dailyStats;
  const history = USE_MOCK ? MOCK_VOID_HISTORY : voidHistory;

  return (
    <SafeAreaView style={styles.container}>
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

          <Timetable sessions={stats?.mySessions ?? []} />

          <StatsText dailyStats={stats} voidHistory={history} />
        </View>
      )}
    </SafeAreaView>
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
  },
});
