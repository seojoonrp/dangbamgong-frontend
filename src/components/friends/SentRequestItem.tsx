import { useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { formatRelativeTime } from "../../lib/dateUtils";
import { useDeleteFriendRequest } from "../../hooks/useFriends";
import {
  SwipeableCard,
  SwipeActions,
  type SwipeableMethods,
} from "./SwipeableCard";

interface SentRequest {
  requestId: string;
  receiver: {
    userId: string;
    nickname: string;
    tag: string;
  };
  status: "PENDING" | "REJECTED";
  createdAt: string;
}

interface Props {
  request: SentRequest;
  onSuccess: (message: string) => void;
}

export default function SentRequestItem({ request, onSuccess }: Props) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const deleteMutation = useDeleteFriendRequest();

  const isRejected = request.status === "REJECTED";

  const handleDelete = () => {
    swipeableRef.current?.close();
    deleteMutation.mutate(request.requestId, {
      onSuccess: () =>
        onSuccess(
          isRejected ? "요청이 삭제되었습니다." : "요청이 취소되었습니다.",
        ),
    });
  };

  const renderRightActions = () => (
    <SwipeActions
      actions={[
        {
          label: isRejected ? "삭제" : "취소",
          color: Colors.point.coral,
          onPress: handleDelete,
        },
      ]}
    />
  );

  return (
    <SwipeableCard
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      innerStyle={styles.innerContent}
    >
      <View style={styles.info}>
        <Text style={styles.nickname}>{request.receiver.nickname}</Text>
        <View style={styles.subRow}>
          <Text style={styles.time}>
            {formatRelativeTime(request.createdAt)}
          </Text>
          <Text style={styles.tag}>#{request.receiver.tag}</Text>
        </View>
      </View>
      <View style={[styles.statusBtn, isRejected && styles.statusBtnRejected]}>
        {isRejected ? (
          <Text style={styles.statusTextRejected}>거절됨</Text>
        ) : (
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTextPending}>수락</Text>
            <Text style={styles.statusTextPending}>대기중</Text>
          </View>
        )}
      </View>
    </SwipeableCard>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 11,
    fontFamily: "A2Z-Regular",
  },
  tag: {
    color: Colors.text.mid,
    fontSize: 11,
    fontFamily: "A2Z-Regular",
  },
  statusBtn: {
    width: 87,
    height: 90,
    borderTopLeftRadius: 36,
    borderBottomLeftRadius: 36,
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderRightWidth: 0,
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
});
