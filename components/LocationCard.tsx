import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const LocationCard = ({
  location,
  normalized_location,
  errorMsg,
}: {
  location: Location.LocationObject | null;
  normalized_location: Location.LocationGeocodedAddress | null;
  errorMsg?: string | null;
}) => {
  return (
    <View style={[styles.locationCard, errorMsg && styles.locationCardError]}>
      <View>
        <MapPin size={24} color={errorMsg ? "#B45309" : "#111827"} />
      </View>
      <View style={styles.locationCopy}>
        <Text style={styles.locationTextTitle}>CURRENT LOCATION</Text>
        {errorMsg ? (
          <View>
            <Text style={styles.locationTextName}>Location unavailable</Text>
            <Text style={styles.locationTextCity}>{errorMsg}</Text>
          </View>
        ) : normalized_location ? (
          <View>
            <Text style={styles.locationTextName}>
              {normalized_location?.name}
            </Text>
            <Text style={styles.locationTextCity}>
              {normalized_location?.city}
            </Text>
          </View>
        ) : (
          <Text style={styles.locationTextCity}>Checking location...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  locationCard: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingBlock: 18,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderColor: "#0A3909",
    borderWidth: 0.5,
    backgroundColor: "#FFFFFF",
    marginBlock: 24,
  },
  locationCardError: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },
  locationCopy: {
    flex: 1,
  },
  locationTextTitle: {
    marginBlock: 6,
  },
  locationTextName: {
    fontWeight: "700",
  },
  locationTextCity: {
    fontWeight: "400",
    fontSize: 14,
    color: "#42493E",
  },
});

export default LocationCard;
