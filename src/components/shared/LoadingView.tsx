import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export default function LoadingView() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.black.dark,
  },
});
