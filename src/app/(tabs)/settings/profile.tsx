import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import { useMe, useChangeNickname } from "../../../hooks/useUser";
import LoadingView from "../../../components/shared/LoadingView";

export default function ProfileScreen() {
  const { data: user, isLoading } = useMe();
  const changeNickname = useChangeNickname();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");

  if (isLoading || !user) return <LoadingView />;

  const isValid = nickname.length >= 3 && nickname.length <= 15;

  const startEdit = () => {
    setNickname(user.nickname);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!isValid) return;
    try {
      await changeNickname.mutateAsync(nickname.trim());
      setEditing(false);
    } catch {
      Alert.alert("오류", "닉네임 변경에 실패했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="프로필" />

      <View style={styles.content}>
        {/* 닉네임 */}
        <View style={styles.row}>
          <Text style={styles.label}>닉네임</Text>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={[styles.input, !isValid && styles.inputError]}
                value={nickname}
                onChangeText={setNickname}
                maxLength={15}
                autoFocus
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
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>저장</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.valueRow}>
              <Text style={styles.value}>{user.nickname}</Text>
              <Pressable onPress={startEdit}>
                <Text style={styles.editText}>변경</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 태그 */}
        <View style={styles.row}>
          <Text style={styles.label}>태그</Text>
          <Text style={styles.value}>@{user.tag}</Text>
        </View>

        {/* ID */}
        <View style={styles.row}>
          <Text style={styles.label}>ID</Text>
          <Text style={styles.valueMuted}>{user.id}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  row: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.black.light,
  },
  label: {
    color: Colors.text.mid,
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    color: Colors.white,
    fontSize: 16,
  },
  valueMuted: {
    color: Colors.text.light,
    fontSize: 14,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editText: {
    color: Colors.point.coral,
    fontSize: 14,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.dark,
    color: Colors.white,
    fontSize: 16,
    paddingVertical: 0,
  },
  inputError: {
    borderBottomColor: Colors.point.coral,
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.point.coral,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.black.light,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 13,
  },
});
