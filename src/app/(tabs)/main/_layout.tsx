import { useEffect } from "react";
import { Stack } from "expo-router";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { Colors } from "../../../constants/colors";

export default function MainLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const state = navigation.getState();
      const thisRoute = state.routes.find((r) => r.name === "main");
      const nestedState = thisRoute?.state;
      if (nestedState && (nestedState.index ?? 0) > 0) {
        navigation.dispatch({
          ...CommonActions.reset({
            index: 0,
            routes: [{ name: "index" }],
          }),
          target: nestedState.key,
        });
      }
    });
    return unsubscribe;
  }, [navigation]);

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
