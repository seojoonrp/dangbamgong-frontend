import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";
import { useNotifications, useMarkAsRead } from "../../hooks/useNotifications";
import { formatRelativeTime } from "../../lib/dateUtils";
import type { NotificationItem } from "../../types/dto/notifications";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BellIcon from "../../../assets/icons/header/notifications.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ visible, onClose }: Props) {
  const translateX = useSharedValue(SCREEN_WIDTH);
  const [shouldRender, setShouldRender] = useState(false);
  const { data } = useNotifications();
  const markAsRead = useMarkAsRead();

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) setShouldRender(true);
    translateX.value = withTiming(
      visible ? SCREEN_WIDTH - DRAWER_WIDTH : SCREEN_WIDTH,
      { duration: 300 },
      (finished) => {
        if (finished && !visible) runOnJS(setShouldRender)(false);
      },
    );
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const progress = (SCREEN_WIDTH - translateX.value) / DRAWER_WIDTH;
    return { opacity: progress * 0.5 };
  });

  const handleNotificationPress = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead.mutate(item.id);
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <Pressable
      style={styles.notifItem}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notifHeader}>
        {!item.isRead && <View style={styles.unreadDot} />}
        <Text style={styles.notifTime}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>
      <Text style={styles.notifBody}>{item.body}</Text>
    </Pressable>
  );

  if (!shouldRender) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[styles.drawer, drawerStyle, { paddingTop: insets.top }]}
      >
        <View style={styles.drawerTitleContainer}>
          <BellIcon width={32} height={32} color={Colors.white} />
          <Text style={styles.drawerTitle}>알림</Text>
        </View>
        <FlatList
          data={data?.notifications ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>알림이 없습니다.</Text>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.black.mid,
  },
  drawerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 0,
  },
  drawerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: "A2Z-SemiBold",
    marginTop: -1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  notifItem: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.black.light,
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
    marginRight: 6,
  },
  notifTime: {
    color: Colors.text.mid,
    fontSize: 13,
    fontFamily: "A2Z-Regular",
  },
  notifBody: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    lineHeight: 20,
  },
  emptyText: {
    color: Colors.text.mid,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
    marginTop: 40,
  },
});
