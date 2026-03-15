import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../constants/colors";
import { useCreateActivity, useActivities } from "../../hooks/useActivities";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddActivityModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const { data } = useActivities();
  const createMutation = useCreateActivity();

  const existingNames = (data?.activities ?? []).map((a) => a.name);
  const isDuplicate = existingNames.includes(name.trim());
  const isValidLength = name.trim().length >= 1 && name.trim().length <= 10;
  const isValid = isValidLength && !isDuplicate;
  const showError = touched && !isValid;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await createMutation.mutateAsync(name.trim());
      setName("");
      setTouched(false);
      onClose();
    } catch {}
  };

  const handleClose = () => {
    setName("");
    setTouched(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>활동 추가</Text>
          <TextInput
            style={[styles.input, showError && styles.inputError]}
            placeholder="활동 이름 입력..."
            placeholderTextColor={Colors.text.mid}
            value={name}
            onChangeText={setName}
            onBlur={() => setTouched(true)}
            maxLength={10}
            autoFocus
          />
          {showError && (
            <Text style={styles.errorText}>
              {isDuplicate
                ? "이미 존재하는 활동입니다."
                : "활동 이름은 1~10자여야 합니다."}
            </Text>
          )}
          <View style={styles.buttons}>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable
              style={[
                styles.submitBtn,
                (!isValid || createMutation.isPending) && styles.btnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isValid || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitText}>추가</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: Colors.black.mid,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "A2Z-SemiBold",
    marginBottom: 20,
  },
  input: {
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.dark,
    color: Colors.white,
    fontSize: 15,
    marginBottom: 8,
  },
  inputError: {
    borderBottomColor: Colors.point.coral,
  },
  errorText: {
    color: Colors.point.coral,
    fontSize: 12,
    marginBottom: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    color: Colors.text.light,
    fontSize: 14,
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.point.coral,
    borderRadius: 8,
  },
  btnDisabled: {
    backgroundColor: Colors.black.light,
  },
  submitText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-SemiBold",
  },
});
