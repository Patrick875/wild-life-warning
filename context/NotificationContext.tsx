import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import {
  applyWarningNotificationToCache,
  openWarningFromNotification,
  toWarningNotificationData,
} from "@/utils/warningNotifications";
import { useQueryClient } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
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
  notification: Notifications.Notification | null;
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
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => setExpoPushToken(token),
      (error) => setError(error),
    );

    if (Device.isDevice) {
      Notifications.getDevicePushTokenAsync().then(
        (devicePushToken) => {
          setDevicePushToken(devicePushToken.data);
        },
        (error) => {
          setError(error);
        },
      );
    }

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const notificationData = toWarningNotificationData(
          notification.request.content.data,
        );
        applyWarningNotificationToCache(queryClient, notificationData);
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notificationData = toWarningNotificationData(
          response.notification.request.content.data,
        );
        applyWarningNotificationToCache(queryClient, notificationData);
        openWarningFromNotification(queryClient, notificationData);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
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
