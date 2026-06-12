import DynamicForm from "@/components/ui/DynamicForm";
import {
  useGetFormDetails,
  useGetFormStructure,
  useSubmitObservation,
} from "@/services/alert";
import { alertsFormUid } from "@/services/api";
import { getSafeErrorMessage } from "@/services/axiosInstance";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CollectScreen() {
  const router = useRouter();
  const { isLoading: isLoadingFormDetails } = useGetFormDetails({
    formId: alertsFormUid,
  });
  const {
    data: fields,
    isLoading,
    error,
  } = useGetFormStructure({
    formId: alertsFormUid,
  });

  const {
    mutate: submitObs,
    isPending,
    isSuccess,
  } = useSubmitObservation({ formId: alertsFormUid });

  const handleSubmitData = (data: any) => {
    submitObs(data.submission_data, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Form submitted successfully!" });
        router.push("/(tabs)");
      },
      onError: (err) => {
        Toast.show({
          type: "error",
          text1: "Submission failed",
          text2: getSafeErrorMessage(
            err,
            "Please check the form and try again.",
          ),
        });
      },
    });
  };

  if (isLoading || isLoadingFormDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.loadingText}>Loading form...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error loading form</Text>
          <Text style={styles.errorDetails}>
            {getSafeErrorMessage(error, "Please try again in a moment.")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>No form fields available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wildlife Observation</Text>
        <Text style={styles.subtitle}>
          Record your sightings and contribute to conservation
        </Text>
      </View>
      <DynamicForm
        fields={fields}
        alwaysShowMap={true}
        onSubmit={handleSubmitData}
        isSubmitting={isPending}
        isSuccess={isSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 20,
  },
  inputGroup: {
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
    backgroundColor: "#F9FAFB",
  },
  inputWithIcon: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 12,
    zIndex: 1,
  },
  inputWithPadding: {
    paddingLeft: 48,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
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
  submitButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
