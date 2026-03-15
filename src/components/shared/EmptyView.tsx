import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

interface Props {
  message: string;
}

export default function EmptyView({ message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  text: {
    color: Colors.text.light,
    fontSize: 15,
    textAlign: "center",
  },
});
