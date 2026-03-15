import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import TabHeader from "../../../components/navigation/TabHeader";
import StatsIcon from "../../../../assets/icons/header/stats.svg";
import { Layout } from "../../../constants/layout";

export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TabHeader icon={StatsIcon} title="Statistics" />
      <View style={styles.content}>
        <Text style={styles.placeholder}>공백 그래프 및 캘린더 영역</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    paddingBottom: Layout.bottomTabHeight,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    color: Colors.text.light,
    fontSize: 16,
  },
});
