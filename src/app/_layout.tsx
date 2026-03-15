import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  Text,
  TextInput,
} from "react-native";

SplashScreen.preventAutoHideAsync();

const DEFAULT_FONT = "A2Z-Regular";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "A2Z-Light": require("../../assets/fonts/A2Z-3Light.ttf"),
    "A2Z-Regular": require("../../assets/fonts/A2Z-4Regular.ttf"),
    "A2Z-Medium": require("../../assets/fonts/A2Z-5Medium.ttf"),
    "A2Z-SemiBold": require("../../assets/fonts/A2Z-6SemiBold.ttf"),
    "A2Z-Bold": require("../../assets/fonts/A2Z-7Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Set default font for all Text and TextInput components
      const textStyle = { fontFamily: DEFAULT_FONT };

      const originalTextRender = (Text as any).render;
      if (originalTextRender) {
        (Text as any).render = function (props: any, ref: any) {
          return originalTextRender.call(
            this,
            { ...props, style: [textStyle, props.style] },
            ref
          );
        };
      } else {
        (Text as any).defaultProps = {
          ...((Text as any).defaultProps || {}),
          style: textStyle,
        };
      }

      const originalTextInputRender = (TextInput as any).render;
      if (originalTextInputRender) {
        (TextInput as any).render = function (props: any, ref: any) {
          return originalTextInputRender.call(
            this,
            { ...props, style: [textStyle, props.style] },
            ref
          );
        };
      } else {
        (TextInput as any).defaultProps = {
          ...((TextInput as any).defaultProps || {}),
          style: textStyle,
        };
      }

      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
