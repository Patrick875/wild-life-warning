import { AuthContext } from "@/context/AuthContext";
import { apiClient } from "@/services/axiosInstance";
import {
  applyWarningNotificationToCache,
  toWarningNotificationData,
} from "@/utils/warningNotifications";
import { canUseNativePusher } from "@/utils/nativeCapabilities";
import type {
  Pusher as PusherClient,
  PusherEvent,
} from "@pusher/pusher-websocket-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { useContext, useEffect, useRef } from "react";
import { Platform } from "react-native";

type DecodedToken = {
  sub?: string | number;
};

type PusherNotificationPayload = {
  title: string;
  body: string;
  data: Record<string, unknown>;
};

const parseEventData = (data: PusherEvent["data"]) => {
  if (typeof data !== "string") return data;

  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const stringifyBody = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value == null) return undefined;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const buildNotificationPayload = (
  event: PusherEvent,
): PusherNotificationPayload => {
  const parsedData = parseEventData(event.data);
  const data = toWarningNotificationData(parsedData);

  const title =
    stringifyBody(data.title) ??
    stringifyBody(data.heading) ??
    "Wildlife warning";
  const body =
    stringifyBody(data.body) ??
    stringifyBody(data.message) ??
    stringifyBody(data.description) ??
    stringifyBody(parsedData) ??
    "You received a new wildlife alert.";

  return {
    title,
    body,
    data: {
      ...data,
      pusherEventName: event.eventName,
      pusherChannelName: event.channelName,
    },
  };
};

const ensureLocalNotificationSetup = async () => {
  const Notifications = await import("expo-notifications");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

const showPusherNotification = async (event: PusherEvent) => {
  const hasPermission = await ensureLocalNotificationSetup();
  if (!hasPermission) {
    return;
  }

  const Notifications = await import("expo-notifications");
  const notification = buildNotificationPayload(event);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: true,
    },
    trigger: null,
  });
};

export const usePusher = () => {
  const { userToken } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const pusherRef = useRef<PusherClient | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!canUseNativePusher()) return;
    if (!userToken) return;
    const decoded = jwtDecode<DecodedToken>(userToken);
    if (!decoded.sub) return;

    const dynamicChannel = `private-user-${decoded.sub}`;

    const initPusher = async () => {
      try {
        const { Pusher } = await import(
          "@pusher/pusher-websocket-react-native"
        );
        const pusher = Pusher.getInstance();
        pusherRef.current = pusher;

        await pusher.init({
          cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER as string,
          apiKey: process.env.EXPO_PUBLIC_PUSHER_API_KEY as string,
          onError: (message, code, error) => {
            console.error("Pusher error:", { message, code, error });
          },
          onAuthorizer: async (channelName: string, socketId: string) => {
            try {
              // 🛠️ Construct form data parameter string cleanly
              const formBody = `socket_id=${encodeURIComponent(socketId)}&channel_name=${encodeURIComponent(channelName)}`;

              // Send formBody directly as the payload argument for apiClient
              const response = await apiClient.post(`/pusher/auth`, formBody, {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              });

              // 🛠️ Dig out the pure inner data object from your api_response structure
              const authData = response.data?.data;

              if (!authData || !authData.auth) {
                throw new Error(
                  "Invalid or missing auth token received from server",
                );
              }

              // This MUST return exactly: { auth: "..." }
              return authData;
            } catch (error) {
              console.error("Pusher authorization handler failed:", error);
              return { auth: "" }; // Fail safe execution
            }
          },
        });

        await pusher.connect();

        if (isMounted) {
          await pusher.subscribe({
            channelName: dynamicChannel,
            onEvent: async (event: PusherEvent) => {
              try {
                const notificationData = toWarningNotificationData(event.data);
                applyWarningNotificationToCache(queryClient, notificationData);
                await showPusherNotification(event);
              } catch (error) {
                console.error("Failed to show Pusher notification:", error);
              }
            },
          });
        }
      } catch (err) {
        console.error("Pusher initialization failed:", err);
      }
    };

    initPusher();

    return () => {
      isMounted = false;
      const disconnectPusher = async () => {
        if (pusherRef.current) {
          try {
            // 🛠️ Changed from "wild-life-warning" to match your active subscribed channel
            await pusherRef.current.unsubscribe({
              channelName: dynamicChannel,
            });
            await pusherRef.current.disconnect();
          } catch (e) {
            console.error("Error during pusher lifecycle cleanup", e);
          }
        }
      };
      disconnectPusher();
    };
  }, [queryClient, userToken]);
};
