import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/colors";
import TabHeader from "../../../components/shared/TabHeader";
import MainIcon from "../../../../assets/icons/header/main.svg";
import ActivitiesIcon from "../../../../assets/icons/header/activities.svg";
import NotificationsIcon from "../../../../assets/icons/header/notifications.svg";
import { router } from "expo-router";

export default function MainScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TabHeader
        icon={MainIcon}
        title="당밤공"
        rightContent={
          <View style={{ flexDirection: "row", alignItems: "center", gap: -2 }}>
            <Pressable onPress={() => router.push("/(tabs)/main/activity")}>
              <ActivitiesIcon width={36} height={36} />
            </Pressable>
            <Pressable>
              <NotificationsIcon width={36} height={36} />
            </Pressable>
          </View>
        }
      />
      <View style={styles.content}>
        <Text style={styles.placeholder}>공백 시작/종료 영역</Text>
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    color: Colors.text.light,
    fontSize: 16,
  },
});
