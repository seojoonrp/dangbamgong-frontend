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
      <Stack.Screen
        name="profile"
        options={{ headerShown: false, title: "프로필" }}
      />
      <Stack.Screen
        name="push"
        options={{ headerShown: false, title: "푸시 알림 설정" }}
      />
      <Stack.Screen
        name="block"
        options={{ headerShown: false, title: "차단 목록" }}
      />
      <Stack.Screen
        name="detail"
        options={{ headerShown: false, title: "세부 공백 통계" }}
      />
    </Stack>
  );
}
