import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/colors";
import { setNickname } from "../../api/services/auth";
import { useAuth } from "../../lib/AuthContext";
import SleepImage from "../../../assets/images/sleep.svg";

export default function NicknameScreen() {
  const [nickname, setNicknameValue] = useState("");
  const [blurred, setBlurred] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuthenticated } = useAuth();

  const isValid = nickname.length >= 3 && nickname.length <= 15;
  const showError = blurred && !isValid;

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      await setNickname(nickname);
      setAuthenticated();
      router.replace("/(tabs)/main");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert("닉네임 설정 실패", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <SleepImage width={280} height={168} color={Colors.text.dark} />
      </View>

      <Text style={styles.title}>
        <Text style={styles.titleBold}>당밤공</Text>
        <Text>에서 사용할{"\n"}</Text>
        <Text style={styles.titleBold}>닉네임</Text>
        <Text>을 입력해주세요</Text>
      </Text>

      <View style={styles.inputWrapper}>
        {/* Shadow border behind input */}
        <View
          style={[styles.inputShadow, showError && styles.inputShadowError]}
        />
        <TextInput
          style={styles.input}
          placeholder="닉네임을 입력해주세요"
          placeholderTextColor="#9c9ca0"
          maxLength={15}
          value={nickname}
          onChangeText={(text) => {
            setNicknameValue(text);
          }}
          onBlur={() => {
            setBlurred(true);
          }}
        />
      </View>

      <Text style={[styles.errorText, !showError && styles.errorTextHidden]}>
        닉네임을 3~15글자로 입력해주세요.
      </Text>

      <Pressable
        style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text
            style={[
              styles.buttonText,
              (!isValid || loading) && styles.buttonTextDisabled,
            ]}
          >
            시작하기
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    paddingHorizontal: 40,
    justifyContent: "center",
    paddingBottom: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontFamily: "A2Z-Medium",
    color: Colors.white,
    lineHeight: 30,
    marginBottom: 24,
  },
  titleBold: {
    fontFamily: "A2Z-SemiBold",
  },
  inputWrapper: {
    position: "relative",
    height: 60,
    marginBottom: 8,
  },
  inputShadow: {
    position: "absolute",
    top: 4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.text.dark,
  },
  inputShadowError: {
    borderColor: Colors.point.coral,
  },
  input: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.text.dark,
    paddingHorizontal: 22,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    color: "#000000",
  },
  errorText: {
    color: Colors.point.coral,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    marginTop: 8,
    marginLeft: 4,
  },
  errorTextHidden: {
    opacity: 0,
  },
  button: {
    height: 48,
    borderRadius: 20,
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  buttonDisabled: {
    borderColor: Colors.text.dark,
    backgroundColor: "transparent",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
  },
  buttonTextDisabled: {
    color: Colors.text.dark,
  },
});
