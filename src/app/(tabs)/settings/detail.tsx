import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import { useMyStats } from "../../../hooks/useStats";
import { formatDuration } from "../../../lib/dateUtils";
import LoadingView from "../../../components/shared/LoadingView";

export default function StatDetailScreen() {
  const { data, isLoading } = useMyStats();

  if (isLoading) return <LoadingView />;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="세부 공백 통계" />

      <View style={styles.content}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>총 공백 시간</Text>
          <Text style={styles.statValue}>
            {formatDuration(data?.totalDurationSec ?? 0)}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>평균 공백 시간</Text>
          <Text style={styles.statValue}>
            {formatDuration(data?.averageDurationSec ?? 0)}
          </Text>
          <Text style={styles.statSub}>총 공백 시간 / 공백 보낸 일수</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>가장 긴 공백</Text>
          <Text style={styles.statValue}>
            {formatDuration(data?.maxDurationSec ?? 0)}
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
    paddingTop: 20,
    gap: 16,
  },
  statCard: {
    backgroundColor: Colors.black.mid,
    borderRadius: 12,
    padding: 20,
  },
  statLabel: {
    color: Colors.text.mid,
    fontSize: 13,
    marginBottom: 8,
  },
  statValue: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: "A2Z-SemiBold",
  },
  statSub: {
    color: Colors.text.dark,
    fontSize: 11,
    marginTop: 4,
  },
});
