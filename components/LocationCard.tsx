import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const LocationCard = ({
  location,
  normalized_location,
}: {
  location: Location.LocationObject | null;
  normalized_location: Location.LocationGeocodedAddress | null;
}) => {
  return (
    <View style={styles.locationCard}>
      <View>
        <MapPin size={24} />
      </View>
      <View>
        <Text style={styles.locationTextTitle}>CURRENT LOCATION</Text>
        {normalized_location && (
          <View>
            <Text style={styles.locationTextName}>
              {normalized_location?.name}
            </Text>
            <Text style={styles.locationTextCity}>
              {normalized_location?.city}
            </Text>
          </View>
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
  locationTextTitle: {
    marginBlock: 6,
  },
  locationTextName: {
    fontWeight: 700,
  },
  locationTextCity: {
    fontWeight: 400,
    fontSize: 14,
    color: "#42493E",
  },
});

export default LocationCard;
