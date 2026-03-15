import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/shared/ScreenHeader";

export default function StatDetailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="세부 공백 통계" />
      <View style={styles.content}>
        <Text style={styles.placeholder}>세부 공백 통계</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
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
