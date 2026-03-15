import { Stack } from "expo-router";
import { Colors } from "../../../constants/colors";

export default function FriendsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.black.dark },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="search"
        options={{
          headerShown: false,
          title: "친구 추가",
        }}
      />
    </Stack>
  );
}
