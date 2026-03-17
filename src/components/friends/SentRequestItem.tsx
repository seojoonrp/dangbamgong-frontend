import { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
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
  const swipeableRef = useRef<Swipeable>(null);
  const deleteMutation = useDeleteFriendRequest();

  const isRejected = request.status === "rejected";

  const handleDelete = () => {
    swipeableRef.current?.close();
    deleteMutation.mutate(request.requestId);
  };

  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      <Pressable style={[styles.swipeBtn, styles.cancelBtn]} onPress={handleDelete}>
        <Text style={styles.swipeBtnText}>{isRejected ? "삭제" : "취소"}</Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.nickname}>{request.receiver.nickname}</Text>
          <View style={styles.subRow}>
            <Text style={styles.time}>
              {formatRelativeTime(request.createdAt)}
            </Text>
            <Text style={styles.tag}>#{request.receiver.tag}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBtn,
            isRejected && styles.statusBtnRejected,
          ]}
        >
          {isRejected ? (
            <Text style={styles.statusTextRejected}>거절됨</Text>
          ) : (
            <View style={styles.statusTextWrap}>
              <Text style={styles.statusTextPending}>수락</Text>
              <Text style={styles.statusTextPending}>대기중</Text>
            </View>
          )}
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 85,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.text.dark,
    backgroundColor: "rgba(22, 22, 24, 0.5)",
    paddingLeft: 26,
    marginHorizontal: 8,
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
  statusBtn: {
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
  statusBtnRejected: {
    backgroundColor: Colors.black.light,
  },
  statusTextWrap: {
    alignItems: "center",
  },
  statusTextPending: {
    color: Colors.text.mid,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    lineHeight: 18,
    textAlign: "center",
  },
  statusTextRejected: {
    color: Colors.point.coral,
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  swipeBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
  },
  cancelBtn: {
    backgroundColor: Colors.point.coral,
  },
  swipeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-Regular",
  },
});
