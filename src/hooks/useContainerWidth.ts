import { Platform, PlatformIOSStatic, useWindowDimensions } from "react-native";
import { Layout } from "../constants/layout";

export function useContainerWidth(): number {
  const { width, height } = useWindowDimensions();
  const isIpadLandscape =
    Platform.OS === "ios" &&
    (Platform as PlatformIOSStatic).isPad &&
    width > height;
  return isIpadLandscape ? Math.min(width, Layout.ipadMaxWidth) : width;
}
