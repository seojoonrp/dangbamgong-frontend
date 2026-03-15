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

export default function NicknameScreen() {
  const [nickname, setNicknameValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuthenticated } = useAuth();

  const isValid = nickname.length >= 3 && nickname.length <= 15;
  const showError = touched && !isValid;

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
      <Text style={styles.title}>
        당밤공에서 사용할{"\n"}닉네임을 설정해주세요
      </Text>

      <TextInput
        style={[styles.input, showError && styles.inputError]}
        placeholder="닉네임을 입력해주세요..."
        placeholderTextColor={Colors.text.mid}
        maxLength={15}
        value={nickname}
        onChangeText={setNicknameValue}
        onBlur={() => setTouched(true)}
        autoFocus
      />
      {showError && (
        <Text style={styles.errorText}>닉네임은 3~15자여야 합니다.</Text>
      )}

      <Pressable
        style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.buttonText}>시작하기</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontFamily: "A2Z-Bold",
    color: Colors.white,
    marginBottom: 32,
    lineHeight: 32,
  },
  input: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.dark,
    color: Colors.white,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: {
    borderBottomColor: Colors.point.coral,
  },
  errorText: {
    color: Colors.point.coral,
    fontSize: 12,
    marginBottom: 24,
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.point.coral,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: Colors.black.light,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-SemiBold",
  },
});
