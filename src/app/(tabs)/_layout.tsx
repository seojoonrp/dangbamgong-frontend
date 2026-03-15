import { Tabs } from "expo-router";

import BottomTab from "../../components/navigation/BottomTab";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="main" options={{ title: "메인" }} />
      <Tabs.Screen name="stats" options={{ title: "통계" }} />
      <Tabs.Screen name="friends" options={{ title: "친구" }} />
      <Tabs.Screen name="settings" options={{ title: "설정" }} />
    </Tabs>
  );
}
