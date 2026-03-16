import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { formatDuration } from "../../lib/dateUtils";
import type { DailyStatResponse } from "../../types/dto/stats";
import type { VoidHistoryResponse } from "../../types/dto/void";

interface Props {
  dailyStats?: DailyStatResponse;
  voidHistory?: VoidHistoryResponse;
}

export default function StatsText({ dailyStats, voidHistory }: Props) {
  const sessions = voidHistory?.sessions ?? [];
  const totalSec = voidHistory?.totalDurationSec ?? 0;

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>공백 기록이 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.main}>
        총 공백 {formatDuration(totalSec)}
      </Text>
      <Text style={styles.sub}>
        잠에 든 209명 중{" "}
        <Text style={styles.highlight}>103번째로 긴 공백</Text>을 보냈어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  main: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-Bold",
  },
  sub: {
    color: Colors.text.light,
    fontSize: 13,
    marginTop: 6,
  },
  highlight: {
    color: Colors.point.coral,
    fontFamily: "A2Z-SemiBold",
  },
  empty: {
    color: Colors.text.mid,
    fontSize: 14,
  },
});
