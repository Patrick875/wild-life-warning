import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import UserProvider from "@/context/UserContext";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const shouldRetryRequest = (failureCount: number, error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;

  return status !== 401 && failureCount < 2;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryRequest,
    },
    mutations: {
      retry: shouldRetryRequest,
    },
  },
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

Notifications.scheduleNotificationAsync({
  content: {
    title: "Look at that notification",
    body: "I'm so proud of myself!",
  },
  trigger: null,
});

function RootNavigator() {
  const { isAuthLoading, userToken } = useContext(AuthContext);

  if (isAuthLoading) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {userToken ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen name="alert-details" />
        <Stack.Screen name="warning-feedbacks" />
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
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AuthProvider>
              <UserProvider>
                <RootNavigator />
              </UserProvider>
            </AuthProvider>
          </SafeAreaProvider>

          <StatusBar style="auto" />
        </QueryClientProvider>
      </NotificationProvider>
    </>
  );
}
