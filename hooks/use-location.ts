import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { getSafeCurrentLocation } from "@/utils/location";

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [normalized_location, setNormalized_location] =
    useState<Location.LocationGeocodedAddress | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      try {
        const { location } = await getSafeCurrentLocation();
        setLocation(location);
        let n_location = await Location.reverseGeocodeAsync({
          latitude: location?.coords?.latitude,
          longitude: location?.coords?.longitude,
        });
        if (n_location && n_location?.length !== 0) {
          setNormalized_location(n_location[0]);
        }
      } catch (error) {
        setErrorMsg(
          error instanceof Error
            ? error.message
            : "Current location is unavailable. Turn on location services and try again.",
        );
      }
    }

    getCurrentLocation();
  }, []);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return {
    location: location,
    normalized_location: normalized_location,
    isError: !!errorMsg,
    errorMsg,
  };
};

export const useLocationName = ({
  lat,
  lng,
  withCountry = false,
}: {
  lat?: number;
  lng?: number;
  withCountry?: boolean;
}) => {
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    const getLocationName = async () => {
      if (lat == null || lng == null) {
        setLocationName("");
        return;
      }

      try {
        const result = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });

        if (result.length > 0) {
          const location = result[0];
          let returnLocation = [
            location.name,
            location.city,
            // location.country,
          ]
            .filter(Boolean)
            .join(", ");

          if (withCountry) {
            returnLocation = returnLocation + `, ${location.country}`;
          }
          setLocationName(
            returnLocation?.split(", ").filter(Boolean).join(", "),
          );
        }
      } catch (error) {
        console.error("Failed to reverse geocode:", error);
        setLocationName("");
      }
    };

    getLocationName();
  }, [lat, lng]);

  return { locationName };
};
