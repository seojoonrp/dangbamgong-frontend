import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { formatDuration } from "../../lib/dateUtils";
import type { HomeStatResponse } from "../../types/dto/stats";
import type { VoidEndResponse } from "../../types/dto/void";

type VoidState = "awake" | "inVoid" | "ended";

interface Props {
  voidState: VoidState;
  homeStats?: HomeStatResponse;
  elapsedSec?: number;
  endResult?: VoidEndResponse | null;
  hasVoidHistory: boolean;
}

export default function HomeStatsBar({
  voidState,
  homeStats,
  elapsedSec = 0,
  endResult,
  hasVoidHistory,
}: Props) {
  const renderContent = () => {
    if (voidState === "ended" && endResult) {
      return (
        <>
          <Text style={styles.stat}>
            {formatDuration(endResult.durationSec)}의 공백을 보냈어요.
          </Text>
          <Text style={styles.statSub}>안녕히 주무세요!</Text>
        </>
      );
    }

    if (voidState === "inVoid") {
      return (
        <>
          <Text style={styles.stat}>
            현재 {homeStats?.currentVoidCount ?? 0}명이 공백 중이에요.
          </Text>
          <Text style={styles.statSub}>
            {homeStats?.todaySleptCount ?? 0}명이 잠에 들었어요.
          </Text>
        </>
      );
    }

    // awake
    if (hasVoidHistory && homeStats) {
      return (
        <>
          <Text style={styles.stat}>
            어젯밤 {formatDuration(homeStats.myTotalDurationSec)}의 공백을
            보냈어요.
          </Text>
          <Text style={styles.statSub}>
            {homeStats.totalSleptUsers}명 중 {homeStats.myRank}번째로 긴
            공백이었습니다.
          </Text>
        </>
      );
    }

    return (
      <>
        <Text style={styles.stat}>
          지금 {homeStats?.currentVoidCount ?? 0}명의 사람들이 공백 중이에요.
        </Text>
        <Text style={styles.statSub}>
          {homeStats?.todaySleptCount ?? 0}명의 사람들은 공백을 끝내고 잠에
          들었어요.
        </Text>
      </>
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  stat: {
    color: Colors.white,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 4,
  },
  statSub: {
    color: Colors.text.light,
    fontSize: 13,
    textAlign: "center",
  },
});
