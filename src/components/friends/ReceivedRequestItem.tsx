import { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";
import { formatRelativeTime } from "../../lib/dateUtils";
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from "../../hooks/useFriends";
import { useBlockUser } from "../../hooks/useUser";
import { ApiError } from "../../api/client";
import type { ReceivedRequestItem as RequestItemType } from "../../types/dto/friends";
import {
  SwipeableCard,
  SwipeActions,
  type SwipeableMethods,
} from "./SwipeableCard";

interface Props {
  request: RequestItemType;
  onSuccess: (message: string) => void;
  onForceRefresh: () => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ReceivedRequestItem({
  request,
  onSuccess,
  onForceRefresh,
}: Props) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const blockMutation = useBlockUser();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const itemHeight = useSharedValue(90);
  const pendingActionRef = useRef<() => void>(() => {});

  const executePending = () => pendingActionRef.current();

  const animateOut = (action: () => void) => {
    pendingActionRef.current = action;
    translateX.value = withTiming(-SCREEN_WIDTH, { duration: 280 });
    opacity.value = withTiming(0, { duration: 280 }, (finished) => {
      "worklet";
      if (finished) {
        itemHeight.value = withTiming(0, { duration: 200 }, (heightFinished) => {
          "worklet";
          if (heightFinished) runOnJS(executePending)();
        });
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    overflow: "hidden",
  }));

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync(request.requestId);
    } catch (e) {
      if (e instanceof ApiError) {
        const msg =
          e.code === "ALREADY_FRIENDS"
            ? "이미 친구입니다."
            : "취소된 친구 요청입니다.";
        Alert.alert("오류", msg);
      }
      onForceRefresh();
    }
  };

  const handleReject = () => {
    swipeableRef.current?.close();
    animateOut(() =>
      rejectMutation.mutate(request.requestId, {
        onSuccess: () => onSuccess("친구 요청을 거절했습니다."),
        onError: (e) => {
          if (e instanceof ApiError) Alert.alert("오류", "취소된 친구 요청입니다.");
          onForceRefresh();
        },
      }),
    );
  };

  const handleBlock = () => {
    swipeableRef.current?.close();
    Alert.alert("차단", `${request.sender.nickname}님을 차단하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () =>
          animateOut(() =>
            blockMutation.mutate(request.sender.userId, {
              onSuccess: () => onSuccess("성공적으로 차단되었습니다."),
            }),
          ),
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
    <Animated.View style={animatedContainerStyle}>
    <Animated.View style={animatedStyle}>
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
    </Animated.View>
    </Animated.View>
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
    borderRightWidth: 0,
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
