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
import LoadingView from "../../../components/shared/LoadingView";

const MIN_DATE = "2025-01-01"; // 앱 출시일

export default function StatsScreen() {
  const [currentDay, setCurrentDay] = useState(getTargetDay());
  const { data: dailyStats, isLoading: dailyLoading } =
    useDailyStats(currentDay);
  const { data: voidHistory, isLoading: historyLoading } =
    useVoidHistory(currentDay);

  const isToday = currentDay === getTargetDay();
  const isLoading = dailyLoading || historyLoading;

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
          {/* 히스토그램 */}
          <Histogram buckets={dailyStats?.buckets ?? []} isToday={isToday} />

          {/* 통계 텍스트 */}
          <StatsText dailyStats={dailyStats} voidHistory={voidHistory} />

          {/* 시간표 */}
          <Timetable sessions={dailyStats?.mySessions ?? []} />
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
