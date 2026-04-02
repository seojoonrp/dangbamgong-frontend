import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import TutorialModal, {
  TUTORIAL_KEY,
} from "../../../components/main/TutorialModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/queryKeys";
import PullToRefreshView from "../../../components/shared/PullToRefreshView";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import TabHeader from "../../../components/navigation/TabHeader";
import VoidTouchArea from "../../../components/main/VoidTouchArea";
import HomeStatsBar from "../../../components/main/HomeStatsBar";
import ActivitySelector from "../../../components/main/ActivitySelector";
import AddActivityCard from "../../../components/main/AddActivityModal";
import NotificationDrawer from "../../../components/main/NotificationDrawer";
import MainIcon from "../../../../assets/icons/header/main.svg";
import ActivitiesIcon from "../../../../assets/icons/header/activities.svg";
import NotificationsIcon from "../../../../assets/icons/header/notifications.svg";
import AwakeImage from "../../../../assets/images/awake.svg";
import VoidImage from "../../../../assets/images/void.svg";
import SleepImage from "../../../../assets/images/sleep.svg";
import { useMe } from "../../../hooks/useUser";
import { useActivities } from "../../../hooks/useActivities";
import {
  useStartVoid,
  useEndVoid,
  useCancelVoid,
} from "../../../hooks/useVoid";
import { useHomeStats } from "../../../hooks/useStats";
import { useUnreadCount } from "../../../hooks/useNotifications";
import Toast from "../../../components/shared/Toast";
import { useVoidHistory } from "../../../hooks/useVoid";
import { getTargetDay } from "../../../lib/dateUtils";
import type { VoidEndResponse } from "../../../types/dto/void";

type VoidState = "awake" | "inVoid" | "ended";

export default function MainScreen() {
  const { data: user } = useMe();
  useActivities(); // 활동 목록 프리페치
  const isInVoid = user?.isInVoid ?? false;
  const [justEnded, setJustEnded] = useState(false);
  const [endResult, setEndResult] = useState<VoidEndResponse | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(
    new Set(),
  );
  const [showAddCard, setShowAddCard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(TUTORIAL_KEY).then((val) => {
      if (!val) setShowTutorial(true);
    });
  }, []);

  const startVoid = useStartVoid();
  const endVoidMutation = useEndVoid();
  const cancelVoidMutation = useCancelVoid();

  const voidState: VoidState = isInVoid
    ? "inVoid"
    : justEnded
      ? "ended"
      : "awake";

  // 공백 경과 시간 (1분마다 갱신)
  const [elapsedMin, setElapsedMin] = useState(0);
  useEffect(() => {
    if (!isInVoid || !user?.currentVoidStartedAt) {
      setElapsedMin(0);
      return;
    }
    const calc = () => {
      const diff = Date.now() - new Date(user.currentVoidStartedAt).getTime();
      setElapsedMin(Math.floor(diff / 60000));
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [isInVoid, user?.currentVoidStartedAt]);

  const elapsedLabel =
    elapsedMin > 0
      ? elapsedMin >= 60
        ? `[ ${Math.floor(elapsedMin / 60)}시간 ${elapsedMin % 60}분째 공백 중 ]`
        : `[ ${elapsedMin}분째 공백 중 ]`
      : null;

  const queryClient = useQueryClient();
  const { data: homeStats } = useHomeStats(isInVoid);
  const { data: unreadData } = useUnreadCount();
  const targetDay = getTargetDay();
  const { data: voidHistory } = useVoidHistory(targetDay);
  const hasVoidHistory =
    (voidHistory?.sessions?.length ?? 0) > 0 ||
    (homeStats?.myTotalDurationSec ?? 0) > 0;

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
    setJustEnded(true);
    setSelectedActivities(new Set());
    endVoidMutation.mutate(
      { activities },
      {
        onSuccess: (data) => {
          setEndResult(data);
        },
        onError: () => {
          setJustEnded(false);
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
        onPress: () =>
          cancelVoidMutation.mutate(undefined, {
            onSuccess: () => setToastVisible(true),
          }),
      },
    ]);
  }, [cancelVoidMutation]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.home() }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.void.history(targetDay),
      }),
    ]);
  }, [queryClient, targetDay]);

  const handleToggleActivity = (name: string) => {
    setSelectedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const renderStateImage = () => {
    const size = 230;
    switch (voidState) {
      case "inVoid":
        return <VoidImage width={size} height={size} color={Colors.white} />;
      case "ended":
        return <SleepImage width={size} height={size} color={Colors.white} />;
      default:
        return <AwakeImage width={size} height={size} color={Colors.white} />;
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

      <PullToRefreshView onRefresh={handleRefresh}>
        <View style={styles.content}>
          {/* awake 상태 */}
          {voidState === "awake" && (
            <VoidTouchArea mode="longPress" onAction={handleStartVoid}>
              {renderStateImage()}
              <Text style={styles.hintText}>
                공백을 시작하려면 꾹 누르세요.
              </Text>
            </VoidTouchArea>
          )}

          {/* inVoid 상태 */}
          {voidState === "inVoid" && (
            <VoidTouchArea mode="longPress" onAction={handleEndVoid}>
              {renderStateImage()}
              <Text style={styles.activityLabel}>공백 동안 무엇을 했나요?</Text>
              <ActivitySelector
                selectedIds={selectedActivities}
                onToggle={handleToggleActivity}
                onAddPress={() => setShowAddCard(true)}
              />
              <Text style={styles.hintText}>공백을 끝내려면 꾹 누르세요.</Text>
              <Pressable style={styles.cancelButton} onPress={handleCancelVoid}>
                <Text style={styles.cancelText}>공백 취소하기</Text>
              </Pressable>
            </VoidTouchArea>
          )}

          {/* ended 상태 */}
          {voidState === "ended" && (
            <VoidTouchArea mode="longPress" onAction={handleStartVoid}>
              {renderStateImage()}
              <Text style={styles.hintText}>
                다시 공백을 시작하려면 꾹 누르세요.
              </Text>
            </VoidTouchArea>
          )}
        </View>
      </PullToRefreshView>

      {/* 하단 통계 바 */}
      <View style={styles.statsWrapper}>
        <HomeStatsBar
          voidState={voidState}
          homeStats={homeStats}
          endResult={endResult}
          hasVoidHistory={hasVoidHistory}
          elapsedLabel={elapsedLabel}
        />
      </View>

      {/* 활동 추가 카드 */}
      {showAddCard && <AddActivityCard onClose={() => setShowAddCard(false)} />}

      {/* 튜토리얼 모달 */}
      <TutorialModal
        visible={showTutorial}
        onComplete={() => setShowTutorial(false)}
      />

      {/* 튜토리얼 디버그 버튼 */}
      {/* <Pressable
        style={styles.debugButton}
        onPress={() => setShowTutorial(true)}
      /> */}

      {/* 알림 Drawer */}
      <NotificationDrawer
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <Toast
        message="공백이 취소되었습니다"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
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
  hintText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "A2Z-Light",
    textAlign: "center",
    marginTop: 40,
  },
  activityLabel: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  cancelButton: {
    marginTop: 4,
    paddingVertical: 8,
  },
  cancelText: {
    color: Colors.text.mid,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
  },
  statsWrapper: {
    position: "absolute",
    bottom: Layout.bottomTabHeight,
    left: 0,
    right: 0,
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
  debugButton: {
    position: "absolute",
    top: 100,
    left: 20,
    width: 32,
    height: 32,
    borderColor: Colors.point.coral,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
