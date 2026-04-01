import { useState, useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import PullArcIndicator from "./PullArcIndicator";

const MAX_DRAG = 100;
const THRESHOLD = 100;
const PULL_AREA_HEIGHT = 100;

interface PullToRefreshViewProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  scrollOffsetY?: SharedValue<number>;
}

export default function PullToRefreshView({
  onRefresh,
  children,
  scrollOffsetY,
}: PullToRefreshViewProps) {
  const [refreshing, setRefreshing] = useState(false);

  const dragY = useSharedValue(0);
  const pullProgress = useSharedValue(0);
  const isSpinning = useSharedValue(0);
  const thresholdMet = useSharedValue(false);
  const pullAreaH = useSharedValue(0);

  const hapticImpact = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const hapticSuccess = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  useEffect(() => {
    if (!refreshing) return;
    onRefresh().finally(() => {
      setRefreshing(false);
      isSpinning.value = withTiming(0, { duration: 200 });
      dragY.value = withTiming(0, { duration: 400 });
      pullAreaH.value = withTiming(0, { duration: 400 });
      pullProgress.value = withTiming(0, { duration: 400 });
    });
  }, [refreshing]);

  const panGesture = Gesture.Pan()
    .activeOffsetY([5, MAX_DRAG])
    .failOffsetY(-5)
    .onUpdate((e) => {
      "worklet";
      if (isSpinning.value) return;
      if (scrollOffsetY && scrollOffsetY.value > 1) return;

      const clamped = Math.min(Math.max(0, e.translationY), MAX_DRAG);
      dragY.value = clamped;
      pullAreaH.value = clamped;
      pullProgress.value = Math.min(clamped / THRESHOLD, 1);

      if (clamped >= THRESHOLD && !thresholdMet.value) {
        thresholdMet.value = true;
        runOnJS(hapticImpact)();
      } else if (clamped < THRESHOLD && thresholdMet.value) {
        thresholdMet.value = false;
      }
    })
    .onEnd(() => {
      "worklet";
      if (thresholdMet.value && !isSpinning.value) {
        isSpinning.value = withTiming(1, { duration: 200 });
        dragY.value = PULL_AREA_HEIGHT;
        pullAreaH.value = PULL_AREA_HEIGHT;
        runOnJS(hapticSuccess)();
        runOnJS(triggerRefresh)();
      } else {
        dragY.value = withTiming(0, { duration: 300 });
        pullAreaH.value = withTiming(0, { duration: 300 });
        pullProgress.value = withTiming(0, { duration: 300 });
      }
      thresholdMet.value = false;
    });

  const gesture = scrollOffsetY
    ? Gesture.Simultaneous(panGesture, Gesture.Native())
    : panGesture;

  const pullAreaStyle = useAnimatedStyle(() => ({
    height: pullAreaH.value,
    overflow: "hidden",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={styles.container}>
        <Animated.View style={pullAreaStyle}>
          <PullArcIndicator progress={pullProgress} isSpinning={isSpinning} />
        </Animated.View>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
