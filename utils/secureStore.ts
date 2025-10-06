// secureStore.js
import * as SecureStore from "expo-secure-store";

export const ACCESS_KEY = "accessToken";
export const REFRESH_KEY = "refreshToken";

export async function saveItem(key, value) {
	if (!value) return;
	await SecureStore.setItemAsync(key, value, {
		keychainAccessible: SecureStore.WHEN_UNLOCKED,
	});
}

export async function getItem(key) {
	return await SecureStore.getItemAsync(key);
}

export async function deleteItem(key) {
	return await SecureStore.deleteItemAsync(key);
}
