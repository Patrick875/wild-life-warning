import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

export const isExpoGo = Constants.appOwnership === "expo";

export const canUseNativePushNotifications =
  !isExpoGo && Platform.OS !== "web";

export const isNativePusherModuleAvailable = () =>
  Boolean(NativeModules.PusherWebsocketReactNative);

export const canUseNativePusher = () =>
  !isExpoGo && Platform.OS !== "web" && isNativePusherModuleAvailable();
