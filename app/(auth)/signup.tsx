import { Link, router } from "expo-router";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

const OCCUPATIONS = [
  { label: "Farmer", value: "farmer" },
  { label: "Guide", value: "guide" },
  { label: "Other", value: "other" },
];

export default function SignUpScreen() {
  const [form, setForm] = useState({
    name: "",
    telephone: "",
    occupation: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showOccupationPicker, setShowOccupationPicker] = useState(false);
  const [tempOccupation, setTempOccupation] = useState("");

  const handleSignUp = async () => {
    // Validation
    if (!form.name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    if (!form.telephone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    if (!form.occupation) {
      Alert.alert("Error", "Please select your occupation");
      return;
    }
    if (!form.password) {
      Alert.alert("Error", "Please enter a password");
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // TODO: Implement actual sign up logic
    console.log("Sign up with:", form);
    router.replace("/(tabs)");
  };

  const getOccupationLabel = (value: string) => {
    const occupation = OCCUPATIONS.find((occ) => occ.value === value);
    return occupation ? occupation.label : "Select your occupation";
  };

  const handleOccupationSelect = () => {
    setTempOccupation(form.occupation);
    setShowOccupationPicker(true);
  };

  const handleOccupationConfirm = () => {
    setForm({ ...form, occupation: tempOccupation });
    setShowOccupationPicker(false);
  };

  const handleOccupationCancel = () => {
    setTempOccupation("");
    setShowOccupationPicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={24} color="#22C55E" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.title}>Create Account</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={form.telephone}
              onChangeText={(text) => setForm({ ...form, telephone: text })}
              placeholder="Enter your phone number"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Occupation</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={handleOccupationSelect}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  !form.occupation && styles.pickerPlaceholder,
                ]}
              >
                {getOccupationLabel(form.occupation)}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              placeholder="Create a password"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={form.confirmPassword}
              onChangeText={(text) =>
                setForm({ ...form, confirmPassword: text })
              }
              placeholder="Confirm your password"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(tabs)" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* iOS-style Modal Picker */}
      <Modal
        visible={showOccupationPicker}
        transparent
        animationType="slide"
        onRequestClose={handleOccupationCancel}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleOccupationCancel}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleOccupationCancel}>
                <Text style={styles.modalCancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Occupation</Text>
              <TouchableOpacity onPress={handleOccupationConfirm}>
                <Text style={styles.modalDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={tempOccupation}
              onValueChange={(itemValue) => setTempOccupation(itemValue)}
              style={styles.modalPicker}
            >
              {OCCUPATIONS.map((occupation) => (
                <Picker.Item
                  key={occupation.value}
                  label={occupation.label}
                  value={occupation.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
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
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#1F2937",
  },
  pickerPlaceholder: {
    color: "#9CA3AF",
  },
  signUpButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 16,
  },
  signInLink: {
    color: "#22C55E",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalCancelButton: {
    fontSize: 16,
    color: "#6B7280",
  },
  modalDoneButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22C55E",
  },
  modalPicker: {
    width: "100%",
  },
});
