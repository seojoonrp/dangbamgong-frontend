import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import Toast from "../../../components/shared/Toast";
import { useDebounce } from "../../../hooks/useDebounce";
import { useSearchUsers, useBlockUser, useUnblockUser } from "../../../hooks/useUser";
import { useSendFriendRequest } from "../../../hooks/useFriends";
import { ApiError } from "../../../api/client";
import type { UserSearchItem } from "../../../types/dto/users";

export default function FriendSearchScreen() {
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const debouncedQuery = useDebounce(query.trim(), 1000);
  const { data, isLoading } = useSearchUsers(debouncedQuery);
  const sendRequest = useSendFriendRequest();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest.mutateAsync(userId);
      showToast("친구 요청을 보냈습니다.", "success");
    } catch (e) {
      if (e instanceof ApiError) {
        switch (e.code) {
          case "REQUEST_ALREADY_SENT":
            showToast("이미 요청을 보냈습니다.", "error");
            break;
          case "ALREADY_FRIENDS":
            showToast("이미 친구입니다.", "error");
            break;
          case "BLOCKED":
            showToast("차단된 유저입니다.", "error");
            break;
          default:
            showToast("요청에 실패했습니다.", "error");
        }
      }
    }
  };

  const handleBlock = (userId: string, nickname: string) => {
    Alert.alert("차단", `${nickname}님을 차단하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () => blockUser.mutate(userId),
      },
    ]);
  };

  const handleUnblock = async (userId: string) => {
    try {
      await unblockUser.mutateAsync(userId);
      showToast("차단 해제되었습니다.", "success");
    } catch {
      showToast("차단 해제에 실패했습니다.", "error");
    }
  };

  const users = [...(data?.users ?? [])].sort((a, b) =>
    a.tag.localeCompare(b.tag),
  );

  const renderItem = ({ item }: { item: UserSearchItem }) => (
    <View
      style={[
        styles.userItem,
        item.isBlocked && styles.blockedItem,
      ]}
    >
      <View style={styles.userInfo}>
        <Text style={styles.nickname}>{item.nickname}</Text>
        <Text style={styles.tag}>@{item.tag}</Text>
      </View>

      {item.isBlocked ? (
        <Pressable
          style={styles.unblockBtn}
          onPress={() => handleUnblock(item.userId)}
        >
          <Text style={styles.unblockText}>차단 해제</Text>
        </Pressable>
      ) : (
        <View style={styles.itemActions}>
          <Pressable
            style={styles.requestBtn}
            onPress={() => handleSendRequest(item.userId)}
            disabled={sendRequest.isPending}
          >
            {sendRequest.isPending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.requestText}>요청</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => handleBlock(item.userId, item.nickname)}
          >
            <Text style={styles.blockText}>...</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="친구 추가" />

      <TextInput
        style={styles.searchInput}
        placeholder="태그로 친구를 검색하세요..."
        placeholderTextColor={Colors.text.mid}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
      />
      <Text style={styles.hint}>
        태그는 [설정] &gt; [프로필]에서 확인할 수 있습니다
      </Text>

      {isLoading && debouncedQuery ? (
        <ActivityIndicator
          color={Colors.white}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.userId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            debouncedQuery ? (
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            ) : null
          }
        />
      )}

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
  searchInput: {
    height: 44,
    backgroundColor: Colors.black.mid,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.white,
    fontSize: 15,
    marginTop: 12,
    marginHorizontal: 16,
  },
  hint: {
    color: Colors.text.mid,
    fontSize: 12,
    marginTop: 8,
    marginHorizontal: 16,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.black.light,
  },
  blockedItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.point.coral,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nickname: {
    color: Colors.white,
    fontSize: 15,
  },
  tag: {
    color: Colors.text.mid,
    fontSize: 13,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  requestBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: Colors.point.coral,
  },
  requestText: {
    color: Colors.white,
    fontSize: 13,
  },
  blockText: {
    color: Colors.text.mid,
    fontSize: 18,
    fontFamily: "A2Z-Bold",
  },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.point.coral,
  },
  unblockText: {
    color: Colors.point.coral,
    fontSize: 13,
  },
  emptyText: {
    color: Colors.text.mid,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
