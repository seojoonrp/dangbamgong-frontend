import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import SearchResultItem from "../../../components/friends/SearchResultItem";
import Toast from "../../../components/shared/Toast";
import SearchIcon from "../../../../assets/icons/shared/search.svg";
import { useDebounce } from "../../../hooks/useDebounce";
import { useSearchUsers, useUnblockUser } from "../../../hooks/useUser";
import { useSendFriendRequest } from "../../../hooks/useFriends";
import { ApiError } from "../../../api/client";
import type { UserSearchItem } from "../../../types/dto/users";

export default function FriendSearchScreen() {
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
  });
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());
  const [unblockedIds, setUnblockedIds] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(query.trim(), 1000);
  const { data, isLoading } = useSearchUsers(debouncedQuery);
  const sendRequest = useSendFriendRequest();
  const unblockUser = useUnblockUser();

  const showToast = (message: string) => {
    setToast({ visible: true, message });
  };

  const handleChangeText = (text: string) => {
    setQuery(text.toUpperCase());
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest.mutateAsync(userId);
      setSentRequestIds((prev) => new Set(prev).add(userId));
      showToast("친구 요청을 보냈습니다.");
    } catch (e) {
      if (e instanceof ApiError) {
        switch (e.code) {
          case "REQUEST_ALREADY_SENT":
            showToast("이미 요청을 보냈습니다.");
            break;
          case "ALREADY_FRIENDS":
            showToast("이미 친구입니다.");
            break;
          case "BLOCKED":
            showToast("차단된 유저입니다.");
            break;
          default:
            showToast("요청에 실패했습니다.");
        }
      }
    }
  };

  const handleUnblock = async (userId: string) => {
    setUnblockedIds((prev) => new Set(prev).add(userId));
    try {
      await unblockUser.mutateAsync(userId);
      showToast("차단 해제되었습니다.");
    } catch {
      setUnblockedIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      showToast("차단 해제에 실패했습니다.");
    }
  };

  const users = [...(data?.users ?? [])]
    .map((u) => ({
      ...u,
      hasSentRequest: u.hasSentRequest || sentRequestIds.has(u.userId),
      isBlocked: u.isBlocked && !unblockedIds.has(u.userId),
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag));

  const hasQuery = debouncedQuery.length > 0;
  const hasResults = users.length > 0;

  const renderItem = ({ item }: { item: UserSearchItem }) => (
    <SearchResultItem
      user={item}
      onSendRequest={handleSendRequest}
      onUnblock={handleUnblock}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="친구 추가" />

      <View style={styles.searchBox}>
        <SearchIcon
          width={18}
          height={18}
          color={Colors.text.mid}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="태그로 친구를 검색하세요..."
          placeholderTextColor={Colors.text.mid}
          value={query}
          onChangeText={handleChangeText}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      {isLoading && hasQuery ? (
        <ActivityIndicator color={Colors.white} style={{ marginTop: 40 }} />
      ) : hasQuery && hasResults ? (
        <>
          <Text style={styles.resultCount}>검색 결과 {users.length}개</Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item.userId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </>
      ) : hasQuery && !hasResults ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.hintText}>
            <Text style={styles.hintBold}>[설정] → [프로필]</Text>
            에서{"\n"}태그를 확인할 수 있어요!
          </Text>
        </View>
      )}

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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.text.mid,
    marginHorizontal: 8,
    marginTop: 8,
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    padding: 0,
  },
  resultCount: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    marginLeft: 17,
    marginTop: 18,
    marginBottom: 8,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: Colors.text.mid,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
  },
  hintText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  hintBold: {
    fontFamily: "A2Z-SemiBold",
  },
});
