import * as Location from "expo-location";

export type SafeLocationResult = {
  location: Location.LocationObject;
  isLastKnown: boolean;
};

const LOCATION_ERROR =
  "Current location is unavailable. Turn on location services and try again.";

const getLastKnownLocation = async () => {
  return Location.getLastKnownPositionAsync({
    maxAge: 10 * 60 * 1000,
    requiredAccuracy: 5000,
  });
};

export const getSafeCurrentLocation = async (): Promise<SafeLocationResult> => {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    throw new Error(
      "Location permission is off. Enable it to attach your observation location.",
    );
  }

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error(LOCATION_ERROR);
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: true,
    });

    return { location, isLastKnown: false };
  } catch {
    const lastKnownLocation = await getLastKnownLocation();

    if (lastKnownLocation) {
      return { location: lastKnownLocation, isLastKnown: true };
    }

    throw new Error(LOCATION_ERROR);
  }
};
