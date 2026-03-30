import { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";
import { Layout } from "../../constants/layout";

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function Toast({
  message,
  visible,
  onHide,
  duration = 2500,
}: Props) {
  const SLIDE_DIST = Layout.bottomTabHeight + 12;
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(SLIDE_DIST);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withDelay(
          duration,
          withTiming(0, { duration: 400 }, () => {
            runOnJS(onHide)();
          }),
        ),
      );
      translateY.value = withSequence(
        withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withDelay(
          duration,
          withTiming(SLIDE_DIST, {
            duration: 400,
            easing: Easing.in(Easing.cubic),
          }),
        ),
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Layout.bottomTabHeight + 12,
    left: 36,
    right: 36,
    backgroundColor: Colors.black.dark,
    borderWidth: 1,
    borderColor: Colors.point.coral,
    borderRadius: 99,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 1,
  },
  text: {
    color: Colors.point.coral,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
  },
});
