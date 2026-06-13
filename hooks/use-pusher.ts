import { AuthContext } from "@/context/AuthContext";
import { UserContext } from "@/context/UserContext";
import { apiClient } from "@/services/axiosInstance";
import { Pusher, PusherEvent } from "@pusher/pusher-websocket-react-native";
import * as Notifications from "expo-notifications";
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
  const data: Record<string, unknown> =
    parsedData && typeof parsedData === "object" && !Array.isArray(parsedData)
      ? (parsedData as Record<string, unknown>)
      : { payload: parsedData };

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
    console.log("Notification permission denied; skipping local notification.");
    return;
  }

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
  const { user } = useContext(UserContext);
  const { userToken } = useContext(AuthContext);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!user || !userToken) return;
    const decoded = jwtDecode<DecodedToken>(userToken);
    if (!decoded.sub) return;

    const dynamicChannel = `private-user-${decoded.sub}`;

    const initPusher = async () => {
      try {
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

              console.log("flask-response-auth-granted", authData);

              // This MUST return exactly: { auth: "..." }
              return authData;
            } catch (error) {
              console.error("Pusher authorization handler failed:", error);
              return { auth: "" }; // Fail safe execution
            }
          },
        });

        await pusher.connect();
        console.log("Pusher notifications connected successfully");

        if (isMounted) {
          await pusher.subscribe({
            channelName: dynamicChannel,
            onEvent: async (event: PusherEvent) => {
              console.log("pusher-event received:", event?.data);
              try {
                await showPusherNotification(event);
              } catch (error) {
                console.error("Failed to show Pusher notification:", error);
              }
            },
          });
          console.log(`Subscribed to personal channel: ${dynamicChannel}`);
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
            console.log("Pusher disconnected safely");
          } catch (e) {
            console.log("Error during pusher lifecycle cleanup");
          }
        }
      };
      disconnectPusher();
    };
  }, [user, userToken]);
};
