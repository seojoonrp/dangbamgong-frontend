import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  useDerivedValue,
  useAnimatedReaction,
  cancelAnimation,
  withDelay,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Colors } from "../../constants/colors";

const SIZE = 24;
const BORDER_WIDTH = 2.5;
const HALF = SIZE / 2;
const HOLE_SIZE = SIZE - BORDER_WIDTH * 2;

interface PullArcIndicatorProps {
  progress: SharedValue<number>;
  isSpinning: SharedValue<number>;
}

export default function PullArcIndicator({
  progress,
  isSpinning,
}: PullArcIndicatorProps) {
  const rotation = useSharedValue(0);
  const shrinkRotation = useSharedValue(0);

  useAnimatedReaction(
    () => isSpinning.value,
    (currentVal, prevVal) => {
      const isNowSpinning = currentVal > 0.1;
      const wasSpinning = (prevVal ?? 0) > 0.1;

      if (isNowSpinning && !wasSpinning) {
        shrinkRotation.value = withTiming(270, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });

        rotation.value = 0;
        rotation.value = withDelay(
          200,
          withRepeat(
            withTiming(360, {
              duration: 800,
              easing: Easing.linear,
            }),
            -1,
            false,
          ),
        );
      } else if (!isNowSpinning && wasSpinning) {
        cancelAnimation(rotation);
        cancelAnimation(shrinkRotation);
      }

      if (currentVal < 0.01) {
        rotation.value = 0;
        shrinkRotation.value = 0;
      }
    },
  );

  const arcProgress = useDerivedValue(() => {
    return interpolate(isSpinning.value, [0, 1], [progress.value, 0.25]);
  });

  const rightDiscStyle = useAnimatedStyle(() => {
    const rot = Math.min(arcProgress.value * 2, 1) * 180 - 180;
    return { transform: [{ rotate: `${rot}deg` }] };
  });

  const leftDiscStyle = useAnimatedStyle(() => {
    const rot = Math.max(arcProgress.value * 2 - 1, 0) * 180 - 180;
    return { transform: [{ rotate: `${rot}deg` }] };
  });

  const spinnerContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${shrinkRotation.value}deg` },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.backgroundRing} />

      <Animated.View style={[StyleSheet.absoluteFill, spinnerContainerStyle]}>
        <View style={styles.rightClip}>
          <Animated.View
            style={[styles.disc, styles.rightDisc, rightDiscStyle]}
          >
            <View style={styles.rightHalf} />
          </Animated.View>
        </View>

        <View style={styles.leftClip}>
          <Animated.View style={[styles.disc, styles.leftDisc, leftDiscStyle]}>
            <View style={styles.leftHalf} />
          </Animated.View>
        </View>
      </Animated.View>

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
    overflow: "hidden",
  },
  rightHalf: {
    position: "absolute",
    left: HALF,
    width: HALF,
    height: SIZE,
    backgroundColor: Colors.white,
  },
  leftHalf: {
    position: "absolute",
    left: 0,
    width: HALF,
    height: SIZE,
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
