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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.black.light,
    marginRight: 8,
  },
  selected: {
    backgroundColor: Colors.point.coral,
  },
  text: {
    color: Colors.text.light,
    fontSize: 14,
  },
  selectedText: {
    color: Colors.white,
  },
});
