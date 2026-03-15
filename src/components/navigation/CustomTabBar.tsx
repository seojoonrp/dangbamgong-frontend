import React, { useEffect } from "react";
import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";

import MainIcon from "../../../assets/icons/navigation/main.svg";
import StatsIcon from "../../../assets/icons/navigation/stats.svg";
import FriendsIcon from "../../../assets/icons/navigation/friends.svg";
import SettingsIcon from "../../../assets/icons/navigation/settings.svg";

const ICONS: Record<
  string,
  React.FC<{ color: string; width: number; height: number }>
> = {
  main: MainIcon,
  stats: StatsIcon,
  friends: FriendsIcon,
  settings: SettingsIcon,
};

const TAB_COUNT = 4;
const TAB_BAR_H = 80;
const TAB_BAR_PADDING_H = 16;
const TAB_BAR_GAP = 5;
const INDICATOR_H = 66;
const INDICATOR_RADIUS = 19;
const ICON_SIZE = 20;

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabWidth = (width - TAB_BAR_PADDING_H * 2) / TAB_COUNT;

  const indicatorX = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    indicatorX.value = withTiming(state.index * tabWidth, {
      duration: 500,
      easing: Easing.bezier(0.15, 0.1, 0.15, 1),
    });
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom, height: TAB_BAR_H + insets.bottom },
      ]}
    >
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { width: tabWidth - TAB_BAR_GAP },
          indicatorStyle,
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;
        const IconComponent = ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : undefined}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            {IconComponent && (
              <IconComponent
                width={ICON_SIZE}
                height={ICON_SIZE}
                color={isFocused ? Colors.white : Colors.text.mid}
              />
            )}
            <Animated.Text
              style={[
                styles.label,
                { color: isFocused ? Colors.white : Colors.text.mid },
              ]}
            >
              {label}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.black.mid,
    borderTopWidth: 1,
    borderTopColor: Colors.black.light,
    alignItems: "center",
    position: "relative",
    paddingHorizontal: TAB_BAR_PADDING_H,
  },
  indicator: {
    position: "absolute",
    top: (TAB_BAR_H - INDICATOR_H) / 2,
    left: TAB_BAR_PADDING_H + TAB_BAR_GAP / 2,
    height: INDICATOR_H,
    borderRadius: INDICATOR_RADIUS,
    backgroundColor: "rgba(17, 17, 18, 0.50)",
    borderWidth: 1,
    borderColor: Colors.white,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: TAB_BAR_H,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "A2Z-Medium",
  },
});
