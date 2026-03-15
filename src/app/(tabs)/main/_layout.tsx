import { Stack } from "expo-router";
import { Colors } from "../../../constants/colors";

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.black.dark },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="activity"
        options={{
          headerShown: false,
          title: "활동 관리",
        }}
      />
    </Stack>
  );
}
