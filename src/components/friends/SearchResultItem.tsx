import { useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import type { UserSearchItem } from "../../types/dto/users";
import {
  SwipeableCard,
  SwipeActions,
  type SwipeableMethods,
} from "./SwipeableCard";

interface Props {
  user: UserSearchItem;
  onSendRequest: (userId: string) => void;
  onUnblock: (userId: string) => void;
}

export default function SearchResultItem({
  user,
  onSendRequest,
  onUnblock,
}: Props) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  if (user.isBlocked) {
    const renderRightActions = () => (
      <SwipeActions
        actions={[
          {
            label: "차단 해제",
            color: Colors.point.coral,
            onPress: () => {
              swipeableRef.current?.close();
              onUnblock(user.userId);
            },
          },
        ]}
      />
    );

    return (
      <SwipeableCard
        ref={swipeableRef}
        borderColor={Colors.point.coral}
        renderRightActions={renderRightActions}
        innerStyle={styles.innerContent}
      >
        <View style={styles.info}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text style={styles.tag}>#{user.tag}</Text>
        </View>
        <View style={[styles.statusBtn, styles.blockedStatusBtn]}>
          <Text style={styles.blockedStatusText}>차단된 유저</Text>
        </View>
      </SwipeableCard>
    );
  }

  if (user.isFriend) {
    return (
      <SwipeableCard
        ref={swipeableRef}
        renderRightActions={() => <View />}
        innerStyle={styles.innerContent}
      >
        <View style={styles.info}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text style={styles.tag}>#{user.tag}</Text>
        </View>
        <View style={[styles.statusBtn, styles.friendStatusBtn]}>
          <Text style={styles.friendStatusText}>친구</Text>
        </View>
      </SwipeableCard>
    );
  }

  if (user.hasSentRequest) {
    return (
      <SwipeableCard
        ref={swipeableRef}
        renderRightActions={() => <View />}
        innerStyle={styles.innerContent}
      >
        <View style={styles.info}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text style={styles.tag}>#{user.tag}</Text>
        </View>
        <View style={[styles.statusBtn, styles.sentStatusBtn]}>
          <Text style={styles.sentStatusText}>요청 보냄</Text>
        </View>
      </SwipeableCard>
    );
  }

  const renderRightActions = () => <View />;

  return (
    <SwipeableCard
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      innerStyle={styles.innerContent}
    >
      <View style={styles.info}>
        <Text style={styles.nickname}>{user.nickname}</Text>
        <Text style={styles.tag}>#{user.tag}</Text>
      </View>
      <Pressable
        style={styles.requestBtn}
        onPress={() => onSendRequest(user.userId)}
      >
        <Text style={styles.requestText}>요청 보내기</Text>
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
  tag: {
    color: Colors.text.mid,
    fontSize: 11,
    fontFamily: "A2Z-Regular",
  },
  requestBtn: {
    width: 120,
    height: 90,
    borderTopLeftRadius: 36,
    borderBottomLeftRadius: 36,
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.text.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  requestText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-Regular",
  },
  statusBtn: {
    width: 120,
    height: 90,
    borderTopLeftRadius: 36,
    borderBottomLeftRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  blockedStatusBtn: {
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.point.coral,
  },
  blockedStatusText: {
    color: Colors.point.coral,
    fontSize: 16,
    fontFamily: "A2Z-Light",
  },
  friendStatusBtn: {
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.text.mid,
  },
  friendStatusText: {
    color: Colors.text.mid,
    fontSize: 16,
    fontFamily: "A2Z-Light",
  },
  sentStatusBtn: {
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.text.dark,
  },
  sentStatusText: {
    color: Colors.text.mid,
    fontSize: 16,
    fontFamily: "A2Z-Light",
    textAlign: "center",
    lineHeight: 22,
  },
});
