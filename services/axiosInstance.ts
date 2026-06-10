import { deleteSecureItem, getSecureItem } from "@/utils/secureStore";
import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

const localApiHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const baseUrl = `http://${localApiHost}:4800/api/v1`;
// export const baseUrl = "https://wild-life-conserv-2.onrender.com/api/v1";

export const apiClient = axios.create({
  baseURL: baseUrl,
});

let isHandlingUnauthorized = false;
let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

const isAuthEndpoint = (url?: string) => {
  return !!url && url.startsWith("/auth/");
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
      !isHandlingUnauthorized
    ) {
      isHandlingUnauthorized = true;

      await deleteSecureItem("userToken");
      unauthorizedHandler?.();

      router.replace("/(auth)/login");
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || "Unauthorized access.",
        text2: "Login again",
      });

      setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 1500);
    }

    return Promise.reject(err);
  },
);
