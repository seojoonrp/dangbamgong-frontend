import { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
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
import { useFriends, useFriendRequests } from "../../../hooks/useFriends";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/queryKeys";

type FriendTab = "list" | "received" | "sent";

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<FriendTab>("list");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "error" as "success" | "error",
  });
  const queryClient = useQueryClient();

  const { data: friendsData, isLoading: friendsLoading } = useFriends();
  const { data: receivedData, isLoading: receivedLoading } =
    useFriendRequests("received");
  const { data: sentData, isLoading: sentLoading } = useFriendRequests("sent");

  const handleError = useCallback((message: string) => {
    setToast({ visible: true, message, type: "error" });
  }, []);

  const handleForceRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.friends.list() });
    queryClient.invalidateQueries({
      queryKey: queryKeys.friends.requests("received"),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.friends.requests("sent"),
    });
  }, [queryClient]);

  const friends = friendsData?.friends ?? [];
  const receivedRequests = receivedData?.requests ?? [];

  const renderContent = () => {
    if (activeTab === "list") {
      if (friendsLoading) return <LoadingView />;
      return (
        <View style={styles.content}>
          <Text style={styles.countText}>{friends.length}명의 친구</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <FriendListItem
                friend={item}
                onError={handleError}
                onForceRefresh={handleForceRefresh}
              />
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                아직 친구가 없어요. 친구를 추가해보세요!
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
          <FlatList
            data={receivedRequests}
            keyExtractor={(item) => item.requestId}
            renderItem={({ item }) => (
              <ReceivedRequestItem request={item} onError={handleError} />
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
        <FlatList
          data={sentData?.requests ?? []}
          keyExtractor={(item: any) => item.requestId}
          renderItem={({ item }: { item: any }) => (
            <SentRequestItem request={item} />
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
            <PlusIcon width={12} height={12} color={Colors.white} />
          </Pressable>
        }
      />

      <View style={styles.tabs}>
        {(
          [
            { key: "list", label: "친구 목록" },
            { key: "received", label: "받은 요청" },
            { key: "sent", label: "보낸 요청" },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
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
                receivedRequests.length > 0 &&
                activeTab !== "received" && <View style={styles.tabDot} />}
            </View>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </View>

      {renderContent()}

      <Toast
        message={toast.message}
        type={toast.type}
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
    height: 28,
    borderRadius: 12,
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
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
    bottom: -13.6,
    width: 96,
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
    textAlign: "center",
    marginTop: 40,
  },
});
