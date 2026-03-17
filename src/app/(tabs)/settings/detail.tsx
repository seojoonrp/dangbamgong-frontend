import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import { useMyStats } from "../../../hooks/useStats";
import { formatDuration } from "../../../lib/dateUtils";
import LoadingView from "../../../components/shared/LoadingView";

// TODO: 가장 긴 공백 날짜 받아오기
const LONGEST_VOID_DATE = "2026.03.07";

export default function StatDetailScreen() {
  const { data, isLoading } = useMyStats();

  if (isLoading) return <LoadingView />;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="세부 공백 통계" />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>총 공백 시간</Text>
          <Text style={styles.value}>
            {formatDuration(data?.totalDurationSec ?? 0)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>평균 공백 시간</Text>
          <Text style={styles.value}>
            {formatDuration(data?.averageDurationSec ?? 0)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>가장 긴 공백</Text>
          <Text style={styles.value}>
            {formatDuration(data?.maxDurationSec ?? 0)} ({LONGEST_VOID_DATE})
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Medium",
  },
  value: {
    color: "rgba(250, 250, 250, 0.9)",
    fontSize: 13,
    fontFamily: "A2Z-Regular",
  },
});
