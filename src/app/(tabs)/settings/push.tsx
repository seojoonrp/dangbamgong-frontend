import { View, Text, Switch, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import ScreenHeader from "../../../components/navigation/ScreenHeader";
import { useMe, useUpdateSettings } from "../../../hooks/useUser";
import LoadingView from "../../../components/shared/LoadingView";

export default function PushSettingsScreen() {
  const { data: user, isLoading } = useMe();
  const updateSettings = useUpdateSettings();

  if (isLoading || !user) return <LoadingView />;

  const settings = user.notificationSettings;

  const handleToggle = (
    key: "friendRequest" | "friendNudge" | "voidReminder",
    value: boolean,
  ) => {
    updateSettings.mutate({ [key]: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="푸시 알림 설정" />

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.label}>친구 요청 알림</Text>
            <Text style={styles.description}>
              새로운 친구 요청이 올 때 알림을 받습니다
            </Text>
          </View>
          <Switch
            value={settings.friendRequest}
            onValueChange={(v) => handleToggle("friendRequest", v)}
            trackColor={{
              false: Colors.black.light,
              true: Colors.point.coral,
            }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.label}>친구 알림(찌르기)</Text>
            <Text style={styles.description}>
              친구가 알림을 보낼 때 알림을 받습니다
            </Text>
          </View>
          <Switch
            value={settings.friendNudge}
            onValueChange={(v) => handleToggle("friendNudge", v)}
            trackColor={{
              false: Colors.black.light,
              true: Colors.point.coral,
            }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.label}>공백 리마인더</Text>
            <Text style={styles.description}>
              공백을 시작하지 않았을 때 리마인더를 받습니다
            </Text>
          </View>
          <Switch
            value={settings.voidReminder}
            onValueChange={(v) => handleToggle("voidReminder", v)}
            trackColor={{
              false: Colors.black.light,
              true: Colors.point.coral,
            }}
            thumbColor={Colors.white}
          />
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.black.light,
  },
  rowInfo: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: Colors.white,
    fontSize: 15,
    marginBottom: 4,
  },
  description: {
    color: Colors.text.mid,
    fontSize: 12,
  },
});
