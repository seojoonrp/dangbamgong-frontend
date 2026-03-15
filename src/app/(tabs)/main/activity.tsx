import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import AddActivityModal from "../../../components/main/AddActivityModal";
import {
  useActivities,
  useUpdateActivity,
  useDeleteActivity,
} from "../../../hooks/useActivities";
import { formatRelativeTime } from "../../../lib/dateUtils";
import type { ActivityItem } from "../../../types/dto/activities";

type SortMode = "recent" | "count";

export default function ActivityScreen() {
  const { data, isLoading } = useActivities();
  const updateMutation = useUpdateActivity();
  const deleteMutation = useDeleteActivity();
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const activities = [...(data?.activities ?? [])];
  if (sortMode === "recent") {
    activities.sort(
      (a, b) =>
        new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime(),
    );
  } else {
    activities.sort((a, b) => b.usageCount - a.usageCount);
  }

  const existingNames = activities.map((a) => a.name);

  const handleEdit = (activity: ActivityItem) => {
    setEditingId(activity.id);
    setEditName(activity.name);
  };

  const handleSaveEdit = (activityId: string, originalName: string) => {
    const trimmed = editName.trim();
    if (
      trimmed.length < 1 ||
      trimmed.length > 10 ||
      (trimmed !== originalName && existingNames.includes(trimmed))
    ) {
      return;
    }
    if (trimmed === originalName) {
      setEditingId(null);
      return;
    }
    updateMutation.mutate(
      { activityId, name: trimmed },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleDelete = (activityId: string) => {
    Alert.alert(
      "활동 삭제",
      "활동을 삭제하시겠습니까? 활동을 삭제해도 종료된 공백에 기록된 활동은 삭제되지 않습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => deleteMutation.mutate(activityId),
        },
      ],
    );
  };

  const isEditValid = (originalName: string) => {
    const trimmed = editName.trim();
    return (
      trimmed.length >= 1 &&
      trimmed.length <= 10 &&
      (trimmed === originalName || !existingNames.includes(trimmed))
    );
  };

  const renderItem = ({ item }: { item: ActivityItem }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          {isEditing ? (
            <TextInput
              style={[
                styles.editInput,
                !isEditValid(item.name) && styles.editInputError,
              ]}
              value={editName}
              onChangeText={setEditName}
              maxLength={10}
              autoFocus
            />
          ) : (
            <>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {item.usageCount}회 사용 | 마지막:{" "}
                {formatRelativeTime(item.lastUsedAt)}
              </Text>
            </>
          )}
        </View>

        <View style={styles.itemActions}>
          {isEditing ? (
            <Pressable
              style={styles.actionBtn}
              onPress={() => handleSaveEdit(item.id, item.name)}
            >
              <Text style={styles.actionConfirm}>확인</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                style={styles.actionBtn}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.actionText}>수정</Text>
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.actionDelete}>삭제</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="활동 관리" />

      <View style={styles.toolbar}>
        <Pressable
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addBtnText}>+ 활동 추가</Text>
        </Pressable>
        <Pressable
          style={styles.sortBtn}
          onPress={() =>
            setSortMode((m) => (m === "recent" ? "count" : "recent"))
          }
        >
          <Text style={styles.sortText}>
            {sortMode === "recent" ? "최근 사용순" : "사용 횟수순"}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={Colors.white}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>등록된 활동이 없습니다.</Text>
          }
        />
      )}

      <AddActivityModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black.dark,
    paddingBottom: Layout.bottomTabHeight,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.point.coral,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: "A2Z-SemiBold",
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.black.light,
  },
  sortText: {
    color: Colors.text.light,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.black.light,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: Colors.white,
    fontSize: 15,
    marginBottom: 2,
  },
  itemMeta: {
    color: Colors.text.mid,
    fontSize: 12,
  },
  editInput: {
    height: 36,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.dark,
    color: Colors.white,
    fontSize: 15,
    paddingVertical: 0,
  },
  editInputError: {
    borderBottomColor: Colors.point.coral,
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: {
    color: Colors.text.light,
    fontSize: 13,
  },
  actionConfirm: {
    color: Colors.point.coral,
    fontSize: 13,
    fontFamily: "A2Z-SemiBold",
  },
  actionDelete: {
    color: Colors.point.coral,
    fontSize: 13,
  },
  emptyText: {
    color: Colors.text.mid,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
