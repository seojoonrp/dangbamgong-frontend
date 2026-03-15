import { Pressable, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.selected]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    borderColor: Colors.point.coral,
  },
  text: {
    color: Colors.white,
    fontSize: 12.5,
    fontFamily: "A2Z-Regular",
    marginTop: -1,
  },
  selectedText: {
    color: Colors.point.coral,
  },
});
