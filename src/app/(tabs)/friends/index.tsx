import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  Easing,
} from "react-native-reanimated";
import PullToRefreshView from "../../../components/shared/PullToRefreshView";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import TabHeader from "../../../components/navigation/TabHeader";
import FriendListItem from "../../../components/friends/FriendListItem";
import ReceivedRequestItem from "../../../components/friends/ReceivedRequestItem";
import SentRequestItem from "../../../components/friends/SentRequestItem";
import Toast from "../../../components/shared/Toast";
import LoadingView from "../../../components/shared/LoadingView";
import FriendsIcon from "../../../../assets/icons/header/friends.svg";
import PlusIcon from "../../../../assets/icons/shared/plus.svg";
import {
  useFriends,
  useReceivedFriendRequests,
  useSentFriendRequests,
  useUnreadRequestCount,
  useMarkRequestsAsRead,
} from "../../../hooks/useFriends";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/queryKeys";

type FriendTab = "list" | "received" | "sent";

const TABS = [
  { key: "list", label: "친구 목록" },
  { key: "received", label: "받은 요청" },
  { key: "sent", label: "보낸 요청" },
] as const;

const TAB_COUNT = TABS.length;
const TABS_PADDING_HOR = 8;
const INDICATOR_WIDTH = 96;

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<FriendTab>("list");
  const { width: screenWidth } = useWindowDimensions();
  const tabWidth = (screenWidth - TABS_PADDING_HOR * 2) / TAB_COUNT;

  const tabIndex = TABS.findIndex((t) => t.key === activeTab);
  const indicatorX = useSharedValue(
    tabIndex * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2,
  );

  useEffect(() => {
    const idx = TABS.findIndex((t) => t.key === activeTab);
    indicatorX.value = withTiming(
      idx * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2,
      { duration: 700, easing: Easing.bezier(0.1, 1, 0.4, 1) },
    );
  }, [activeTab, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const [toast, setToast] = useState({
    visible: false,
    message: "",
  });
  const queryClient = useQueryClient();

  const { data: friendsData, isLoading: friendsLoading } = useFriends();
  const { data: receivedData, isLoading: receivedLoading } =
    useReceivedFriendRequests();
  const { data: sentData, isLoading: sentLoading } = useSentFriendRequests();
  const { data: unreadData } = useUnreadRequestCount();
  const { mutate: markAsRead } = useMarkRequestsAsRead();

  const unreadCount = unreadData?.count ?? 0;

  useEffect(() => {
    if (activeTab === "received") {
      markAsRead();
    }
  }, [activeTab]);

  const handleError = useCallback((message: string) => {
    setToast({ visible: true, message });
  }, []);

  const handleSuccess = useCallback((message: string) => {
    setToast({ visible: true, message });
  }, []);

  const scrollOffsetY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      "worklet";
      scrollOffsetY.value = event.contentOffset.y;
    },
  });

  const handleTabChange = useCallback((tab: FriendTab) => {
    scrollOffsetY.value = 0;
    setActiveTab(tab);
  }, [scrollOffsetY]);

  const handleForceRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.friends.list() });
    queryClient.invalidateQueries({
      queryKey: queryKeys.friends.requests("received"),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.friends.requests("sent"),
    });
  }, [queryClient]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.friends.list() }),
      queryClient.refetchQueries({ queryKey: queryKeys.friends.requests("received") }),
      queryClient.refetchQueries({ queryKey: queryKeys.friends.requests("sent") }),
    ]);
  }, [queryClient]);

  const friends = friendsData?.friends ?? [];
  const receivedRequests = receivedData?.requests ?? [];

  const renderContent = () => {
    if (activeTab === "list") {
      if (friendsLoading) return <LoadingView />;
      return (
        <View style={styles.content}>
          <Text style={styles.countText}>{friends.length}명의 친구</Text>
          <Animated.FlatList
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            data={friends}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <FriendListItem
                friend={item}
                onError={handleError}
                onSuccess={handleSuccess}
                onForceRefresh={handleForceRefresh}
              />
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                아직 친구가 없어요.{"\n"}+ 를 눌러 친구를 추가해보세요!
              </Text>
            }
          />
        </View>
      );
    }

    if (activeTab === "received") {
      if (receivedLoading) return <LoadingView />;
      return (
        <View style={styles.content}>
          <Text style={styles.countText}>
            받은 요청 {receivedRequests.length}개
          </Text>
          <Animated.FlatList
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            data={receivedRequests}
            keyExtractor={(item) => item.requestId}
            renderItem={({ item }) => (
              <ReceivedRequestItem
                request={item}
                onError={handleError}
                onSuccess={handleSuccess}
              />
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>받은 요청이 없습니다.</Text>
            }
          />
        </View>
      );
    }

    // sent
    if (sentLoading) return <LoadingView />;
    return (
      <View style={styles.content}>
        <Text style={styles.countText}>
          보낸 요청 {(sentData?.requests ?? []).length}개
        </Text>
        <Animated.FlatList
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          data={sentData?.requests ?? []}
          keyExtractor={(item) => item.requestId}
          renderItem={({ item }) => (
            <SentRequestItem request={item} onSuccess={handleSuccess} />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>보낸 요청이 없습니다.</Text>
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TabHeader
        icon={FriendsIcon}
        title="Friends"
        rightContent={
          <Pressable
            onPress={() => router.push("/(tabs)/friends/search")}
            style={styles.addButton}
          >
            <PlusIcon width={14} height={14} color={Colors.white} />
          </Pressable>
        }
      />

      <View style={styles.tabs}>
        <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => handleTabChange(tab.key)}
          >
            <View style={styles.tabLabelRow}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
              {tab.key === "received" &&
                unreadCount > 0 &&
                activeTab !== "received" && <View style={styles.tabDot} />}
            </View>
          </Pressable>
        ))}
      </View>

      <PullToRefreshView onRefresh={handleRefresh} scrollOffsetY={scrollOffsetY}>
        {renderContent()}
      </PullToRefreshView>

      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    paddingBottom: Layout.bottomTabHeight,
  },
  addButton: {
    width: 64,
    height: 32,
    borderRadius: 14,
    backgroundColor: Colors.text.dark,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors.white,
    borderWidth: 1,
    marginRight: 6,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.black.light,
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tabText: {
    color: Colors.disabled,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
  },
  activeTabText: {
    color: Colors.white,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  tabIndicator: {
    position: "absolute",
    bottom: -14.3,
    left: TABS_PADDING_HOR,
    width: INDICATOR_WIDTH,
    height: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
  },
  countText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 11,
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 11,
  },
  emptyText: {
    color: Colors.text.mid,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 200,
  },
});
