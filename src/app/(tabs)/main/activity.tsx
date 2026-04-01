import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";
import { useQueryClient } from "@tanstack/react-query";
import { Colors } from "../../../constants/colors";
import { Layout } from "../../../constants/layout";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import AddActivityModal from "../../../components/main/AddActivityModal";
import EditIcon from "../../../../assets/icons/shared/edit.svg";
import DeleteIcon from "../../../../assets/icons/shared/delete.svg";
import PlusIcon from "../../../../assets/icons/shared/plus.svg";
import {
  useActivities,
  useUpdateActivity,
  useDeleteActivity,
} from "../../../hooks/useActivities";
import { formatRelativeTime } from "../../../lib/dateUtils";
import type { ActivityItem } from "../../../types/dto/activities";
import LoadingView from "../../../components/shared/LoadingView";
import Toast from "../../../components/shared/Toast";
import PullToRefreshView from "../../../components/shared/PullToRefreshView";
import { queryKeys } from "../../../lib/queryKeys";

type SortMode = "recent" | "count";

export default function ActivityScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useActivities();
  const updateMutation = useUpdateActivity();
  const deleteMutation = useDeleteActivity();
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const scrollOffsetY = useSharedValue(0);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.activities.list(),
    });
  }, [queryClient]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      showToast("활동이 삭제되었습니다");
    }
  }, [deleteMutation.isSuccess]);

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
      {
        onSuccess: () => {
          setEditingId(null);
          showToast("활동 이름이 수정되었습니다");
        },
      },
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

  const isEditSubmittable = (originalName: string) => {
    const trimmed = editName.trim();
    return (
      trimmed.length >= 1 &&
      trimmed.length <= 10 &&
      trimmed !== originalName &&
      !existingNames.includes(trimmed)
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
              <Text style={styles.itemLastUsed}>
                {item.lastUsedAt
                  ? `마지막 사용: ${formatRelativeTime(item.lastUsedAt)}`
                  : "사용한 적 없음"}
              </Text>
            </>
          )}
        </View>

        <View style={styles.itemActions}>
          {isEditing ? (
            <Pressable
              style={[
                styles.confirmBtn,
                !isEditSubmittable(item.name) && styles.confirmBtnDisabled,
              ]}
              onPress={() => handleSaveEdit(item.id, item.name)}
              disabled={!isEditSubmittable(item.name)}
            >
              <Text
                style={[
                  styles.confirmText,
                  !isEditSubmittable(item.name) && styles.confirmTextDisabled,
                ]}
              >
                확인
              </Text>
            </Pressable>
          ) : (
            <>
              <Text style={styles.usageCount}>{item.usageCount}번 사용됨</Text>
              <Pressable
                style={styles.iconBtnEdit}
                onPress={() => handleEdit(item)}
              >
                <EditIcon width={16} height={16} />
              </Pressable>
              <Pressable
                style={styles.iconBtnDelete}
                onPress={() => handleDelete(item.id)}
              >
                <DeleteIcon width={16} height={16} />
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
      <PullToRefreshView
        onRefresh={handleRefresh}
        scrollOffsetY={scrollOffsetY}
      >
        <View style={styles.toolbar}>
          <View style={styles.chipRow}>
            <Pressable
              style={[
                styles.chip,
                sortMode === "recent" ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => setSortMode("recent")}
            >
              <Text
                style={[
                  styles.chipText,
                  sortMode === "recent"
                    ? styles.chipTextActive
                    : styles.chipTextInactive,
                ]}
              >
                최근 사용 순
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.chip,
                sortMode === "count" ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => setSortMode("count")}
            >
              <Text
                style={[
                  styles.chipText,
                  sortMode === "count"
                    ? styles.chipTextActive
                    : styles.chipTextInactive,
                ]}
              >
                사용 횟수 순
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <PlusIcon width={13} height={13} color={Colors.white} />
          </Pressable>
        </View>

        <Text style={styles.activityCount}>{activities.length}개의 활동</Text>

        {isLoading ? (
          <LoadingView />
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>등록된 활동이 없습니다.</Text>
            }
            onScroll={({ nativeEvent }) => {
              scrollOffsetY.value = nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          />
        )}
      </PullToRefreshView>

      {showAddModal && (
        <AddActivityModal onClose={() => setShowAddModal(false)} />
      )}

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: Colors.black.light,
    borderColor: Colors.white,
  },
  chipInactive: {
    borderColor: Colors.text.dark,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "A2Z-Regular",
  },
  chipTextActive: {
    color: Colors.white,
  },
  chipTextInactive: {
    color: Colors.text.dark,
  },
  addBtn: {
    width: 53,
    height: 30,
    borderRadius: 14,
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  activityCount: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    marginLeft: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 68,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-Regular",
    marginBottom: 4,
  },
  itemLastUsed: {
    color: Colors.text.light,
    fontSize: 12,
    fontFamily: "A2Z-Regular",
  },
  editInput: {
    height: 36,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.dark,
    color: Colors.white,
    fontSize: 16,
    fontFamily: "A2Z-Regular",
    paddingVertical: 0,
    marginRight: 12,
  },
  editInputError: {
    borderBottomColor: Colors.point.coral,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  usageCount: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: "A2Z-Regular",
    marginRight: 4,
  },
  iconBtnEdit: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnDelete: {
    width: 28,
    height: 28,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.point.coral,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: Colors.black.light,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  confirmBtnDisabled: {
    borderColor: Colors.text.dark,
    opacity: 0.4,
    backgroundColor: Colors.black.dark,
  },
  confirmText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: "A2Z-Regular",
  },
  confirmTextDisabled: {
    color: Colors.text.dark,
  },
  emptyText: {
    color: Colors.text.mid,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
