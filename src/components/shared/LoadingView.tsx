import { View, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import Spinner from "./Spinner";

export default function LoadingView() {
  return (
    <View style={styles.container}>
      <Spinner />
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
