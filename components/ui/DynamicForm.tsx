import { AuthContext } from "@/context/AuthContext";
import { alertsFormUid } from "@/services/api";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { jwtDecode } from "jwt-decode";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
interface Field {
  $xpath: string;
  type: string;
  label?: string | string[] | Record<string, any>;
  hint?: string | string[] | Record<string, any>;
  name?: string;
  required?: boolean;
  select_from_list_name?: string;
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

const formatKoboText = (value?: string | string[] | Record<string, any>) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(" ");
  if (typeof value === "object" && value !== null) {
    const firstValue = Object.values(value)[0];
    return formatKoboText(firstValue as any);
  }
  return "";
};

export default function DynamicForm({
  fields,
  alwaysShowMap = false,
  onSubmit,
  isSubmitting = false,
  isSuccess = false,
}: DynamicFormProps) {
  const { userToken } = useContext(AuthContext);
  const decoded: any = userToken ? jwtDecode(userToken) : null;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [locationPermission, setLocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [openSelectField, setOpenSelectField] = useState<string | null>(null);
  const [openDateField, setOpenDateField] = useState<string | null>(null);
  const [datePickerValue, setDatePickerValue] = useState<Date>(new Date());
  const [numberFocusField, setNumberFocusField] = useState<string | null>(null);
  const [isMapInteractive, setIsMapInteractive] = useState(false);

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

  const getFieldLabel = (field: Field) => {
    return formatKoboText(field.label) || field.name || field.$xpath;
  };

  const getSelectedChoiceLabel = (field: Field) => {
    const value = formData[field.$xpath];
    if (!value) return "";
    return (
      field.selectChoices?.find((choice) => choice.name === value)?.label ||
      String(value)
    );
  };

  const openSelectModal = (field: Field) => {
    setOpenSelectField(field.$xpath);
  };

  const openDatePicker = (field: Field) => {
    const value = formData[field.$xpath];
    const date = value ? new Date(value) : new Date();
    setDatePickerValue(date);
    if (
      Platform.OS === "android" &&
      DateTimePickerAndroid &&
      DateTimePickerAndroid.open
    ) {
      try {
        DateTimePickerAndroid.open({
          value: date,
          onChange: (event: any, selectedDate?: Date) => {
            if (event?.type === "dismissed") return;
            const d = selectedDate || date;
            handleChange(field.$xpath, d.toISOString().slice(0, 10));
          },
          mode: "date",
        });
      } catch (e) {
        // fallback to inline picker if Android API isn't available
        setOpenDateField(field.$xpath);
      }
      return;
    }
    setOpenDateField(field.$xpath);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setOpenDateField(null);
      return;
    }
    const date = selectedDate || datePickerValue;
    if (openDateField) {
      handleChange(openDateField, date.toISOString().slice(0, 10));
    }
    setOpenDateField(null);
    setDatePickerValue(date);
  };

  const incrementNumber = (xpath: string) => {
    const current = parseFloat(formData[xpath] || "0") || 0;
    handleChange(xpath, String(current + 1));
  };

  const decrementNumber = (xpath: string) => {
    const current = parseFloat(formData[xpath] || "0") || 0;
    if (current > 0) {
      handleChange(xpath, String(current - 1));
    }
  };

  const sanitizeNumber = (value: string, allowDecimal: boolean) => {
    const sanitized = value.replace(/[^0-9.]/g, "");
    if (!allowDecimal) return sanitized.replace(/\./g, "");

    const [wholeNumber, ...decimalParts] = sanitized.split(".");
    return decimalParts.length > 0
      ? `${wholeNumber}.${decimalParts.join("")}`
      : wholeNumber;
  };

  const toggleMultiSelect = (xpath: string, option: string) => {
    const current = formData[xpath] || [];
    if (current.includes(option)) {
      handleChange(
        xpath,
        current.filter((o: string) => o !== option),
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
      (field) => !formData[field.$xpath] || formData[field.$xpath] === "",
    );

    if (missingFields.length > 0) {
      const fieldNames = missingFields
        .map((field) => field.label || field.name)
        .join(", ");
      Alert.alert("Missing Required Fields", `Please fill in: ${fieldNames}`);
      return;
    }
    const submitData = {
      kobo_form_id: alertsFormUid,
      status: "pending",
      submitted_at: new Date().toISOString(),
      username: decoded?.username || "",
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
    // date
    if (field.type === "date" || field.type === "datetime") {
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {getFieldLabel(field)}
            {field.required ? " *" : ""}
          </Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => openDatePicker(field)}
          >
            <Text
              style={
                formData[field.$xpath]
                  ? styles.selectValueText
                  : styles.selectPlaceholderText
              }
            >
              {formData[field.$xpath] || "Select a date"}
            </Text>
          </TouchableOpacity>
          {openDateField === field.$xpath && Platform.OS === "ios" && (
            <DateTimePicker
              value={datePickerValue}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
        </View>
      );
    }

    // number / integer
    if (
      field.type === "integer" ||
      field.type === "number" ||
      field.type === "decimal"
    ) {
      const value = String(formData[field.$xpath] ?? "");
      const isFocused = numberFocusField === field.$xpath;
      const allowDecimal = field.type !== "integer";
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {getFieldLabel(field)}
            {field.required ? " *" : ""}
          </Text>
          <View style={styles.numberInputContainer}>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => decrementNumber(field.$xpath)}
            >
              <Text style={styles.numberButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={[
                styles.numberInput,
                isFocused && styles.numberInputFocused,
              ]}
              inputMode={allowDecimal ? "decimal" : "numeric"}
              keyboardType={allowDecimal ? "decimal-pad" : "number-pad"}
              placeholder="0"
              value={value}
              onFocus={() => setNumberFocusField(field.$xpath)}
              onBlur={() => setNumberFocusField(null)}
              onChangeText={(text) =>
                handleChange(field.$xpath, sanitizeNumber(text, allowDecimal))
              }
            />
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => incrementNumber(field.$xpath)}
            >
              <Text style={styles.numberButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // text
    if (field.type === "text") {
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {getFieldLabel(field)}
            {field.required ? " *" : ""}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter answer"
            value={formData[field.$xpath] || ""}
            onChangeText={(text) => handleChange(field.$xpath, text)}
          />
        </View>
      );
    }

    // select_one
    if (field.type.startsWith("select_one") && field.selectChoices) {
      const choices = field.selectChoices;
      const selectedLabel = getSelectedChoiceLabel(field);
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {getFieldLabel(field)}
            {field.required ? " *" : ""}
          </Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => openSelectModal(field)}
          >
            <Text
              style={
                selectedLabel
                  ? styles.selectValueText
                  : styles.selectPlaceholderText
              }
            >
              {selectedLabel || "Select an option"}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={openSelectField === field.$xpath}
            transparent
            animationType="fade"
            onRequestClose={() => setOpenSelectField(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{getFieldLabel(field)}</Text>
                <ScrollView style={styles.modalOptions}>
                  {choices.map((choice) => (
                    <TouchableOpacity
                      key={choice.name}
                      style={styles.modalOption}
                      onPress={() => {
                        handleChange(field.$xpath, choice.name);
                        setOpenSelectField(null);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{choice.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setOpenSelectField(null)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      );
    }

    // select_multiple
    if (field.type === "select_multiple" && field.selectChoices) {
      const selected = formData[field.$xpath] || [];
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {getFieldLabel(field)}
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

  const renderMap = () => {
    if (!currentLocation) return null;

    // Web doesn't support react-native-maps; show a simple fallback
    if (Platform.OS === "web") {
      return (
        <View style={styles.alwaysMapContainer}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <Text style={styles.mapInfoText}>
              📍 {currentLocation.latitude.toFixed(4)},{" "}
              {currentLocation.longitude.toFixed(4)}
            </Text>
            <Text style={styles.mapInfoText}>Map not available on web</Text>
          </View>
        </View>
      );
    }

    // Require react-native-maps at runtime on native platforms only
    // (avoids importing native-only modules on web)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RNMaps: any = require("react-native-maps");
    const MapViewComp = RNMaps.default || RNMaps.MapView || RNMaps;
    const MarkerComp = RNMaps.Marker;

    return (
      <View style={styles.alwaysMapContainer}>
        <View
          style={styles.mapViewport}
          pointerEvents={isMapInteractive ? "auto" : "none"}
        >
          <MapViewComp
            style={styles.alwaysMap}
            region={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={isMapInteractive}
            zoomEnabled={isMapInteractive}
            rotateEnabled={isMapInteractive}
            pitchEnabled={isMapInteractive}
            onPress={(event: any) => {
              const coordinate = event.nativeEvent.coordinate;
              setCurrentLocation(coordinate);
            }}
          >
            <MarkerComp
              coordinate={currentLocation}
              draggable={isMapInteractive}
              onDragEnd={(event: any) => {
                const coordinate = event.nativeEvent.coordinate;
                setCurrentLocation(coordinate);
              }}
            />
          </MapViewComp>
        </View>
        <View style={styles.mapInfo}>
          <Text style={[styles.mapInfoText, styles.mapInfoLocation]}>
            📍 {currentLocation.latitude.toFixed(4)},{" "}
            {currentLocation.longitude.toFixed(4)}
          </Text>
          <TouchableOpacity
            style={styles.mapEditButton}
            onPress={() => setIsMapInteractive((enabled) => !enabled)}
          >
            <Text style={styles.mapEditButtonText}>
              {isMapInteractive ? "Done" : "Edit map"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.formRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
        {fields.map(renderField)}

        {/* Always show map if enabled */}
        {alwaysShowMap && locationPermission && currentLocation && (
          <View style={styles.field}>
            <Text style={styles.label}>Observation Location *</Text>
            {renderMap()}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formRoot: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    padding: 16,
    paddingBottom: 140,
    flexGrow: 1,
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
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  numberButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#22C55E",
  },
  numberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    backgroundColor: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  numberInputFocused: {
    borderColor: "#22C55E",
    backgroundColor: "#f0fdf4",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    minHeight: 48,
    justifyContent: "center",
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
  },
  selectPlaceholderText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  selectValueText: {
    color: "#111827",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  modalOptions: {
    maxHeight: 240,
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#111827",
  },
  modalCancel: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
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
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginVertical: 8,
  },
  mapViewport: {
    flex: 1,
  },
  alwaysMap: {
    flex: 1,
  },
  mapInfo: {
    padding: 8,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  mapInfoText: {
    fontSize: 14,
    color: "#374151",
  },
  mapInfoLocation: {
    flex: 1,
  },
  mapEditButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
  },
  mapEditButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#15803D",
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
