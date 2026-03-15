import { Stack } from "expo-router";
import { Colors } from "../../../constants/colors";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.black.mid },
        headerTintColor: Colors.white,
        contentStyle: { backgroundColor: Colors.black.dark },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "프로필" }} />
      <Stack.Screen name="push" options={{ title: "푸시 알림 설정" }} />
      <Stack.Screen name="block" options={{ title: "차단 목록" }} />
    </Stack>
  );
}
