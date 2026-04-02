import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  Platform,
  PlatformIOSStatic,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from "../lib/queryClient";
import { AuthProvider } from "../lib/AuthContext";
import { setupReactQueryFocus } from "../lib/reactQueryFocus";
import { Colors } from "../constants/colors";

SplashScreen.preventAutoHideAsync();
setupReactQueryFocus();

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
            ref,
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
            ref,
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

  const { width, height } = useWindowDimensions();
  const isIpadLandscape =
    Platform.OS === "ios" &&
    (Platform as PlatformIOSStatic).isPad &&
    width > height;

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView
      style={[
        { flex: 1 },
        isIpadLandscape && { backgroundColor: Colors.black.dark },
      ]}
    >
      <View style={isIpadLandscape ? styles.ipadContainer : { flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </AuthProvider>
        </QueryClientProvider>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  ipadContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
});
