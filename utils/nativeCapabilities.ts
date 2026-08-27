import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

export const isExpoGo = Constants.appOwnership === "expo";

const pushNotificationsDisabled =
  process.env.EXPO_PUBLIC_DISABLE_PUSH_NOTIFICATIONS === "true";

export const canUseNativePushNotifications =
  !pushNotificationsDisabled && !isExpoGo && Platform.OS !== "web";

export const isNativePusherModuleAvailable = () =>
  Boolean(NativeModules.PusherWebsocketReactNative);

export const canUseNativePusher = () =>
  !pushNotificationsDisabled &&
  !isExpoGo &&
  Platform.OS !== "web" &&
  isNativePusherModuleAvailable();
