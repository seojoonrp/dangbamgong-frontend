import React from "react";
import { StyleSheet, Text, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";

const THRESHOLD = 120;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const translateY = useSharedValue(0);
  const isTriggered = useSharedValue(false);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (direction === "down") {
        translateY.value = Math.max(0, Math.min(event.translationY, 200));
      } else {
        translateY.value = Math.min(0, Math.max(event.translationY, -200));
      }

      const distance = Math.abs(translateY.value);
      if (distance >= THRESHOLD && !isTriggered.value) {
        isTriggered.value = true;
      }
    })
    .onEnd(() => {
      if (isTriggered.value) {
        runOnJS(onSwipeComplete)();
      }
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      isTriggered.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const hintStyle = useAnimatedStyle(() => {
    const progress = Math.min(Math.abs(translateY.value) / THRESHOLD, 1);
    return { opacity: 0.3 + progress * 0.7 };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
        <Animated.View style={[styles.hintContainer, hintStyle]}>
          <Text style={styles.hintText}>
            {direction === "down"
              ? "아래로 스와이프하여 공백 시작"
              : "위로 스와이프하여 공백 종료"}
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hintContainer: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  hintText: {
    color: Colors.text.light,
    fontSize: 13,
  },
});
