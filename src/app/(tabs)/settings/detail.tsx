import { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import { useMyStats } from "../../../hooks/useStats";
import { formatDuration } from "../../../lib/dateUtils";
import LoadingView from "../../../components/shared/LoadingView";
import PullToRefreshView from "../../../components/shared/PullToRefreshView";
import { queryKeys } from "../../../lib/queryKeys";

export default function StatDetailScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useMyStats();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.stats.me() });
  }, [queryClient]);

  if (isLoading) return <LoadingView />;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="세부 공백 통계" />

      <PullToRefreshView onRefresh={handleRefresh}>
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
            {data?.totalDurationSec ? formatDuration(data.averageDurationSec) : "-"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>가장 긴 공백</Text>
          <Text style={styles.value}>
            {data?.totalDurationSec
              ? `${formatDuration(data.maxDurationSec)} (${data.maxDurationDate})`
              : "-"}
          </Text>
        </View>
      </View>
      </PullToRefreshView>
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
