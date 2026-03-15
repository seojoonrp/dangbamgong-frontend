import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../lib/AuthContext";
import { Colors } from "../constants/colors";

export default function Index() {
  const { isAuthenticated, isNewUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.black.dark,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={Colors.white} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/landing" />;
  }

  if (isNewUser) {
    return <Redirect href="/(auth)/nickname" />;
  }

  return <Redirect href="/(tabs)/main" />;
}
