import { useEffect } from "react";
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
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";
import {
  useNotifications,
  useMarkAsRead,
} from "../../hooks/useNotifications";
import { formatRelativeTime } from "../../lib/dateUtils";
import type { NotificationItem } from "../../types/dto/notifications";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ visible, onClose }: Props) {
  const translateX = useSharedValue(SCREEN_WIDTH);
  const { data } = useNotifications();
  const markAsRead = useMarkAsRead();

  useEffect(() => {
    translateX.value = withTiming(
      visible ? SCREEN_WIDTH - DRAWER_WIDTH : SCREEN_WIDTH,
      { duration: 300 },
    );
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const progress =
      (SCREEN_WIDTH - translateX.value) / DRAWER_WIDTH;
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

  if (!visible && translateX.value >= SCREEN_WIDTH) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.drawer, drawerStyle]}>
        <Text style={styles.drawerTitle}>알림</Text>
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
    paddingTop: 60,
  },
  drawerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: "A2Z-SemiBold",
    paddingHorizontal: 20,
    marginBottom: 16,
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
    fontSize: 12,
  },
  notifBody: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: Colors.text.mid,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
