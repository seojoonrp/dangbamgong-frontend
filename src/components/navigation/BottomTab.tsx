import React, { useEffect } from "react";
import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";

import MainIcon from "../../../assets/icons/navigation/main.svg";
import StatsIcon from "../../../assets/icons/navigation/stats.svg";
import FriendsIcon from "../../../assets/icons/navigation/friends.svg";
import SettingsIcon from "../../../assets/icons/navigation/settings.svg";
import { Layout } from "../../constants/layout";

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
const PADDING_HOR = 16;
const TAB_GAP = 5;
const PADDING_TOP = 10;
const INDICATOR_HEIGHT = 66;
const ICON_SIZE = 20;

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const tabWidth = (width - PADDING_HOR * 2) / TAB_COUNT;

  const indicatorX = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    indicatorX.value = withTiming(state.index * tabWidth, {
      duration: 700,
      easing: Easing.bezier(0.1, 1, 0.4, 1),
    });
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View style={[styles.container, { height: Layout.bottomTabHeight }]}>
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { width: tabWidth - TAB_GAP },
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingTop: PADDING_TOP,
    paddingHorizontal: PADDING_HOR,
    backgroundColor: Colors.black.mid,
    borderTopWidth: 1,
    borderTopColor: Colors.black.light,
  },
  indicator: {
    position: "absolute",
    top: PADDING_TOP,
    left: PADDING_HOR + TAB_GAP / 2,
    height: INDICATOR_HEIGHT,
    borderRadius: 19,
    backgroundColor: "rgba(17, 17, 18, 0.50)",
    borderWidth: 1,
    borderColor: Colors.white,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: INDICATOR_HEIGHT,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "A2Z-Regular",
  },
});
