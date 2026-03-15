import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/colors";
import { formatRelativeTime } from "../../lib/dateUtils";
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from "../../hooks/useFriends";
import { useBlockUser } from "../../hooks/useUser";
import type { ReceivedRequestItem as RequestItemType } from "../../types/dto/friends";

interface Props {
  request: RequestItemType;
  onError: (message: string) => void;
}

export default function ReceivedRequestItem({ request, onError }: Props) {
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const blockMutation = useBlockUser();

  const isPending =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    blockMutation.isPending;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.nickname}>{request.sender.nickname}</Text>
        <Text style={styles.tag}>@{request.sender.tag}</Text>
        <Text style={styles.time}>
          {formatRelativeTime(request.createdAt)}
        </Text>
      </View>

      {isPending ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => acceptMutation.mutate(request.requestId)}
          >
            <Text style={styles.actionText}>수락</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => rejectMutation.mutate(request.requestId)}
          >
            <Text style={styles.actionText}>거절</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.blockActionBtn]}
            onPress={() => blockMutation.mutate(request.sender.userId)}
          >
            <Text style={styles.blockText}>차단</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.black.light,
  },
  info: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  nickname: {
    color: Colors.white,
    fontSize: 15,
  },
  tag: {
    color: Colors.text.mid,
    fontSize: 13,
  },
  time: {
    color: Colors.text.dark,
    fontSize: 11,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptBtn: {
    backgroundColor: Colors.point.coral,
  },
  rejectBtn: {
    backgroundColor: Colors.black.light,
  },
  blockActionBtn: {
    backgroundColor: "transparent",
  },
  actionText: {
    color: Colors.white,
    fontSize: 12,
  },
  blockText: {
    color: Colors.point.coral,
    fontSize: 12,
  },
});
