import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export default function ActivityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>활동 관리</Text>
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
