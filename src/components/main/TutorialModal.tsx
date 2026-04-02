import { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Portal } from "@gorhom/portal";
import * as SecureStore from "expo-secure-store";
import { Colors } from "../../constants/colors";
import SleepImage from "../../../assets/images/sleep.svg";
import VoidImage from "../../../assets/images/void.svg";

const TUTORIAL_KEY = "tutorial_completed";

interface Props {
  visible: boolean;
  onComplete: () => void;
  initialStep?: number;
}

export default function TutorialModal({ visible, onComplete, initialStep = 0 }: Props) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(initialStep);
  const [contentWidth, setContentWidth] = useState(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const resetAfterExit = () => {
    setMounted(false);
    setStep(initialStep);
    translateX.value = 0;
  };

  useEffect(() => {
    if (visible) {
      translateY.value = 80;
      opacity.value = 0;
      setMounted(true);
      translateY.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else if (mounted) {
      translateY.value = withTiming(80, {
        duration: 280,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: 250 }, () => {
        runOnJS(resetAfterExit)();
      });
    }
  }, [visible]);

  const handleNext = () => {
    setStep(1);
    translateX.value = withTiming(-contentWidth, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handleComplete = async () => {
    await SecureStore.setItemAsync(TUTORIAL_KEY, "true");
    onComplete();
    // State reset happens after exit animation completes (in resetAfterExit)
  };

  if (!mounted) return null;

  return (
    <Portal>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.View style={[styles.outerBorder, cardStyle]}>
          <View style={styles.card}>
            {/* Sliding content area */}
            <View
              style={styles.contentClip}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                setContentWidth(w);
                if (step === 1) translateX.value = -w;
              }}
            >
              <Animated.View
                style={[
                  styles.contentRow,
                  { width: contentWidth * 2 },
                  slideStyle,
                ]}
              >
                {/* Step 1 */}
                <View style={[styles.step, { width: contentWidth }]}>
                  <SleepImage width={180} height={108} color={Colors.white} />
                  <Text style={styles.welcomeText}>
                    당밤공에 오신 걸 환영합니다!
                  </Text>
                  <Text style={styles.headingText}>
                    <Text style={styles.headingRegular}>잠깐, </Text>
                    <Text style={styles.headingSemiBold}>공백</Text>
                    <Text style={styles.headingRegular}>이란 무엇인가요?</Text>
                  </Text>
                </View>

                {/* Step 2 */}
                <View style={[styles.step, { width: contentWidth }]}>
                  <VoidImage width={180} height={108} color={Colors.white} />
                  <Text style={styles.bodyText}>
                    <Text>{"공백은 "}</Text>
                    <Text style={styles.bodySemiBold}>
                      {"매일 밤 자기 전,\n침대에 누워 폰을 보는 시간"}
                    </Text>
                    <Text>
                      {"을 의미해요.\n\n침대에 누울 때 공백을 시작하고,\n"}
                    </Text>
                    <Text style={styles.bodyCoral}>{"진짜 자러 갈 때!"}</Text>
                    <Text>{" 공백을 종료하시면 됩니다."}</Text>
                  </Text>
                </View>
              </Animated.View>
            </View>

            {/* Button */}
            <Pressable
              style={styles.button}
              onPress={step === 0 ? handleNext : handleComplete}
            >
              <Text style={styles.buttonText}>
                {step === 0 ? "다음" : "확인했어요"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Portal>
  );
}

export { TUTORIAL_KEY };

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    paddingHorizontal: 20,
  },
  outerBorder: {
    width: "100%",
    height: 400,
    borderWidth: 1,
    borderColor: Colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: 6,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.black.mid,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    gap: 12,
    paddingHorizontal: 8,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  contentClip: {
    flex: 1,
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    height: "100%",
  },
  step: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    gap: 28,
  },
  welcomeText: {
    color: Colors.text.light,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
  },
  headingText: {
    fontSize: 16,
    textAlign: "center",
  },
  headingRegular: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-Regular",
  },
  headingSemiBold: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-SemiBold",
  },
  bodyText: {
    color: Colors.white,
    fontSize: 12.5,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  bodySemiBold: {
    fontFamily: "A2Z-SemiBold",
  },
  bodyCoral: {
    color: Colors.point.coral,
    fontFamily: "A2Z-Medium",
  },
  button: {
    height: 44,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.white,
    backgroundColor: Colors.black.light,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
  },
});
