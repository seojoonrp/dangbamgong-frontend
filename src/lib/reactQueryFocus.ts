import { AppState } from "react-native";
import type { AppStateStatus } from "react-native";
import { focusManager } from "@tanstack/react-query";

export function setupReactQueryFocus() {
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        handleFocus(state === "active");
      },
    );
    return () => subscription.remove();
  });
}
