import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import { useMe, useChangeNickname } from "../../../hooks/useUser";
import LoadingView from "../../../components/shared/LoadingView";
import Spinner from "../../../components/shared/Spinner";
import EditIcon from "../../../../assets/icons/shared/edit.svg";
import Toast from "../../../components/shared/Toast";
import PullToRefreshView from "../../../components/shared/PullToRefreshView";
import { queryKeys } from "../../../lib/queryKeys";

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();
  const changeNickname = useChangeNickname();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
  }, [queryClient]);

  if (isLoading || !user) return <LoadingView />;

  const isValid =
    nickname.length >= 3 &&
    nickname.length <= 15 &&
    nickname.trim() !== "" &&
    nickname !== user.nickname;

  const startEdit = () => {
    setNickname(user.nickname);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!isValid) return;
    try {
      await changeNickname.mutateAsync(nickname.trim());
      setEditing(false);
      setToastVisible(true);
    } catch {
      Alert.alert("오류", "닉네임 변경에 실패했습니다.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="프로필" />

        <PullToRefreshView onRefresh={handleRefresh}>
        <View style={styles.content}>
          {/* 닉네임 */}
          <View style={styles.row}>
            <Text style={styles.label}>닉네임</Text>
            {editing ? (
              <View style={styles.editInputRow}>
                <TextInput
                  style={styles.input}
                  value={nickname}
                  onChangeText={setNickname}
                  maxLength={15}
                  autoFocus
                  placeholderTextColor={Colors.text.dark}
                />
                <Pressable
                  style={[
                    styles.saveBtn,
                    (!isValid || changeNickname.isPending) &&
                      styles.saveBtnDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!isValid || changeNickname.isPending}
                >
                  {changeNickname.isPending ? (
                    <Spinner />
                  ) : (
                    <Text style={styles.saveBtnText}>저장</Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <View style={styles.valueRow}>
                <Text style={styles.value}>{user.nickname}</Text>
                <Pressable onPress={startEdit} style={styles.editBtn}>
                  <EditIcon width={12} height={12} color={Colors.white} />
                </Pressable>
              </View>
            )}
          </View>

          {/* 태그 */}
          <View style={styles.row}>
            <Text style={styles.label}>태그</Text>
            <Text style={[styles.value, styles.valueTracking]}>#{user.tag}</Text>
          </View>

          {/* 가입 경로 */}
          <View style={styles.row}>
            <Text style={styles.label}>가입 경로</Text>
            <Text style={styles.value}>
              {user.socialProvider === "GOOGLE"
                ? "Google"
                : user.socialProvider === "KAKAO"
                  ? "Kakao"
                  : "Apple"}
            </Text>
          </View>
        </View>
        </PullToRefreshView>

        <Toast
          message="닉네임이 변경되었습니다"
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
  },
  content: {
    paddingHorizontal: 31,
    paddingTop: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 47,
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Medium",
  },
  value: {
    color: "rgba(250, 250, 250, 0.9)",
    fontSize: 13.5,
    fontFamily: "A2Z-Regular",
  },
  valueTracking: {
    letterSpacing: 0.65,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  editBtn: {
    width: 36,
    height: 24,
    borderRadius: 99,
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  editInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginLeft: 20,
  },
  input: {
    flex: 1,
    height: 36,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.dark,
    color: Colors.white,
    fontSize: 13,
    fontFamily: "A2Z-Regular",
    paddingVertical: 0,
    textAlign: "right",
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderColor: Colors.white,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.3,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
  },
});
