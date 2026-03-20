import { forwardRef, type ReactNode, type RefObject } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { Colors } from "../../constants/colors";

export type { SwipeableMethods };

interface SwipeableCardProps {
  height?: number;
  borderRadius?: number;
  borderColor?: string;
  renderRightActions: () => ReactNode;
  children: ReactNode;
  innerStyle?: ViewStyle;
}

export const SwipeableCard = forwardRef<SwipeableMethods, SwipeableCardProps>(
  function SwipeableCard(
    {
      height = 90,
      borderRadius = 26,
      borderColor,
      renderRightActions,
      children,
      innerStyle,
    },
    ref,
  ) {
    return (
      <View
        style={[
          styles.containerOuter,
          { height, borderRadius },
          borderColor ? { borderColor } : undefined,
        ]}
      >
        <ReanimatedSwipeable
          ref={ref as RefObject<SwipeableMethods | null>}
          renderRightActions={renderRightActions}
          overshootRight={false}
        >
          <View style={[styles.containerInner, innerStyle]}>{children}</View>
        </ReanimatedSwipeable>
      </View>
    );
  },
);

export interface SwipeAction {
  label: string;
  color: string;
  onPress: () => void;
}

export function SwipeActions({ actions }: { actions: SwipeAction[] }) {
  return (
    <View style={styles.swipeActions}>
      {actions.map((action, i) => (
        <Pressable
          key={i}
          style={[styles.swipeBtn, { backgroundColor: action.color }]}
          onPress={action.onPress}
        >
          <Text style={styles.swipeBtnText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  containerOuter: {
    borderWidth: 1,
    borderColor: Colors.text.dark,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  containerInner: {
    height: "100%",
    backgroundColor: "rgba(22, 22, 24, 1)",
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  swipeBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
  },
  swipeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-Regular",
  },
});
