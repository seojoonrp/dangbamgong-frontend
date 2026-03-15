import { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";

interface Props {
  message: string;
  type?: "success" | "error";
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  visible,
  onHide,
  duration = 2500,
}: Props) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      opacity.value = withDelay(
        duration,
        withTiming(0, { duration: 200 }, () => {
          runOnJS(onHide)();
        }),
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        type === "error" && styles.error,
        animatedStyle,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 130,
    left: 24,
    right: 24,
    backgroundColor: Colors.black.light,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  error: {
    backgroundColor: Colors.point.coral,
  },
  text: {
    color: Colors.white,
    fontSize: 14,
  },
});
