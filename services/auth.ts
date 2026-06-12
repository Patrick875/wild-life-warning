import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { apiClient, getSafeErrorMessage } from "./axiosInstance";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: { identifier: string; password: string }) => {
      return await apiClient.post("/auth/login", data, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (res) => {
      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "Welcome back!",
      });
    },
    onError: (err: any) => {
      const message = getSafeErrorMessage(
        err,
        "Login failed. Please try again.",
      );
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: message,
      });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.post("/auth/register", data, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (res) => {
      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "You can now log in.",
      });
      router.push("/(auth)/login");
    },
    onError: (err: any) => {
      const message = getSafeErrorMessage(
        err,
        "Registration failed. Please try again.",
      );
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: message,
      });
    },
  });
};
