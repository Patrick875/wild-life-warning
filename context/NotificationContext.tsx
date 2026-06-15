import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { canUseNativePushNotifications } from "@/utils/nativeCapabilities";
import {
  applyWarningNotificationToCache,
  openWarningFromNotification,
  toWarningNotificationData,
} from "@/utils/warningNotifications";
import { useQueryClient } from "@tanstack/react-query";
import * as Device from "expo-device";
import type { Notification } from "expo-notifications";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface NotificationContextType {
  expoPushToken: string | null;
  devicePushToken: string | null;
  notification: Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [devicePushToken, setDevicePushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!canUseNativePushNotifications) {
      return;
    }

    let isMounted = true;
    let removeNotificationListener: (() => void) | undefined;
    let removeResponseListener: (() => void) | undefined;

    const setupNotifications = async () => {
      const Notifications = await import("expo-notifications");

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      if (!isMounted) return;

      const notificationListener =
        Notifications.addNotificationReceivedListener((notification) => {
          const notificationData = toWarningNotificationData(
            notification.request.content.data,
          );
          applyWarningNotificationToCache(queryClient, notificationData);
          setNotification(notification);
        });
      removeNotificationListener = () => notificationListener.remove();

      const responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const notificationData = toWarningNotificationData(
            response.notification.request.content.data,
          );
          applyWarningNotificationToCache(queryClient, notificationData);
          openWarningFromNotification(queryClient, notificationData);
        });
      removeResponseListener = () => responseListener.remove();

      if (Device.isDevice) {
        Notifications.getDevicePushTokenAsync().then(
          (devicePushToken) => {
            if (isMounted) setDevicePushToken(devicePushToken.data);
          },
          (error) => {
            if (isMounted) setError(error);
          },
        );
      }
    };

    setupNotifications().catch((error) => {
      if (isMounted) setError(error);
    });

    registerForPushNotificationsAsync().then(
      (token) => {
        if (isMounted) setExpoPushToken(token);
      },
      (error) => {
        if (isMounted) setError(error);
      },
    );

    return () => {
      isMounted = false;
      removeNotificationListener?.();
      removeResponseListener?.();
    };
  }, [queryClient]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, devicePushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
