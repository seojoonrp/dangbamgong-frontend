import { View, Text, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import { useBlockList, useUnblockUser } from "../../../hooks/useUser";
import { formatRelativeTime } from "../../../lib/dateUtils";
import LoadingView from "../../../components/shared/LoadingView";
import { SwipeableCard } from "../../../components/friends/SwipeableCard";
import type { BlockItem } from "../../../types/dto/users";

export default function BlockListScreen() {
  const { data, isLoading } = useBlockList();
  const unblockMutation = useUnblockUser();
  const blocks = data?.blocks ?? [];

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
      <Text style={styles.countText}>차단한 유저 {blocks.length}명</Text>
      <FlatList
        data={blocks}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <SwipeableCard
            renderRightActions={() => null}
            innerStyle={styles.innerContent}
          >
            <View style={styles.info}>
              <Text style={styles.nickname}>{item.nickname}</Text>
              <View style={styles.subRow}>
                <Text style={styles.time}>
                  {formatRelativeTime(item.blockedAt)} 차단함
                </Text>
                <Text style={styles.tag}>#{item.tag}</Text>
              </View>
            </View>
            <Pressable
              style={styles.actionBtn}
              onPress={() => handleUnblock(item)}
              disabled={unblockMutation.isPending}
            >
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionText}>차단</Text>
                <Text style={styles.actionText}>해제</Text>
              </View>
            </Pressable>
          </SwipeableCard>
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  countText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 11,
  },
  listContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 11,
  },
  innerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 26,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  nickname: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: "A2Z-Medium",
    marginBottom: 4,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  time: {
    color: Colors.point.coral,
    fontSize: 10,
    fontFamily: "A2Z-Regular",
  },
  tag: {
    color: Colors.text.mid,
    fontSize: 10,
    fontFamily: "A2Z-Regular",
  },
  actionBtn: {
    width: 87,
    height: 85,
    borderTopLeftRadius: 36,
    borderBottomLeftRadius: 36,
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.text.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextWrap: {
    alignItems: "center",
  },
  actionText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    lineHeight: 18,
    textAlign: "center",
  },
  emptyText: {
    color: Colors.text.mid,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
