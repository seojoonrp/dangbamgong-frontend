import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import TabHeader from "../../../components/navigation/TabHeader";
import VoidSwipeArea from "../../../components/main/VoidSwipeArea";
import HomeStatsBar from "../../../components/main/HomeStatsBar";
import ActivitySelector from "../../../components/main/ActivitySelector";
import AddActivityModal from "../../../components/main/AddActivityModal";
import NotificationDrawer from "../../../components/main/NotificationDrawer";
import MainIcon from "../../../../assets/icons/header/main.svg";
import ActivitiesIcon from "../../../../assets/icons/header/activities.svg";
import NotificationsIcon from "../../../../assets/icons/header/notifications.svg";
import AwakeImage from "../../../../assets/images/awake.svg";
import VoidImage from "../../../../assets/images/void.svg";
import SleepImage from "../../../../assets/images/sleep.svg";
import { useMe } from "../../../hooks/useUser";
import {
  useStartVoid,
  useEndVoid,
  useCancelVoid,
} from "../../../hooks/useVoid";
import { useHomeStats } from "../../../hooks/useStats";
import { useUnreadCount } from "../../../hooks/useNotifications";
import { useVoidHistory } from "../../../hooks/useVoid";
import { getTargetDay, formatDuration } from "../../../lib/dateUtils";
import type { VoidEndResponse } from "../../../types/dto/void";

type VoidState = "awake" | "inVoid" | "ended";

export default function MainScreen() {
  const { data: user } = useMe();
  const isInVoid = user?.isInVoid ?? false;
  const [justEnded, setJustEnded] = useState(false);
  const [endResult, setEndResult] = useState<VoidEndResponse | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(
    new Set(),
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const startVoid = useStartVoid();
  const endVoidMutation = useEndVoid();
  const cancelVoidMutation = useCancelVoid();

  const voidState: VoidState = isInVoid
    ? "inVoid"
    : justEnded
      ? "ended"
      : "awake";

  const { data: homeStats } = useHomeStats(isInVoid);
  const { data: unreadData } = useUnreadCount();
  const targetDay = getTargetDay();
  const { data: voidHistory } = useVoidHistory(targetDay);
  const hasVoidHistory =
    (voidHistory?.sessions?.length ?? 0) > 0 ||
    (homeStats?.myTotalDurationSec ?? 0) > 0;

  // 실시간 경과 시간 (공백 중일 때만)
  useEffect(() => {
    if (!isInVoid || !user?.currentVoidStartedAt) return;
    const startTime = new Date(user.currentVoidStartedAt).getTime();
    const update = () => {
      setElapsedSec(Math.floor((Date.now() - startTime) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isInVoid, user?.currentVoidStartedAt]);

  // 공백 종료 후 awake 상태에서는 justEnded 리셋
  useEffect(() => {
    if (isInVoid) {
      setJustEnded(false);
      setEndResult(null);
    }
  }, [isInVoid]);

  const handleStartVoid = useCallback(() => {
    const hour = new Date().getHours();
    if (hour === 15) {
      Alert.alert(
        "공백 시작 알림",
        "16시 이전에 공백을 끝내지 않으면 자동으로 취소됩니다.",
        [
          { text: "취소", style: "cancel" },
          { text: "시작", onPress: () => startVoid.mutate() },
        ],
      );
    } else {
      startVoid.mutate();
    }
  }, [startVoid]);

  const handleEndVoid = useCallback(() => {
    const activities = Array.from(selectedActivities);
    endVoidMutation.mutate(
      { activities },
      {
        onSuccess: (data) => {
          setJustEnded(true);
          setEndResult(data);
          setSelectedActivities(new Set());
        },
      },
    );
  }, [endVoidMutation, selectedActivities]);

  const handleCancelVoid = useCallback(() => {
    Alert.alert("공백 취소", "공백을 취소하시겠습니까?", [
      { text: "아니오", style: "cancel" },
      {
        text: "취소하기",
        style: "destructive",
        onPress: () => cancelVoidMutation.mutate(),
      },
    ]);
  }, [cancelVoidMutation]);

  const handleToggleActivity = (name: string) => {
    setSelectedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const renderStateImage = () => {
    const size = 180;
    switch (voidState) {
      case "inVoid":
        return <VoidImage width={size} height={size} />;
      case "ended":
        return <SleepImage width={size} height={size} />;
      default:
        return <AwakeImage width={size} height={size} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TabHeader
        icon={MainIcon}
        title="당밤공"
        rightContent={
          <View style={{ flexDirection: "row", alignItems: "center", gap: -2 }}>
            <Pressable onPress={() => router.push("/(tabs)/main/activity")}>
              <ActivitiesIcon width={36} height={36} />
            </Pressable>
            <Pressable onPress={() => setShowNotifications(true)}>
              <View>
                <NotificationsIcon width={36} height={36} />
                {(unreadData?.count ?? 0) > 0 && (
                  <View style={styles.unreadDot} />
                )}
              </View>
            </Pressable>
          </View>
        }
      />

      <View style={styles.content}>
        {/* 공백 중일 때 경과 시간 */}
        {voidState === "inVoid" && (
          <Text style={styles.elapsed}>{formatDuration(elapsedSec)}</Text>
        )}

        {/* 스와이프 영역 */}
        {voidState === "awake" && (
          <VoidSwipeArea direction="down" onSwipeComplete={handleStartVoid}>
            {renderStateImage()}
          </VoidSwipeArea>
        )}

        {voidState === "inVoid" && (
          <VoidSwipeArea direction="up" onSwipeComplete={handleEndVoid}>
            {renderStateImage()}
          </VoidSwipeArea>
        )}

        {voidState === "ended" && (
          <VoidSwipeArea direction="down" onSwipeComplete={handleStartVoid}>
            {renderStateImage()}
          </VoidSwipeArea>
        )}

        {/* 활동 선택 (공백 중일 때) */}
        {voidState === "inVoid" && (
          <ActivitySelector
            selectedIds={selectedActivities}
            onToggle={handleToggleActivity}
            onAddPress={() => setShowAddModal(true)}
          />
        )}

        {/* 공백 취소 버튼 (공백 중일 때) */}
        {voidState === "inVoid" && (
          <Pressable style={styles.cancelButton} onPress={handleCancelVoid}>
            <Text style={styles.cancelText}>공백 취소</Text>
          </Pressable>
        )}

        {/* 통계 바 */}
        <HomeStatsBar
          voidState={voidState}
          homeStats={homeStats}
          elapsedSec={elapsedSec}
          endResult={endResult}
          hasVoidHistory={hasVoidHistory}
        />
      </View>

      {/* 활동 추가 모달 */}
      <AddActivityModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* 알림 Drawer */}
      <NotificationDrawer
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
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
    justifyContent: "center",
    alignItems: "center",
  },
  elapsed: {
    color: Colors.white,
    fontSize: 28,
    fontFamily: "A2Z-SemiBold",
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.point.coral,
  },
  cancelText: {
    color: Colors.point.coral,
    fontSize: 14,
  },
  unreadDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
});
