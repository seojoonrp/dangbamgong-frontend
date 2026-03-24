import React, { useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors } from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LONG_PRESS_DURATION = 1200;

interface Props {
  mode: "tap" | "longPress";
  onAction: () => void;
  children: React.ReactNode;
}

export default function VoidTouchArea({ mode, onAction, children }: Props) {
  const progress = useSharedValue(0);
  const isPressed = useSharedValue(false);

  const insets = useSafeAreaInsets();

  const handleComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAction();
  }, [onAction]);

  const handlePressIn = useCallback(() => {
    if (mode !== "longPress") return;
    isPressed.value = true;
    progress.value = withTiming(
      1,
      { duration: LONG_PRESS_DURATION, easing: Easing.linear },
      (finished) => {
        if (finished && isPressed.value) {
          runOnJS(handleComplete)();
        }
      },
    );
  }, [mode, progress, isPressed, handleComplete]);

  const handlePressOut = useCallback(() => {
    if (mode !== "longPress") return;
    isPressed.value = false;
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 200 });
  }, [mode, progress, isPressed]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    opacity: progress.value > 0 ? 1 : 0,
  }));

  return (
    <Pressable
      style={styles.container}
      onPress={mode === "tap" ? onAction : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.children}>{children}</View>
      {mode === "longPress" && (
        <View style={[styles.progressTrack, { bottom: -insets.bottom }]}>
          <Animated.View style={[styles.progressFill, barStyle]} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  children: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.black.dark,
    overflow: "hidden",
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.point.coral,
  },
});
