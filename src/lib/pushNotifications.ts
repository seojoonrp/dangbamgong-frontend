import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { registerDeviceToken } from "../api/services/devices";

/**
 * 푸시 알림 권한을 요청하고, 허용 시 디바이스 토큰을 서버에 등록한다.
 * 앱 첫 진입 시(탭 마운트) 한 번 호출.
 */
export async function requestPushPermissionAndRegister(): Promise<void> {
  if (!Device.isDevice) return; // 시뮬레이터에서는 푸시 불가

  const { status: existing } = await Notifications.getPermissionsAsync();

  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;

  // Android 채널 설정
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const pushToken = await Notifications.getExpoPushTokenAsync();
  await registerDeviceToken(pushToken.data);
}
