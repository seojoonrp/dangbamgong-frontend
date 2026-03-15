import { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Colors } from "../../constants/colors";
import { formatRelativeTime } from "../../lib/dateUtils";
import { useNudgeFriend, useRemoveFriend } from "../../hooks/useFriends";
import { useBlockUser } from "../../hooks/useUser";
import { useNudgeCooldown } from "../../hooks/useNudgeCooldown";
import { ApiError } from "../../api/client";
import type { FriendItem } from "../../types/dto/friends";

interface Props {
  friend: FriendItem;
  onError: (message: string) => void;
  onForceRefresh: () => void;
}

export default function FriendListItem({
  friend,
  onError,
  onForceRefresh,
}: Props) {
  const nudgeMutation = useNudgeFriend();
  const removeMutation = useRemoveFriend();
  const blockMutation = useBlockUser();
  const { canNudge, recordNudge, getRemainingSeconds } = useNudgeCooldown();
  const [remainingSec, setRemainingSec] = useState(0);

  const nudgeAvailable = canNudge(friend.userId);

  // 쿨다운 타이머
  useEffect(() => {
    if (nudgeAvailable) {
      setRemainingSec(0);
      return;
    }
    const update = () => setRemainingSec(getRemainingSeconds(friend.userId));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nudgeAvailable, friend.userId]);

  const handleNudge = async () => {
    if (!nudgeAvailable) return;
    try {
      await nudgeMutation.mutateAsync(friend.userId);
      recordNudge(friend.userId);
    } catch (e) {
      if (e instanceof ApiError && e.code === "FRIEND_NOT_IN_VOID") {
        onError("공백 상태에 있지 않은 친구입니다.");
        onForceRefresh();
      }
    }
  };

  const handleRemove = () => {
    Alert.alert("친구 삭제", `${friend.nickname}님을 삭제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await removeMutation.mutateAsync(friend.userId);
          } catch (e) {
            if (e instanceof ApiError && e.code === "NOT_FRIENDS") {
              onError("친구가 아닌 유저입니다.");
              onForceRefresh();
            }
          }
        },
      },
    ]);
  };

  const handleBlock = () => {
    Alert.alert("차단", `${friend.nickname}님을 차단하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () => blockMutation.mutate(friend.userId),
      },
    ]);
  };

  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      <Pressable
        style={[styles.swipeBtn, styles.deleteBtn]}
        onPress={handleRemove}
      >
        <Text style={styles.swipeBtnText}>삭제</Text>
      </Pressable>
      <Pressable
        style={[styles.swipeBtn, styles.blockBtn]}
        onPress={handleBlock}
      >
        <Text style={styles.swipeBtnText}>차단</Text>
      </Pressable>
    </View>
  );

  const formatNudgeTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.nickname}>{friend.nickname}</Text>
          <Text style={styles.status}>
            {friend.isInVoid
              ? "공백 중"
              : `마지막 공백: ${formatRelativeTime(friend.lastVoidEndedAt)}`}
          </Text>
        </View>

        {friend.isInVoid && (
          <Pressable
            style={[
              styles.nudgeBtn,
              !nudgeAvailable && styles.nudgeBtnDisabled,
            ]}
            onPress={handleNudge}
            disabled={!nudgeAvailable || nudgeMutation.isPending}
          >
            <Text
              style={[
                styles.nudgeText,
                !nudgeAvailable && styles.nudgeTextDisabled,
              ]}
            >
              {nudgeAvailable
                ? "알림"
                : formatNudgeTime(remainingSec)}
            </Text>
          </Pressable>
        )}
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
  },
  nickname: {
    color: Colors.white,
    fontSize: 15,
    marginBottom: 2,
  },
  status: {
    color: Colors.text.mid,
    fontSize: 12,
  },
  nudgeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: Colors.point.coral,
  },
  nudgeBtnDisabled: {
    backgroundColor: Colors.black.light,
  },
  nudgeText: {
    color: Colors.white,
    fontSize: 13,
  },
  nudgeTextDisabled: {
    color: Colors.text.mid,
  },
  swipeActions: {
    flexDirection: "row",
  },
  swipeBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
  },
  deleteBtn: {
    backgroundColor: Colors.text.dark,
  },
  blockBtn: {
    backgroundColor: Colors.point.coral,
  },
  swipeBtnText: {
    color: Colors.white,
    fontSize: 13,
  },
});
