import { useState, useMemo } from "react";
import { View, Text, Switch, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import { useMe, useUpdateSettings } from "../../../hooks/useUser";
import LoadingView from "../../../components/shared/LoadingView";
import TriangleIcon from "../../../../assets/icons/settings/triangle.svg";

export default function PushSettingsScreen() {
  const { data: user, isLoading } = useMe();
  const updateSettings = useUpdateSettings();

  const [localSettings, setLocalSettings] = useState<{
    voidReminder: boolean;
    reminderHours: number;
    friendRequest: boolean;
    friendNudge: boolean;
  } | null>(null);

  const settings = user?.notificationSettings;

  const current = useMemo(() => {
    if (!settings) return null;
    return (
      localSettings ?? {
        voidReminder: settings.voidReminder,
        reminderHours: settings.reminderHours,
        friendRequest: settings.friendRequest,
        friendNudge: settings.friendNudge,
      }
    );
  }, [settings, localSettings]);

  const hasChanges = useMemo(() => {
    if (!settings || !current) return false;
    return (
      current.voidReminder !== settings.voidReminder ||
      current.reminderHours !== settings.reminderHours ||
      current.friendRequest !== settings.friendRequest ||
      current.friendNudge !== settings.friendNudge
    );
  }, [settings, current]);

  if (isLoading || !user || !current) return <LoadingView />;

  const update = (patch: Partial<typeof current>) => {
    setLocalSettings({ ...current, ...patch });
  };

  const handleSave = () => {
    if (!hasChanges) return;
    updateSettings.mutate(
      {
        voidReminder: current.voidReminder,
        reminderHours: current.reminderHours,
        friendRequest: current.friendRequest,
        friendNudge: current.friendNudge,
      },
      {
        onSuccess: () => {
          setLocalSettings(null);
        },
      },
    );
  };

  const isMinHours = current.reminderHours <= 1;
  const isMaxHours = current.reminderHours >= 10;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="푸시 알림 설정" />

      <View style={styles.content}>
        {/* 오랜 공백 알림 */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>오랜 공백 알림</Text>
            <Switch
              value={current.voidReminder}
              onValueChange={(v) => update({ voidReminder: v })}
              trackColor={{
                false: Colors.black.light,
                true: Colors.point.coral,
              }}
              thumbColor={Colors.white}
              style={styles.switch}
            />
          </View>
          <Text style={styles.description}>
            공백을 시작한 후 설정한 시간만큼 지나면 알림을 받습니다.
          </Text>
        </View>

        {/* 공백 후 알림 시간 */}
        <View
          style={[
            styles.section,
            !current.voidReminder && styles.sectionDisabled,
            { marginTop: -4 },
          ]}
          pointerEvents={current.voidReminder ? "auto" : "none"}
        >
          <View style={styles.row}>
            <Text style={styles.label}>공백 후 알림 시간</Text>
            <View style={styles.hourSelector}>
              <Pressable
                onPress={() =>
                  !isMinHours &&
                  update({ reminderHours: current.reminderHours - 1 })
                }
                disabled={isMinHours}
                hitSlop={8}
              >
                <TriangleIcon
                  width={8}
                  height={12}
                  style={[
                    styles.triangleLeft,
                    isMinHours && styles.triangleDisabled,
                  ]}
                />
              </Pressable>
              <Text style={styles.hourText}>{current.reminderHours}시간</Text>
              <Pressable
                onPress={() =>
                  !isMaxHours &&
                  update({ reminderHours: current.reminderHours + 1 })
                }
                disabled={isMaxHours}
                hitSlop={8}
              >
                <TriangleIcon
                  width={8}
                  height={12}
                  style={isMaxHours ? styles.triangleDisabled : undefined}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* 친구 요청/수락 알림 */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>친구 요청/수락 알림</Text>
            <Switch
              value={current.friendRequest}
              onValueChange={(v) => update({ friendRequest: v })}
              trackColor={{
                false: Colors.black.light,
                true: Colors.point.coral,
              }}
              thumbColor={Colors.white}
              style={styles.switch}
            />
          </View>
          <Text style={styles.description}>
            친구 요청을 받거나 보낸 요청이 수락되면 알림을 받습니다.
          </Text>
        </View>

        {/* 친구가 보낸 알림 */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>친구가 보낸 알림</Text>
            <Switch
              value={current.friendNudge}
              onValueChange={(v) => update({ friendNudge: v })}
              trackColor={{
                false: Colors.black.light,
                true: Colors.point.coral,
              }}
              thumbColor={Colors.white}
              style={styles.switch}
            />
          </View>
          <Text style={styles.description}>
            공백 중 친구가 [알림 보내기]를 통해 보낸 알림을 받습니다.
          </Text>
        </View>

        {/* 저장 버튼 */}
        <View style={styles.saveWrapper}>
          <Pressable
            onPress={handleSave}
            disabled={!hasChanges}
            style={[
              styles.saveButton,
              {
                borderColor: hasChanges
                  ? Colors.point.coral
                  : Colors.text.black,
              },
            ]}
          >
            <Text
              style={[
                styles.saveText,
                {
                  color: hasChanges ? Colors.point.coral : Colors.text.black,
                },
              ]}
            >
              저장
            </Text>
          </Pressable>
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
    paddingTop: 12,
  },
  section: {
    marginBottom: 10,
  },
  sectionDisabled: {
    opacity: 0.35,
  },
  switch: {
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "A2Z-Medium",
  },
  description: {
    color: Colors.text.mid,
    fontSize: 11,
    fontFamily: "A2Z-Regular",
    marginBottom: 4,
    marginTop: -6,
  },
  hourSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  triangleLeft: {
    transform: [{ rotate: "180deg" }],
  },
  triangleDisabled: {
    opacity: 0.3,
  },
  hourText: {
    color: "rgba(250, 250, 250, 0.9)",
    fontSize: 13,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
    minWidth: 40,
  },
  saveWrapper: {
    alignItems: "flex-end",
    marginTop: 16,
  },
  saveButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 60,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontSize: 14,
    fontFamily: "A2Z-Regular",
    textAlign: "center",
  },
});
