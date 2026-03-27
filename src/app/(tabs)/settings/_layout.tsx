import { useEffect } from "react";
import { Stack } from "expo-router";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { Colors } from "../../../constants/colors";

export default function SettingsLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const state = navigation.getState();
      const thisRoute = state.routes.find((r) => r.name === "settings");
      if (thisRoute?.state && (thisRoute.state.index ?? 0) > 0) {
        navigation.dispatch({
          ...CommonActions.reset({
            index: 0,
            routes: [{ name: "index" }],
          }),
          target: thisRoute.state.key,
        });
      }
    });
    return unsubscribe;
  }, [navigation]);

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
