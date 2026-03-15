import { View, Text, Pressable, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Colors } from "../../constants/colors";
import { formatRelativeTime } from "../../lib/dateUtils";
import { useDeleteFriendRequest } from "../../hooks/useFriends";

interface SentRequest {
  requestId: string;
  receiver: {
    userId: string;
    nickname: string;
    tag: string;
  };
  status: "pending" | "rejected";
  createdAt: string;
}

interface Props {
  request: SentRequest;
}

export default function SentRequestItem({ request }: Props) {
  const deleteMutation = useDeleteFriendRequest();

  const isRejected = request.status === "rejected";

  const renderRightActions = () => (
    <Pressable
      style={styles.swipeBtn}
      onPress={() => deleteMutation.mutate(request.requestId)}
    >
      <Text style={styles.swipeBtnText}>
        {isRejected ? "삭제" : "취소"}
      </Text>
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.nickname}>{request.receiver.nickname}</Text>
          <Text style={styles.tag}>@{request.receiver.tag}</Text>
          <Text style={styles.time}>
            {formatRelativeTime(request.createdAt)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isRejected && styles.rejectedBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isRejected && styles.rejectedText,
            ]}
          >
            {isRejected ? "거절됨" : "수락 대기 중"}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.black.dark,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Colors.black.light,
  },
  rejectedBadge: {
    backgroundColor: "transparent",
  },
  statusText: {
    color: Colors.text.mid,
    fontSize: 12,
  },
  rejectedText: {
    color: Colors.point.coral,
  },
  swipeBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    backgroundColor: Colors.point.coral,
  },
  swipeBtnText: {
    color: Colors.white,
    fontSize: 13,
  },
});
