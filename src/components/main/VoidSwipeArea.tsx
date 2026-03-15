import React from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, runOnJS } from "react-native-reanimated";

const THRESHOLD = 60;

interface Props {
  direction: "down" | "up";
  onSwipeComplete: () => void;
  children: React.ReactNode;
}

export default function VoidSwipeArea({
  direction,
  onSwipeComplete,
  children,
}: Props) {
  const isTriggered = useSharedValue(false);

  const pan = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .onUpdate((event) => {
      const translation = event.translationY;
      const isCorrectDirection =
        direction === "down" ? translation > 0 : translation < 0;

      if (
        isCorrectDirection &&
        Math.abs(translation) >= THRESHOLD &&
        !isTriggered.value
      ) {
        isTriggered.value = true;
      }
    })
    .onEnd(() => {
      if (isTriggered.value) {
        runOnJS(onSwipeComplete)();
      }
      isTriggered.value = false;
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
