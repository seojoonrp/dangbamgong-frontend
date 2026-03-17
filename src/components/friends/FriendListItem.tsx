import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Colors } from "../../constants/colors";
import { formatRelativeTime } from "../../lib/dateUtils";
import { useNudgeFriend, useRemoveFriend } from "../../hooks/useFriends";
import { useBlockUser } from "../../hooks/useUser";
import { useNudgeCooldown } from "../../hooks/useNudgeCooldown";
import { ApiError } from "../../api/client";
import type { FriendItem } from "../../types/dto/friends";
import SendIcon from "../../../assets/icons/shared/send.svg";

const SCREEN_WIDTH = Dimensions.get("window").width;

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
  const swipeableRef = useRef<Swipeable>(null);
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

  const renderRightActions = () => {
    if (friend.isInVoid) {
      return (
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
    }
    return (
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
  };

  if (friend.isInVoid) {
    return (
      <View style={styles.voidWrapper}>
        <View style={styles.voidIndicator} />
        {/* 핵심: 외부 컨테이너로 감싸고 내부에서 Swipe 처리 */}
        <View style={styles.voidOuterContainer}>
          <Swipeable
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
                  <SendIcon width={22} height={22} color={Colors.black.dark} />
                ) : (
                  <SendIcon width={22} height={22} color={Colors.text.dark} />
                )}
              </Pressable>
            </View>
          </Swipeable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.containerOuter}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
      >
        <View style={styles.containerInner}>
          <View style={styles.info}>
            <Text style={styles.nickname}>{friend.nickname}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, styles.statusDotInactive]} />
              <Text style={[styles.statusText, styles.statusTextInactive]}>
                마지막 공백: {formatRelativeTime(friend.lastVoidEndedAt)}
              </Text>
            </View>
          </View>
        </View>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  containerOuter: {
    height: 85,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.text.dark,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  containerInner: {
    height: "100%",
    backgroundColor: "rgba(22, 22, 24, 1)", // 핵심: 배경이 투명하면 뒤쪽 삭제 버튼이 비칠 수 있어 불투명 처리
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
    height: 85,
    backgroundColor: Colors.white,
    borderTopRightRadius: 99,
    borderBottomRightRadius: 99,
    zIndex: 1,
  },
  voidOuterContainer: {
    height: 85,
    flex: 1,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.white,
    marginLeft: 15,
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
    fontSize: 10,
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
    height: 85,
    borderTopLeftRadius: 36,
    borderBottomLeftRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  nudgeBtnActive: {
    backgroundColor: Colors.white,
  },
  nudgeBtnDisabled: {
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.text.dark,
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
  deleteBtn: {
    backgroundColor: Colors.point.coral,
  },
  blockBtn: {
    backgroundColor: Colors.point.strong,
  },
  swipeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-Regular",
  },
});
