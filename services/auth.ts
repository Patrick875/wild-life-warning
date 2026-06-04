import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { api } from "./api";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: { identifier: string; password: string }) => {
      return await api.post("/auth/login", data, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (res) => {
      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "Welcome back!",
      });
      router.push("/(tabs)");
    },
    onError: (err: any) => {
      console.log("err", err);
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: message,
      });
    },
  });
};

export const useRegister = () => {
  console.log("here");
  return useMutation({
    mutationFn: async (data: any) => {
      console.log("Register Payload:", data);
      return await api.post("/auth/register", data, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (res) => {
      console.log("register-result", res);
      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "You can now log in.",
      });
      router.push("/(auth)/login");
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: message,
      });
    },
  });
};
