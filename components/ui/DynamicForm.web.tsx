import FileUploader, { UploadedFile } from "@/components/ui/FileUploader";
import { AuthContext } from "@/context/AuthContext";
import { baseUrl } from "@/services/api";
import { Picker } from "@react-native-picker/picker";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import * as Location from "expo-location";
import { jwtDecode } from "jwt-decode";
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

interface Field {
  $xpath: string;
  type: string;
  label?: string | string[] | Record<string, any>;
  hint?: string | string[] | Record<string, any>;
  name?: string;
  required?: boolean;
  select_from_list_name?: string;
  selectChoices?: { name: string; label: string }[];
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
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          setLocationPermission(true);
          let loc = await Location.getCurrentPositionAsync({});
          setCurrentLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleChange = (xpath: string, value: any) => {
    setFormData((prev) => ({ ...prev, [xpath]: value }));
  };

  const getFieldLabel = (field: Field) => {
    return formatKoboText(field.label) || field.name || field.$xpath;
  };

  const getFieldIdentity = (field: Field) =>
    [field.name, field.$xpath, getFieldLabel(field)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");

  const fieldMatches = (field: Field, names: string[]) => {
    const identity = getFieldIdentity(field);
    return names.some((name) => identity.includes(name));
  };

  const speciesField = fields.find((field) => {
    const tokens = getFieldIdentity(field).split("_").filter(Boolean);
    return tokens.includes("species") || tokens.includes("animal");
  });

  const stepTwoNames = [
    "location",
    "number_of_animals",
    "behaviour",
    "behavior",
    "observation",
    "description",
    "threat_level",
    "eveidence",
    "evidence",
  ];

  const stepTwoFields = fields.filter(
    (field) =>
      field.$xpath !== speciesField?.$xpath && fieldMatches(field, stepTwoNames),
  );

  const stepThreeFields = fields.filter(
    (field) =>
      field.$xpath !== speciesField?.$xpath &&
      !stepTwoFields.some((stepField) => stepField.$xpath === field.$xpath),
  );

  const steps = [
    ...(speciesField
      ? [{ title: "Species", fields: [speciesField], kind: "species" }]
      : []),
    { title: "Alert details", fields: stepTwoFields, kind: "details" },
    ...(stepThreeFields.length > 0
      ? [{ title: "Additional details", fields: stepThreeFields, kind: "extra" }]
      : []),
  ].filter((step) => step.fields.length > 0 || step.kind === "details");

  const activeStep = steps[currentStep] || steps[0];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const animalOptions = [
    { label: "Elephant", value: "elephant", icon: "🐘" },
    { label: "Leopard", value: "leopard", icon: "🐆" },
    { label: "Tiger", value: "tiger", icon: "🐅" },
    { label: "Crocodile", value: "crocodile", icon: "🐊" },
    { label: "Rhino", value: "rhino", icon: "🦏" },
    { label: "Buffalo", value: "buffalo", icon: "🐃" },
    { label: "Lion", value: "lion", icon: "🦁" },
  ];

  const getChoiceValue = (field: Field, optionValue: string) => {
    const choice = field.selectChoices?.find((item) => {
      const label = item.label.toLowerCase();
      const name = item.name.toLowerCase();
      return label === optionValue || name === optionValue;
    });
    return choice?.name || optionValue;
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
      kobo_form_id: fields[0]?.$form_id || "unknown_form",
      status: "pending",
      submitted_at: new Date().toISOString(),
      username: decoded?.username || "",
      device_id: "web_device",
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

    if (onSubmit) await onSubmit(submitData);
  };

  const validateFields = (stepFields: Field[]) => {
    const missingFields = stepFields.filter(
      (field) =>
        field.required && (!formData[field.$xpath] || formData[field.$xpath] === ""),
    );
    if (missingFields.length > 0) {
      const fieldNames = missingFields
        .map((field) => getFieldLabel(field))
        .join(", ");
      Alert.alert("Missing Required Fields", `Please fill in: ${fieldNames}`);
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateFields(activeStep.fields)) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const renderSpeciesCards = (field: Field) => {
    const selected = formData[field.$xpath];
    const presetValues = animalOptions.map((option) =>
      getChoiceValue(field, option.value),
    );
    const isOtherSelected = selected && !presetValues.includes(selected);

    return (
      <View key={field.$xpath} style={styles.field}>
        <Text style={styles.label}>
          {getFieldLabel(field)}
          {field.required ? " *" : ""}
        </Text>
        <View style={styles.speciesGrid}>
          {animalOptions.map((option) => {
            const value = getChoiceValue(field, option.value);
            const active = selected === value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.speciesCard, active && styles.speciesCardActive]}
                onPress={() => handleChange(field.$xpath, value)}
              >
                <Text style={styles.speciesIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.speciesLabel,
                    active && styles.speciesLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TextInput
          style={[styles.input, styles.otherInput]}
          placeholder="Other animal name"
          value={isOtherSelected ? selected : ""}
          onChangeText={(text) => handleChange(field.$xpath, text)}
        />
      </View>
    );
  };

  const renderField = (field: Field) => {
    if (
      fieldMatches(field, ["eveidence", "evidence"]) ||
      ["image", "video", "file"].includes(field.type)
    ) {
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {getFieldLabel(field)}
            {field.required ? " *" : ""}
          </Text>
          <FileUploader
            value={(formData[field.$xpath] as UploadedFile[]) || []}
            onChange={(files) => handleChange(field.$xpath, files)}
            allowImages
            allowVideos
            allowDocuments={false}
            enableCamera
            multiple
            maxFiles={8}
            maxSizeMB={450}
            buttonText="Add evidence"
            uploadUrl={baseUrl + "/uploads/"}
            uploadKey={field.$xpath}
            uploadMode="immediate"
          />
          <Text style={styles.helperText}>
            Images and videos, up to 450MB each.
          </Text>
        </View>
      );
    }

    if (
      field.type === "text" ||
      field.type === "integer" ||
      field.type === "number" ||
      field.type === "date" ||
      field.type === "datetime"
    ) {
      const isMultiline = fieldMatches(field, ["observation", "description"]);
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {getFieldLabel(field)}
            {field.required ? " *" : ""}
          </Text>
          <TextInput
            style={[styles.input, isMultiline && styles.textArea]}
            keyboardType={
              field.type === "integer" || field.type === "number"
                ? "numeric"
                : "default"
            }
            placeholder={field.type === "date" ? "YYYY-MM-DD" : undefined}
            value={formData[field.$xpath] || ""}
            multiline={isMultiline}
            textAlignVertical={isMultiline ? "top" : "center"}
            onChangeText={(text) => handleChange(field.$xpath, text)}
          />
        </View>
      );
    }

    if (
      field.type.startsWith("select_one") &&
      (field.selectChoices || field.select_from_list_name)
    ) {
      const choices = field.selectChoices || [];
      const allowsOtherBehaviour = fieldMatches(field, ["behaviour", "behavior"]);
      const selectedValue = formData[field.$xpath];
      const isOtherValue =
        allowsOtherBehaviour &&
        selectedValue &&
        !choices.some((choice) => choice.name === selectedValue);
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {getFieldLabel(field)}
            {field.required ? " *" : ""}
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              mode="dropdown"
              style={styles.picker}
              itemStyle={styles.pickerItem}
              selectedValue={formData[field.$xpath] || ""}
              onValueChange={(value) => handleChange(field.$xpath, value)}
            >
              <Picker.Item label="Select..." value="" />
              {choices.map((choice) => (
                <Picker.Item
                  key={choice.name}
                  label={choice.label}
                  value={choice.name}
                />
              ))}
            </Picker>
          </View>
          {allowsOtherBehaviour && (
            <View style={styles.otherInput}>
              <Text style={styles.helperLabel}>Other behaviour</Text>
              <TextInput
                style={styles.input}
                placeholder="Describe behaviour"
                value={isOtherValue ? String(selectedValue) : ""}
                onChangeText={(text) => handleChange(field.$xpath, text)}
              />
            </View>
          )}
        </View>
      );
    }

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
      setCurrentStep(0);
    }
  }, [isSuccess]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEyebrow}>
          Step {currentStep + 1} of {steps.length}
        </Text>
        <Text style={styles.stepTitle}>{activeStep.title}</Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / steps.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {activeStep.kind === "species" && speciesField
        ? renderSpeciesCards(speciesField)
        : activeStep.fields.map(renderField)}

      {activeStep.kind === "details" &&
        alwaysShowMap &&
        locationPermission &&
        currentLocation && (
        <View style={styles.field}>
          <Text style={styles.label}>Observation Location *</Text>
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
        </View>
      )}

      <View style={styles.stepActions}>
        {!isFirstStep && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentStep((step) => Math.max(step - 1, 0))}
          >
            <ChevronLeft size={18} color="#15803D" />
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
            !isFirstStep && styles.primaryButtonCompact,
          ]}
          onPress={isLastStep ? handleSubmit : goNext}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : isLastStep ? "Submit" : "Next"}
          </Text>
          {!isLastStep && <ChevronRight size={18} color="white" />}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F9FAFB" },
  field: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 8 },
  helperLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
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
  textArea: {
    minHeight: 112,
    paddingTop: 12,
  },
  stepHeader: {
    marginBottom: 20,
  },
  stepEyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
  speciesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  speciesCard: {
    width: "47%",
    minHeight: 104,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  speciesCardActive: {
    borderColor: "#22C55E",
    backgroundColor: "#F0FDF4",
  },
  speciesIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  speciesLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  speciesLabelActive: {
    color: "#15803D",
  },
  otherInput: {
    marginTop: 12,
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
  picker: {
    width: "100%",
    height: 48,
  },
  pickerItem: {
    fontSize: 16,
  },
  multiSelectContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    margin: 4,
  },
  chipActive: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  chipText: { fontSize: 14, color: "#4B5563", fontWeight: "500" },
  chipTextActive: { color: "white" },
  alwaysMapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  mapInfoText: { fontSize: 14, color: "#374151", padding: 8 },
  submitButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 0,
    width: "100%",
  },
  stepActions: {
    alignItems: "stretch",
    gap: 10,
    marginTop: 12,
  },
  secondaryButton: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803D",
  },
  primaryButtonCompact: {
    marginTop: 0,
  },
  submitButtonDisabled: { backgroundColor: "#9CA3AF" },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "600" },
});
