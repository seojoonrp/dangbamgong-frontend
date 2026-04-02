import { useEffect } from "react";
import { Tabs } from "expo-router";

import BottomTab from "../../components/navigation/BottomTab";
import { requestPushPermissionAndRegister } from "../../lib/pushNotifications";
import { Layout } from "../../constants/layout";

export default function TabsLayout() {
  useEffect(() => {
    requestPushPermissionAndRegister();
  }, []);

  return (
    <Tabs
      tabBar={(props) => <BottomTab {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: "absolute", height: Layout.bottomTabHeight },
      }}
    >
      <Tabs.Screen name="main" options={{ title: "메인" }} />
      <Tabs.Screen name="stats" options={{ title: "통계" }} />
      <Tabs.Screen name="friends" options={{ title: "친구" }} />
      <Tabs.Screen name="settings" options={{ title: "설정" }} />
    </Tabs>
  );
}
