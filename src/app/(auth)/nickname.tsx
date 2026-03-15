import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/colors";

export default function NicknameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        당밤공에서 사용할{"\n"}닉네임을 설정해주세요
      </Text>

      <TextInput
        style={styles.input}
        placeholder="닉네임을 입력해주세요..."
        placeholderTextColor={Colors.text.mid}
        maxLength={15}
      />

      <Pressable
        style={styles.button}
        onPress={() => router.replace("/(tabs)/main")}
      >
        <Text style={styles.buttonText}>시작하기</Text>
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
    fontWeight: "bold",
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
    marginBottom: 40,
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.point.coral,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
