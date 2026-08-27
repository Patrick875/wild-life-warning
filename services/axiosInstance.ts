import { deleteSecureItem, getSecureItem } from "@/utils/secureStore";
import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

const localApiHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

// export const baseUrl = `http://${localApiHost}:4800/api/v1`;
export const baseUrl = "https://wild-life-conserv-2.onrender.com/api/v1";
// export const baseUrl = "https://wild-life-conserv-2.onrender.com/api/v1";
//250780303031   kuxvytTodfam$Ko4
export const apiClient = axios.create({
  baseURL: baseUrl,
});

const unsafeErrorText = [
  "axios",
  "network error",
  "request failed",
  "timeout",
  "status code",
];

const isSafeDisplayMessage = (message?: unknown): message is string => {
  if (typeof message !== "string") return false;
  const trimmed = message.trim();
  if (!trimmed) return false;

  const normalized = trimmed.toLowerCase();
  return !unsafeErrorText.some((text) => normalized.includes(text));
};

export const getSafeErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    return isSafeDisplayMessage(serverMessage) ? serverMessage : fallback;
  }

  if (error instanceof Error && isSafeDisplayMessage(error.message)) {
    return error.message;
  }

  return fallback;
};

let isHandlingUnauthorized = false;
let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

const isAuthEndpoint = (url?: string) => {
  return !!url && url.startsWith("/auth/");
};

const isNonSessionEndpoint = (url?: string) => {
  return !!url && (url.includes("/pusher/auth") || url.includes("/uploads"));
};

apiClient.interceptors.request.use(async (config) => {
  const token = await getSecureItem("userToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (err) => {
    if (
      err?.response?.status === 401 &&
      !isAuthEndpoint(err.config?.url) &&
      !isNonSessionEndpoint(err.config?.url) &&
      !isHandlingUnauthorized
    ) {
      isHandlingUnauthorized = true;

      await deleteSecureItem("userToken");
      unauthorizedHandler?.();

      router.replace("/(auth)/login");
      Toast.show({
        type: "error",
        text1: getSafeErrorMessage(err, "Your session expired."),
        text2: "Login again",
      });

      setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 1500);
    }

    return Promise.reject(err);
  },
);
