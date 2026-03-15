import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/colors";
import { loginTest } from "../../api/services/auth";
import { client } from "../../api/client";
import { useAuth } from "../../lib/AuthContext";

export default function LandingScreen() {
  const [loading, setLoading] = useState(false);
  const [socialId, setSocialId] = useState("test-user-1");
  const { login } = useAuth();

  const handleHealthCheck = async () => {
    try {
      const res = await client.get("/health");
      Alert.alert("Health Check", `서버 응답 OK\n${JSON.stringify(res)}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert("Health Check 실패", message);
    }
  };

  const handleTestLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await loginTest(socialId.trim() || "test-user-1");
      login(data);
      if (data.isNewUser) {
        router.replace("/(auth)/nickname");
      } else {
        router.replace("/(tabs)/main");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert("로그인 실패", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <Text style={styles.logo}>당밤공</Text>
        <Text style={styles.subtitle}>밤의 공백 시간 측정</Text>
      </View>

      <View style={styles.buttonArea}>
        <Pressable style={[styles.loginButton, styles.googleButton]}>
          <Text style={styles.googleButtonText}>Google로 계속하기</Text>
        </Pressable>

        <Pressable style={[styles.loginButton, styles.kakaoButton]}>
          <Text style={styles.kakaoButtonText}>카카오로 계속하기</Text>
        </Pressable>

        <Pressable style={[styles.loginButton, styles.appleButton]}>
          <Text style={styles.appleButtonText}>Apple로 계속하기</Text>
        </Pressable>

        <TextInput
          style={styles.socialIdInput}
          value={socialId}
          onChangeText={setSocialId}
          placeholder="소셜 ID 입력"
          placeholderTextColor={Colors.text.dark}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable style={styles.testButton} onPress={handleTestLogin}>
          <Text style={styles.testButtonText}>
            {loading ? "로그인 중..." : "테스트 로그인"}
          </Text>
        </Pressable>

        <Pressable style={styles.testButton} onPress={handleHealthCheck}>
          <Text style={styles.testButtonText}>서버 Health Check</Text>
        </Pressable>
      </View>

      <Text style={styles.terms}>
        로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.light,
    marginTop: 8,
  },
  buttonArea: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  loginButton: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButton: {
    backgroundColor: Colors.white,
  },
  googleButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  kakaoButton: {
    backgroundColor: Colors.brand.kakao,
  },
  kakaoButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  appleButton: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: Colors.text.dark,
  },
  appleButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  socialIdInput: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.text.dark,
    borderStyle: "dashed",
    paddingHorizontal: 16,
    color: Colors.white,
    fontSize: 14,
  },
  testButton: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.text.dark,
    borderStyle: "dashed",
  },
  testButtonText: {
    color: Colors.text.light,
    fontSize: 14,
  },
  terms: {
    color: Colors.text.mid,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 48,
  },
});
