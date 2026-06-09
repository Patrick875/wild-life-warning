// secureStore.js
import * as SecureStore from "expo-secure-store";

export const ACCESS_KEY = "accessToken";
export const REFRESH_KEY = "refreshToken";

export async function saveSecureItem(key: string, value: any) {
  if (!value) return;
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function getSecureItem(key: string) {
  return await SecureStore.getItemAsync(key);
}

export async function deleteSecureItem(key: string) {
  return await SecureStore.deleteItemAsync(key);
}
