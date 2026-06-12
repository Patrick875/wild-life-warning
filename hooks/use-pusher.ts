import { AuthContext } from "@/context/AuthContext";
import { UserContext } from "@/context/UserContext";
import { apiClient } from "@/services/axiosInstance";
import { Pusher, PusherEvent } from "@pusher/pusher-websocket-react-native";
import { useContext, useEffect, useRef } from "react";

export const usePusher = () => {
  const { user } = useContext(UserContext);
  const { userToken } = useContext(AuthContext);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    const dynamicChannel = `private-user-${user.id}`;

    const initPusher = async () => {
      try {
        const pusher = Pusher.getInstance();
        pusherRef.current = pusher;

        await pusher.init({
          cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER as string,
          apiKey: process.env.EXPO_PUBLIC_PUSHER_API_KEY as string,
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
            onEvent: (event: PusherEvent) => {
              console.log("pusher-event received:", event);
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
  }, [user]);
};
