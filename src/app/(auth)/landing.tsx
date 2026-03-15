import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/colors";

export default function LandingScreen() {
  const handleTestLogin = () => {
    // TODO: 테스트 로그인 API 연동
    router.replace("/(tabs)/main");
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

        <Pressable
          style={[styles.loginButton, styles.kakaoButton]}
        >
          <Text style={styles.kakaoButtonText}>카카오로 계속하기</Text>
        </Pressable>

        <Pressable style={[styles.loginButton, styles.appleButton]}>
          <Text style={styles.appleButtonText}>Apple로 계속하기</Text>
        </Pressable>

        <Pressable style={styles.testButton} onPress={handleTestLogin}>
          <Text style={styles.testButtonText}>테스트 로그인</Text>
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
