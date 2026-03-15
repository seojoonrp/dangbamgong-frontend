import { View, Text, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import { useBlockList, useUnblockUser } from "../../../hooks/useUser";
import { formatRelativeTime } from "../../../lib/dateUtils";
import LoadingView from "../../../components/shared/LoadingView";
import type { BlockItem } from "../../../types/dto/users";

export default function BlockListScreen() {
  const { data, isLoading } = useBlockList();
  const unblockMutation = useUnblockUser();

  const handleUnblock = (user: BlockItem) => {
    Alert.alert(
      "차단 해제",
      `${user.nickname}님의 차단을 해제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "해제",
          onPress: () => unblockMutation.mutate(user.userId),
        },
      ],
    );
  };

  if (isLoading) return <LoadingView />;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="차단 목록" />

      <FlatList
        data={data?.blocks ?? []}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemInfo}>
              <Text style={styles.nickname}>{item.nickname}</Text>
              <Text style={styles.tag}>
                @{item.tag} | {formatRelativeTime(item.blockedAt)}
              </Text>
            </View>
            <Pressable
              style={styles.unblockBtn}
              onPress={() => handleUnblock(item)}
            >
              <Text style={styles.unblockText}>해제</Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>차단한 유저가 없습니다.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.black.light,
  },
  itemInfo: {
    flex: 1,
  },
  nickname: {
    color: Colors.white,
    fontSize: 15,
    marginBottom: 2,
  },
  tag: {
    color: Colors.text.mid,
    fontSize: 12,
  },
  unblockBtn: {
    paddingHorizontal: 14,
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
