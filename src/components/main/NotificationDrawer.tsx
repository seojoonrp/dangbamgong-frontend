import { useEffect, useState, useCallback } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import PullToRefreshView from "../shared/PullToRefreshView";
import { queryKeys } from "../../lib/queryKeys";
import { Colors } from "../../constants/colors";
import { Layout } from "../../constants/layout";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllRead,
} from "../../hooks/useNotifications";
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
  const queryClient = useQueryClient();
  const translateX = useSharedValue(SCREEN_WIDTH);
  const scrollOffsetY = useSharedValue(0);
  const [shouldRender, setShouldRender] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteAllRead = useDeleteAllRead();

  const insets = useSafeAreaInsets();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
  }, [queryClient]);

  const notifications = data?.notifications ?? [];
  const hasReadNotifications = notifications.some((n) => n.isRead);
  const hasUnreadNotifications = notifications.some((n) => !n.isRead);

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

  useEffect(() => {
    if (!visible) setSelectedId(null);
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
    setSelectedId((prev) => (prev === item.id ? null : item.id));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteNotification.mutate(selectedId);
      setSelectedId(null);
    }
  };

  const handleDeleteAllRead = () => {
    deleteAllRead.mutate();
    setSelectedId(null);
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isSelected = item.id === selectedId;
    return (
      <Pressable
        style={[styles.notifItem, isSelected && styles.notifItemSelected]}
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
  };

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
        <View style={styles.drawerHeader}>
          <View style={styles.drawerTitleContainer}>
            <BellIcon width={32} height={32} color={Colors.white} />
            <Text style={styles.drawerTitle}>알림</Text>
          </View>
          <Pressable
            style={[
              styles.readAllButton,
              !hasUnreadNotifications && styles.readAllButtonDisabled,
            ]}
            onPress={handleMarkAllAsRead}
            disabled={!hasUnreadNotifications}
          >
            <Text
              style={[
                styles.readAllButtonText,
                !hasUnreadNotifications && styles.readAllButtonTextDisabled,
              ]}
            >
              전체 읽기
            </Text>
          </Pressable>
        </View>
        <PullToRefreshView onRefresh={handleRefresh} scrollOffsetY={scrollOffsetY}>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>알림이 없습니다.</Text>
            }
            onScroll={({ nativeEvent }) => {
              scrollOffsetY.value = nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          />
        </PullToRefreshView>
        <View
          style={[
            styles.bottomSection,
            { paddingBottom: Layout.bottomTabHeight },
          ]}
        >
          <Pressable
            style={[
              styles.bottomButton,
              !selectedId && styles.bottomButtonDisabled,
            ]}
            onPress={handleDelete}
            disabled={!selectedId}
          >
            <Text
              style={[
                styles.bottomButtonText,
                !selectedId && styles.bottomButtonTextDisabled,
              ]}
            >
              삭제
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.bottomButton,
              !hasReadNotifications && styles.bottomButtonDisabled,
            ]}
            onPress={handleDeleteAllRead}
            disabled={!hasReadNotifications}
          >
            <Text
              style={[
                styles.bottomButtonText,
                !hasReadNotifications && styles.bottomButtonTextDisabled,
              ]}
            >
              전체삭제
            </Text>
          </Pressable>
        </View>
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
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 14,
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
  readAllButton: {
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 1,
  },
  readAllButtonDisabled: {
    borderColor: Colors.text.mid,
  },
  readAllButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "A2Z-Medium",
    marginTop: -1,
  },
  readAllButtonTextDisabled: {
    color: Colors.text.mid,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  notifItem: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.black.light,
  },
  notifItemSelected: {
    backgroundColor: Colors.black.light,
    marginHorizontal: -20,
    paddingHorizontal: 20,
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
  bottomSection: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: Colors.black.mid,
    borderTopColor: Colors.black.light,
    borderTopWidth: 1,
  },
  bottomButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: Colors.black.light,
    borderColor: Colors.white,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  bottomButtonDisabled: {
    borderColor: Colors.text.mid,
    opacity: 0.6,
  },
  bottomButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Medium",
    marginTop: 2,
  },
  bottomButtonTextDisabled: {
    color: Colors.text.mid,
  },
});
