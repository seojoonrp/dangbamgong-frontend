import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { Colors } from "../../constants/colors";
import { formatRelativeTime } from "../../lib/dateUtils";
import { useNudgeFriend, useRemoveFriend } from "../../hooks/useFriends";
import { useBlockUser } from "../../hooks/useUser";
import { useNudgeCooldown } from "../../hooks/useNudgeCooldown";
import { ApiError } from "../../api/client";
import type { FriendItem } from "../../types/dto/friends";
import SendIcon from "../../../assets/icons/shared/send.svg";
import { SwipeableCard, SwipeActions } from "./SwipeableCard";

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
  const swipeableRef = useRef<SwipeableMethods>(null);
  const nudgeMutation = useNudgeFriend();
  const removeMutation = useRemoveFriend();
  const blockMutation = useBlockUser();
  const { canNudge, recordNudge, getRemainingSeconds } = useNudgeCooldown();
  const [remainingSec, setRemainingSec] = useState(0);

  const nudgeAvailable = canNudge(friend.userId);

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
    swipeableRef.current?.close();
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
    swipeableRef.current?.close();
    Alert.alert("차단", `${friend.nickname}님을 차단하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () => blockMutation.mutate(friend.userId),
      },
    ]);
  };

  const formatNudgeTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const renderRightActions = () => (
    <SwipeActions
      actions={[
        { label: "삭제", color: Colors.point.coral, onPress: handleRemove },
        { label: "차단", color: Colors.point.strong, onPress: handleBlock },
      ]}
    />
  );

  if (friend.isInVoid) {
    return (
      <View style={styles.voidWrapper}>
        <View style={styles.voidIndicator} />
        <View style={styles.voidOuterContainer}>
          <View style={styles.voidClipContainer}>
            <ReanimatedSwipeable
              ref={swipeableRef}
              renderRightActions={renderRightActions}
              overshootRight={false}
            >
              <View style={styles.voidInnerContainer}>
                <View style={styles.info}>
                  <Text style={styles.nickname}>{friend.nickname}</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, styles.statusDotActive]} />
                    <Text style={[styles.statusText, styles.statusTextActive]}>
                      공백 중
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={[
                    styles.nudgeBtn,
                    nudgeAvailable
                      ? styles.nudgeBtnActive
                      : styles.nudgeBtnDisabled,
                  ]}
                  onPress={handleNudge}
                  disabled={!nudgeAvailable || nudgeMutation.isPending}
                >
                  {nudgeAvailable ? (
                    <SendIcon width={22} height={22} color="#9999A7" />
                  ) : (
                    <SendIcon width={22} height={22} color={Colors.text.dark} />
                  )}
                </Pressable>
              </View>
            </ReanimatedSwipeable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SwipeableCard
      ref={swipeableRef}
      height={90}
      borderRadius={26}
      renderRightActions={renderRightActions}
      innerStyle={styles.containerInner}
    >
      <View style={styles.info}>
        <Text style={styles.nickname}>{friend.nickname}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, styles.statusDotInactive]} />
          <Text style={[styles.statusText, styles.statusTextInactive]}>
            {friend.lastVoidEndedAt
              ? `마지막 공백: ${formatRelativeTime(friend.lastVoidEndedAt)}`
              : "마지막 공백 없음"}
          </Text>
        </View>
      </View>
    </SwipeableCard>
  );
}

const styles = StyleSheet.create({
  containerInner: {
    paddingHorizontal: 26,
    justifyContent: "center",
  },
  voidWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  voidIndicator: {
    position: "absolute",
    left: -6,
    width: 10,
    height: 90,
    backgroundColor: Colors.white,
    borderTopRightRadius: 99,
    borderBottomRightRadius: 99,
    zIndex: 1,
  },
  voidOuterContainer: {
    height: 90,
    flex: 1,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.white,
    marginLeft: 15,
  },
  voidClipContainer: {
    flex: 1,
    borderTopLeftRadius: 23,
    borderBottomLeftRadius: 23,
    overflow: "hidden",
  },
  voidInnerContainer: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 26,
    backgroundColor: Colors.black.dark,
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
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
  },
  statusDotActive: {
    backgroundColor: Colors.white,
  },
  statusDotInactive: {
    backgroundColor: Colors.text.mid,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "A2Z-Regular",
  },
  statusTextActive: {
    color: Colors.white,
  },
  statusTextInactive: {
    color: Colors.text.mid,
  },
  nudgeBtn: {
    width: 87,
    height: 90,
    borderTopLeftRadius: 36,
    borderBottomLeftRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2,
  },
  nudgeBtnActive: {
    backgroundColor: Colors.white,
  },
  nudgeBtnDisabled: {
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.text.dark,
  },
});
