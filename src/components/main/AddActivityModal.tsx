import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";
import { useCreateActivity, useActivities } from "../../hooks/useActivities";

interface Props {
  onClose: () => void;
}

export default function AddActivityCard({ onClose }: Props) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const { data } = useActivities();
  const createMutation = useCreateActivity();

  const translateY = useSharedValue(300);
  const overlayOpacity = useSharedValue(0);

  const existingNames = (data?.activities ?? []).map((a) => a.name);
  const isDuplicate = existingNames.includes(name.trim());
  const isValidLength = name.trim().length >= 1 && name.trim().length <= 10;
  const isValid = isValidLength && !isDuplicate;
  const showError = touched && !isValid;

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    overlayOpacity.value = withTiming(1, { duration: 300 });
  }, []);

  const close = () => {
    translateY.value = withTiming(300, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    });
    overlayOpacity.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await createMutation.mutateAsync(name.trim());
      setName("");
      setTouched(false);
      close();
    } catch {}
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.title}>추가할 활동의 이름을 입력해주세요.</Text>
          <TextInput
            style={[styles.input, showError && styles.inputError]}
            placeholder="1~10자로 입력해주세요..."
            placeholderTextColor={Colors.text.mid}
            value={name}
            onChangeText={setName}
            onBlur={() => setTouched(true)}
            maxLength={10}
            autoFocus
          />
          <View style={styles.errorRow}>
            {showError && (
              <Text style={styles.errorText}>
                {isDuplicate
                  ? "이미 존재하는 활동입니다."
                  : "활동 이름을 입력해주세요."}
              </Text>
            )}
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={[
                styles.submitBtn,
                (!isValid || createMutation.isPending) && styles.btnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isValid || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitText}>추가하기</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  keyboardView: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: Colors.black.mid,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: "80%",
    borderColor: Colors.white,
    borderWidth: 1,
  },
  title: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Medium",
    marginBottom: 12,
    marginTop: 4,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.dark,
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
  },
  inputError: {
    borderBottomColor: Colors.point.coral,
  },
  errorRow: {
    height: 28,
    justifyContent: "center",
  },
  errorText: {
    color: Colors.point.coral,
    fontSize: 11,
    fontFamily: "A2Z-Regular",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  submitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderColor: Colors.white,
    borderWidth: 1,
  },
  btnDisabled: {
    opacity: 0.2,
  },
  submitText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: "A2Z-Regular",
  },
});
