import { Redirect } from "expo-router";
import { useAuth } from "../lib/AuthContext";
import LoadingView from "../components/shared/LoadingView";

export default function Index() {
  const { isAuthenticated, isNewUser, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingView />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/landing" />;
  }

  if (isNewUser) {
    return <Redirect href="/(auth)/nickname" />;
  }

  return <Redirect href="/(tabs)/main" />;
}
