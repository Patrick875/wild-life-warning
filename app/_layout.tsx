import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

function RootNavigator() {
  const { userToken } = useContext(AuthContext);
  console.log("user token", userToken);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {userToken ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </SafeAreaProvider>

        <StatusBar style="auto" />
      </QueryClientProvider>
    </>
  );
}
