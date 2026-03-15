import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>프로필 (닉네임, 태그, 가입 경로)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    color: Colors.text.light,
    fontSize: 16,
  },
});
