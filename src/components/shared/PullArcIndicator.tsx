import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Colors } from "../../constants/colors";

const SIZE = 24;
const BORDER_WIDTH = 2.5;
const HALF = SIZE / 2;
const HOLE_SIZE = SIZE - BORDER_WIDTH * 2;

interface PullArcIndicatorProps {
  progress: SharedValue<number>;
  isSpinning: SharedValue<boolean>;
}

export default function PullArcIndicator({
  progress,
  isSpinning,
}: PullArcIndicatorProps) {
  const spinRotation = useSharedValue(0);

  useEffect(() => {
    spinRotation.value = withRepeat(
      withTiming(360, {
        duration: 800,
        easing: Easing.bezier(0.5, 0.2, 0.5, 0.8),
      }),
      -1,
      false,
    );
  }, []);

  // 오른쪽 반원: progress 0→0.5 에서 -180°→0°
  const rightDiscStyle = useAnimatedStyle(() => {
    const rot = Math.min(progress.value * 2, 1) * 180 - 180;
    const finalRot = isSpinning.value ? spinRotation.value : rot;
    return {
      transform: [{ rotate: `${finalRot}deg` }],
    };
  });

  // 왼쪽 반원: progress 0.5→1.0 에서 -180°→0°
  const leftDiscStyle = useAnimatedStyle(() => {
    const rot = Math.max(progress.value * 2 - 1, 0) * 180 - 180;
    // 스피너 모드에서는 왼쪽도 같이 회전하면 안 됨 (오른쪽 반원만 스피너처럼 보임)
    return {
      transform: [{ rotate: `${rot}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      {/* 배경 링 */}
      <View style={styles.backgroundRing} />

      {/* 오른쪽 클립: 오른쪽 절반만 표시 */}
      <View style={styles.rightClip}>
        <Animated.View style={[styles.disc, styles.rightDisc, rightDiscStyle]} />
      </View>

      {/* 왼쪽 클립: 왼쪽 절반만 표시 */}
      <View style={styles.leftClip}>
        <Animated.View style={[styles.disc, styles.leftDisc, leftDiscStyle]} />
      </View>

      {/* 중앙 구멍: 링처럼 보이게 */}
      <View style={styles.hole} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    position: "relative",
  },
  backgroundRing: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: HALF,
    borderWidth: BORDER_WIDTH,
    borderColor: Colors.black.light,
  },
  rightClip: {
    position: "absolute",
    left: HALF,
    top: 0,
    width: HALF,
    height: SIZE,
    overflow: "hidden",
  },
  rightDisc: {
    left: -HALF,
  },
  leftClip: {
    position: "absolute",
    left: 0,
    top: 0,
    width: HALF,
    height: SIZE,
    overflow: "hidden",
  },
  leftDisc: {
    left: 0,
  },
  disc: {
    position: "absolute",
    top: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: HALF,
    backgroundColor: Colors.white,
  },
  hole: {
    position: "absolute",
    top: BORDER_WIDTH,
    left: BORDER_WIDTH,
    width: HOLE_SIZE,
    height: HOLE_SIZE,
    borderRadius: HOLE_SIZE / 2,
    backgroundColor: Colors.black.dark,
  },
});
