import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export default function StatsText() {
  return (
    <View style={styles.container}>
      <Text style={styles.main}>총 공백 2시간 32분</Text>
      <Text style={styles.sub}>
        잠에 든 209명 중 <Text style={styles.highlight}>103번째로 긴 공백</Text>
        을 보냈어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 28,
    alignItems: "center",
  },
  main: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
  },
  sub: {
    color: Colors.text.mid,
    fontSize: 12,
    marginTop: 3,
  },
  highlight: {
    color: Colors.point.coral,
    fontFamily: "A2Z-Medium",
  },
});
