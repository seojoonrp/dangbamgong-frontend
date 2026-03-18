import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "../../constants/colors";
import { loginTest } from "../../api/services/auth";
import { useAuth } from "../../lib/AuthContext";
import VoidImage from "../../../assets/images/void.svg";
import GoogleIcon from "../../../assets/icons/brand/google.svg";
import KakaoIcon from "../../../assets/icons/brand/kakao.svg";
import AppleIcon from "../../../assets/icons/brand/apple.svg";

const COMING_SOON_TITLE = "준비 중";
const COMING_SOON_MSG = "아직 구현되지 않은 기능입니다.";

export default function LandingScreen() {
  const [loading, setLoading] = useState(false);
  const [socialId, setSocialId] = useState("test-user-1");
  const { login } = useAuth();

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

  const handleComingSoon = () => {
    Alert.alert(COMING_SOON_TITLE, COMING_SOON_MSG);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 테스트 로그인 - 좌상단 absolute */}
      <View style={styles.testArea}>
        <TextInput
          style={styles.testInput}
          value={socialId}
          onChangeText={setSocialId}
          placeholder="소셜 ID"
          placeholderTextColor={Colors.text.dark}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={styles.testButton} onPress={handleTestLogin}>
          <Text style={styles.testButtonText}>
            {loading ? "..." : "테스트"}
          </Text>
        </Pressable>
      </View>

      {/* 콘텐츠 + 버튼 영역 (세로 가운데) */}
      <View style={styles.centerArea}>
        <View style={styles.content}>
          <VoidImage width={230} height={131} />
          <Text style={styles.title}>당밤공</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.boldText}>당</Text>
            <Text>신은 매일 </Text>
            <Text style={styles.boldText}>밤</Text>
            <Text> 얼마나 긴 </Text>
            <Text style={styles.boldText}>공</Text>
            <Text>백을 보냅니까?</Text>
          </Text>
        </View>

        {/* 소셜 로그인 버튼 */}
        <View style={styles.buttonArea}>
          <Pressable
            style={[styles.loginButton, styles.googleButton]}
            onPress={handleComingSoon}
          >
            <GoogleIcon width={24} height={24} />
            <Text style={styles.googleButtonText}>Google로 로그인</Text>
          </Pressable>

          <Pressable
            style={[styles.loginButton, styles.kakaoButton]}
            onPress={handleComingSoon}
          >
            <KakaoIcon width={21} height={21} />
            <Text style={styles.kakaoButtonText}>카카오로 로그인</Text>
          </Pressable>

          <Pressable
            style={[styles.loginButton, styles.appleButton]}
            onPress={handleComingSoon}
          >
            <AppleIcon width={24} height={24} />
            <Text style={styles.appleButtonText}>Apple로 로그인</Text>
          </Pressable>
        </View>
      </View>

      {/* 이용약관 */}
      <Pressable onPress={handleComingSoon}>
        <Text style={styles.terms}>
          <Text>로그인하면 </Text>
          <Text style={styles.termsLink}>서비스 이용약관</Text>
          <Text> 및{"\n"}</Text>
          <Text style={styles.termsLink}>개인정보 처리방침</Text>
          <Text>에 동의하게 됩니다.</Text>
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
  },
  testArea: {
    position: "absolute",
    top: 60,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
    opacity: 0.6,
  },
  testInput: {
    width: 160,
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.text.dark,
    borderStyle: "dashed",
    paddingHorizontal: 12,
    color: Colors.white,
    fontSize: 13,
  },
  testButton: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.text.dark,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  testButtonText: {
    color: Colors.text.light,
    fontSize: 13,
  },
  centerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    marginBottom: 72,
    marginTop: 28,
  },
  title: {
    fontSize: 30,
    fontFamily: "A2Z-SemiBold",
    color: Colors.white,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    color: Colors.text.dark,
    textAlign: "center",
    marginTop: 10,
  },
  boldText: {
    fontFamily: "A2Z-Bold",
  },
  buttonArea: {
    alignItems: "center",
    gap: 12,
  },
  loginButton: {
    width: 241,
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
    elevation: 3,
  },
  googleButtonText: {
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    color: "rgba(0,0,0,0.54)",
  },
  kakaoButton: {
    backgroundColor: Colors.brand.kakao,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
    elevation: 3,
  },
  kakaoButtonText: {
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    color: "#000000",
  },
  appleButton: {
    backgroundColor: "#000000",
  },
  appleButtonText: {
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    color: "#FFFFFF",
  },
  terms: {
    fontSize: 10,
    fontFamily: "A2Z-Regular",
    color: Colors.text.dark,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 16,
  },
  termsLink: {
    fontFamily: "A2Z-SemiBold",
    textDecorationLine: "underline" as const,
  },
});
