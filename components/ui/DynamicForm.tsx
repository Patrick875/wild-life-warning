import FileUploader, { UploadedFile } from "@/components/ui/FileUploader";
import { AuthContext } from "@/context/AuthContext";
import { alertsFormUid } from "@/services/api";
import { baseUrl } from "@/services/axiosInstance";
import { getSafeCurrentLocation } from "@/utils/location";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { jwtDecode } from "jwt-decode";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
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
  const scrollRef = useRef<ScrollView>(null);
  const scrollPositionsRef = useRef<Record<number, number>>({});

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [openSelectField, setOpenSelectField] = useState<string | null>(null);
  const [openDateField, setOpenDateField] = useState<string | null>(null);
  const [datePickerValue, setDatePickerValue] = useState<Date>(new Date());
  const [numberFocusField, setNumberFocusField] = useState<string | null>(null);
  const [isMapInteractive, setIsMapInteractive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const requestCurrentLocation = async () => {
    setLocationError(null);

    try {
      const { location, isLastKnown } = await getSafeCurrentLocation();
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (isLastKnown) {
        setLocationError("Using your last known location.");
      }
    } catch (error) {
      setCurrentLocation(null);
      setLocationError(
        error instanceof Error
          ? error.message
          : "Current location is unavailable. Turn on location services and try again.",
      );
    }
  };

  useEffect(() => {
    requestCurrentLocation();
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
      field.$xpath !== speciesField?.$xpath &&
      fieldMatches(field, stepTwoNames),
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
      ? [
          {
            title: "Additional details",
            fields: stepThreeFields,
            kind: "extra",
          },
        ]
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
      } catch {
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
        evidence: formData?.evidence ? JSON.stringify(formData.evidence) : "",
        location:
          alwaysShowMap && currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }
            : undefined,
      },
    };

    if (alwaysShowMap && !currentLocation) {
      Alert.alert(
        "Location unavailable",
        locationError ||
          "Please enable location services before submitting this warning.",
      );
      return;
    }

    if (onSubmit) {
      await onSubmit(submitData);
    }
  };

  const validateFields = (stepFields: Field[]) => {
    const missingFields = stepFields.filter(
      (field) =>
        field.required &&
        (!formData[field.$xpath] || formData[field.$xpath] === ""),
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

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
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
      const isMultiline = fieldMatches(field, ["observation", "description"]);
      return (
        <View key={field.$xpath} style={styles.field}>
          <Text style={styles.label}>
            {getFieldLabel(field)}
            {field.required ? " *" : ""}
          </Text>
          <TextInput
            style={[styles.input, isMultiline && styles.textArea]}
            placeholder="Enter answer"
            value={formData[field.$xpath] || ""}
            multiline={isMultiline}
            textAlignVertical={isMultiline ? "top" : "center"}
            onChangeText={(text) => handleChange(field.$xpath, text)}
          />
        </View>
      );
    }

    // select_one
    if (field.type.startsWith("select_one") && field.selectChoices) {
      const choices = field.selectChoices;
      const allowsOtherBehaviour = fieldMatches(field, [
        "behaviour",
        "behavior",
      ]);
      const selectedValue = formData[field.$xpath];
      const selectedChoice = choices.find(
        (choice) => choice.name === selectedValue,
      );
      const isOtherValue =
        allowsOtherBehaviour &&
        selectedValue &&
        !choices.some((choice) => choice.name === selectedValue);
      const isOpen = openSelectField === field.$xpath;
      const usesIosModalSelect =
        Platform.OS === "ios" &&
        fieldMatches(field, ["threat_level", "urgency"]);

      if (usesIosModalSelect) {
        return (
          <View key={field.$xpath} style={styles.field}>
            <Text style={styles.label}>
              {getFieldLabel(field)}
              {field.required ? " *" : ""}
            </Text>
            <TouchableOpacity
              style={[
                styles.modalSelectButton,
                isOpen && styles.modalSelectButtonFocused,
              ]}
              activeOpacity={0.8}
              onPress={() => setOpenSelectField(field.$xpath)}
            >
              <Text
                style={
                  selectedChoice
                    ? styles.selectValueText
                    : styles.selectPlaceholderText
                }
              >
                {selectedChoice?.label || "Select an option"}
              </Text>
              <ChevronDown size={20} color={isOpen ? "#22C55E" : "#6B7280"} />
            </TouchableOpacity>
            <Modal
              visible={isOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setOpenSelectField(null)}
            >
              <View style={styles.selectModalOverlay}>
                <TouchableOpacity
                  style={StyleSheet.absoluteFill}
                  activeOpacity={1}
                  onPress={() => setOpenSelectField(null)}
                />
                <View style={styles.selectModalSheet}>
                  <Text style={styles.selectModalTitle}>{getFieldLabel(field)}</Text>
                  {choices.map((choice) => {
                    const active = choice.name === selectedValue;
                    return (
                      <TouchableOpacity
                        key={choice.name}
                        style={[
                          styles.selectModalOption,
                          active && styles.selectModalOptionActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          handleChange(field.$xpath, choice.name);
                          setOpenSelectField(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.selectModalOptionText,
                            active && styles.selectModalOptionTextActive,
                          ]}
                        >
                          {choice.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Modal>
          </View>
        );
      }

      return (
        <View
          key={field.$xpath}
          style={[styles.field, isOpen && styles.dropdownFieldOpen]}
        >
          <Text style={styles.label}>
            {getFieldLabel(field)}
            {field.required ? " *" : ""}
          </Text>
          <DropDownPicker
            open={isOpen}
            value={selectedValue || null}
            items={choices.map((choice) => ({
              label: choice.label,
              value: choice.name,
            }))}
            setOpen={(callback) => {
              const nextOpen =
                typeof callback === "function" ? callback(isOpen) : callback;
              setOpenSelectField(nextOpen ? field.$xpath : null);
            }}
            setValue={(callback) => {
              const nextValue =
                typeof callback === "function"
                  ? callback(selectedValue || null)
                  : callback;
              handleChange(field.$xpath, nextValue);
            }}
            onChangeValue={() => setOpenSelectField(null)}
            placeholder="Select an option"
            listMode="SCROLLVIEW"
            maxHeight={220}
            style={[styles.dropdown, isOpen && styles.dropdownFocused]}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedItemLabelStyle={styles.dropdownSelectedText}
            ArrowDownIconComponent={() => (
              <ChevronDown size={20} color="#6B7280" />
            )}
            ArrowUpIconComponent={() => (
              <ChevronDown
                size={20}
                color="#22C55E"
                style={styles.dropdownArrowUp}
              />
            )}
          />
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
      setCurrentStep(0);
      scrollPositionsRef.current = {};
    }
  }, [isSuccess]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: scrollPositionsRef.current[currentStep] || 0,
        animated: false,
      });
    });
  }, [currentStep]);

  const renderMap = () => {
    if (!currentLocation) {
      return (
        <View style={styles.locationFallback}>
          <Text style={styles.locationFallbackTitle}>Location unavailable</Text>
          <Text style={styles.locationFallbackText}>
            {locationError ||
              "Turn on location services to attach coordinates to this warning."}
          </Text>
          <TouchableOpacity
            style={styles.locationRetryButton}
            onPress={requestCurrentLocation}
          >
            <Text style={styles.locationRetryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScroll={(event) => {
          scrollPositionsRef.current[currentStep] =
            event.nativeEvent.contentOffset.y;
        }}
      >
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

        {/* Always show map if enabled */}
        {activeStep.kind === "details" &&
          alwaysShowMap && (
            <View style={styles.field}>
              <Text style={styles.label}>Observation Location *</Text>
              {renderMap()}
            </View>
          )}

        <View style={styles.stepActions}>
          {!isFirstStep && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={goBack}
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
  locationFallback: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 8,
    backgroundColor: "#FFFBEB",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  locationFallbackTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#92400E",
    marginBottom: 8,
    textAlign: "center",
  },
  locationFallbackText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#78350F",
    textAlign: "center",
    marginBottom: 14,
  },
  locationRetryButton: {
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: "#2D5A27",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  locationRetryButtonText: {
    color: "white",
    fontWeight: "800",
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
  dropdownFieldOpen: {
    zIndex: 1000,
  },
  dropdown: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
  },
  dropdownFocused: {
    borderColor: "#22C55E",
  },
  dropdownContainer: {
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#111827",
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
  },
  dropdownSelectedText: {
    color: "#15803D",
    fontWeight: "700",
  },
  dropdownArrowUp: {
    transform: [{ rotate: "180deg" }],
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
  modalSelectButton: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  modalSelectButtonFocused: {
    borderColor: "#22C55E",
  },
  selectModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.36)",
    justifyContent: "flex-end",
  },
  selectModalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 28,
  },
  selectModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  selectModalOption: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  selectModalOptionActive: {
    backgroundColor: "#F0FDF4",
  },
  selectModalOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  selectModalOptionTextActive: {
    color: "#15803D",
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
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
