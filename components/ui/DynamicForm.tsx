import { AuthContext } from "@/context/AuthContext";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { jwtDecode } from 'jwt-decode';
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
interface Field {
  $xpath: string;
  type: string;
  label?: string;
  name?: string;
  required?: boolean;
  selectChoices?: { name: string; label: string }[]; // Kobo choices
  $form_id?: string;
}

interface DynamicFormProps {
  fields: Field[];
  alwaysShowMap?: boolean;
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
  isSuccess?: boolean;
}

export default function DynamicForm({
  fields,
  alwaysShowMap = false,
  onSubmit,
  isSubmitting = false,
  isSuccess = false,
}: DynamicFormProps) {
  const {userToken}=useContext(AuthContext)
  const decoded:any= userToken ? jwtDecode(userToken) : null;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [locationPermission, setLocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ask for permission
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationPermission(true);
        let loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  const handleChange = (xpath: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [xpath]: value,
    }));
  };

  const toggleMultiSelect = (xpath: string, option: string) => {
    const current = formData[xpath] || [];
    if (current.includes(option)) {
      handleChange(
        xpath,
        current.filter((o: string) => o !== option)
      );
    } else {
      handleChange(xpath, [...current, option]);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // check required fields
    const requiredFields = fields.filter((field) => field.required);
    const missingFields = requiredFields.filter(
      (field) => !formData[field.$xpath] || formData[field.$xpath] === ""
    );

    if (missingFields.length > 0) {
      const fieldNames = missingFields
        .map((field) => field.label || field.name)
        .join(", ");
      Alert.alert("Missing Required Fields", `Please fill in: ${fieldNames}`);
      return;
    }

    const submitData = {
      kobo_form_id: fields[0]?.$form_id || "unknown_form",
      status: "pending",
      submitted_at: new Date().toISOString(),
      username: decoded?.username || '',
      device_id: "mobile_device_123",
      submission_data: {
        ...formData,
        location:
          alwaysShowMap && currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }
            : undefined,
      },
    };

    if (onSubmit) {
      await onSubmit(submitData);
    }
  };

  const renderField = (field: Field) => {
    // text / integer / number
    if (
      field.type === "text" ||
      field.type === "integer" ||
      field.type === "number"
    ) {
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {field.label || field.name}
            {field.required ? " *" : ""}
          </Text>
          <TextInput
            style={styles.input}
            keyboardType={
              field.type === "integer" || field.type === "number"
                ? "numeric"
                : "default"
            }
            value={formData[field.$xpath] || ""}
            onChangeText={(text) => handleChange(field.$xpath, text)}
          />
        </View>
      );
    }

    // select_one
    if (field.type === "select_one" && field.selectChoices) {
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {field.label || field.name}
            {field.required ? " *" : ""}
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData[field.$xpath] || ""}
              onValueChange={(value) => handleChange(field.$xpath, value)}
            >
              <Picker.Item label="Select..." value="" />
              {field.selectChoices.map((choice) => (
                <Picker.Item
                  key={choice.name}
                  label={choice.label}
                  value={choice.name}
                />
              ))}
            </Picker>
          </View>
        </View>
      );
    }

    // select_multiple
    if (field.type === "select_multiple" && field.selectChoices) {
      const selected = formData[field.$xpath] || [];
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {field.label || field.name}
            {field.required ? " *" : ""}
          </Text>
          <View style={styles.multiSelectContainer}>
            {field.selectChoices.map((choice) => {
              const active = selected.includes(choice.name);
              return (
                <TouchableOpacity
                  key={choice.name}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleMultiSelect(field.$xpath, choice.name)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {choice.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }

    return null;
  };
  useEffect(() => {
    if (isSuccess) {
      setFormData({});
    }
  }, [isSuccess]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {fields.map(renderField)}

      {/* Always show map if enabled */}
      {alwaysShowMap && locationPermission && currentLocation && (
        <View style={styles.field}>
          <Text style={styles.label}>Observation Location *</Text>
          <View style={styles.alwaysMapContainer}>
            <MapView
              style={styles.alwaysMap}
              region={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(event) => {
                const coordinate = event.nativeEvent.coordinate;
                setCurrentLocation(coordinate);
              }}
            >
              <Marker
                coordinate={currentLocation}
                draggable
                onDragEnd={(event) => {
                  const coordinate = event.nativeEvent.coordinate;
                  setCurrentLocation(coordinate);
                }}
              />
            </MapView>
            <View style={styles.mapInfo}>
              <Text style={styles.mapInfoText}>
                📍 {currentLocation.latitude.toFixed(4)},{" "}
                {currentLocation.longitude.toFixed(4)} • Tap or drag to select
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Submit button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  multiSelectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    margin: 4,
  },
  chipActive: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  chipText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "white",
  },
  alwaysMapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  alwaysMap: {
    flex: 1,
  },
  mapInfo: {
    padding: 8,
    backgroundColor: "white",
  },
  mapInfoText: {
    fontSize: 14,
    color: "#374151",
  },
  submitButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
