import { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Colors } from "../../constants/colors";
import { formatRelativeTime } from "../../lib/dateUtils";
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from "../../hooks/useFriends";
import { useBlockUser } from "../../hooks/useUser";
import type { ReceivedRequestItem as RequestItemType } from "../../types/dto/friends";
import {
  SwipeableCard,
  SwipeActions,
  type SwipeableMethods,
} from "./SwipeableCard";

interface Props {
  request: RequestItemType;
  onError: (message: string) => void;
}

export default function ReceivedRequestItem({ request, onError }: Props) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const blockMutation = useBlockUser();

  const handleAccept = () => {
    acceptMutation.mutate(request.requestId);
  };

  const handleReject = () => {
    swipeableRef.current?.close();
    rejectMutation.mutate(request.requestId);
  };

  const handleBlock = () => {
    swipeableRef.current?.close();
    Alert.alert("차단", `${request.sender.nickname}님을 차단하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () => blockMutation.mutate(request.sender.userId),
      },
    ]);
  };

  const renderRightActions = () => (
    <SwipeActions
      actions={[
        { label: "거절", color: Colors.point.coral, onPress: handleReject },
        { label: "차단", color: Colors.point.strong, onPress: handleBlock },
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
        <Text style={styles.nickname}>{request.sender.nickname}</Text>
        <View style={styles.subRow}>
          <Text style={styles.time}>
            {formatRelativeTime(request.createdAt)}
          </Text>
          <Text style={styles.tag}>#{request.sender.tag}</Text>
        </View>
      </View>
      <Pressable
        style={styles.acceptBtn}
        onPress={handleAccept}
        disabled={acceptMutation.isPending}
      >
        <Text style={styles.acceptText}>수락</Text>
      </Pressable>
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
  acceptBtn: {
    width: 87,
    height: 90,
    borderTopLeftRadius: 36,
    borderBottomLeftRadius: 36,
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.text.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-Regular",
  },
});
