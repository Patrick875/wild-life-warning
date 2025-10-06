import { useRegister } from "@/services/auth";
import { Picker } from "@react-native-picker/picker";
import { Link } from "expo-router";
import { ArrowLeft, Briefcase, Building2, ChevronDown, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OCCUPATIONS = [
  { label: "Farmer", value: "farmer" },
  { label: "Guide", value: "guide" },
  { label: "Other", value: "other" },
];

export default function SignUpScreen() {
  const { mutate, isPending } = useRegister();
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    occupation: "",
    email: "",
    password: "",
    password_confirm: "",
    organization: "",
  });
  const [showOccupationPicker, setShowOccupationPicker] = useState(false);
  const [tempOccupation, setTempOccupation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSignUp = async () => {
    console.log("Sign up with:", form);

    // Validation
    if (!form.full_name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    if (!form.phone_number.trim()) {
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
    if (form.password !== form.password_confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    mutate(form);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
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
          automaticallyAdjustKeyboardInsets={true}
        >
          <View style={styles.form}>
            <Text style={styles.subtitle}>
              Join us and start your journey today
            </Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === "full_name" && styles.inputContainerFocused,
                ]}
              >
                <User
                  size={20}
                  color={focusedInput === "full_name" ? "#22C55E" : "#9CA3AF"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={form.full_name}
                  onChangeText={(text) => setForm({ ...form, full_name: text })}
                  onFocus={() => setFocusedInput("full_name")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === "phone_number" && styles.inputContainerFocused,
                ]}
              >
                <Phone
                  size={20}
                  color={focusedInput === "phone_number" ? "#22C55E" : "#9CA3AF"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={form.phone_number}
                  onChangeText={(text) =>
                    setForm({ ...form, phone_number: text })
                  }
                  onFocus={() => setFocusedInput("phone_number")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Occupation */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Occupation</Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  focusedInput === "occupation" && styles.pickerButtonFocused,
                ]}
                onPress={handleOccupationSelect}
              >
                <View style={styles.pickerButtonContent}>
                  <Briefcase size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !form.occupation && styles.pickerPlaceholder,
                    ]}
                  >
                    {getOccupationLabel(form.occupation)}
                  </Text>
                </View>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Organization */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Organization</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === "organization" && styles.inputContainerFocused,
                ]}
              >
                <Building2
                  size={20}
                  color={focusedInput === "organization" ? "#22C55E" : "#9CA3AF"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={form.organization}
                  onChangeText={(text) =>
                    setForm({ ...form, organization: text })
                  }
                  onFocus={() => setFocusedInput("organization")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your organization"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (optional)</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === "email" && styles.inputContainerFocused,
                ]}
              >
                <Mail
                  size={20}
                  color={focusedInput === "email" ? "#22C55E" : "#9CA3AF"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === "password" && styles.inputContainerFocused,
                ]}
              >
                <Lock
                  size={20}
                  color={focusedInput === "password" ? "#22C55E" : "#9CA3AF"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={form.password}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === "password_confirm" &&
                    styles.inputContainerFocused,
                ]}
              >
                <Lock
                  size={20}
                  color={
                    focusedInput === "password_confirm" ? "#22C55E" : "#9CA3AF"
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={form.password_confirm}
                  onChangeText={(text) =>
                    setForm({ ...form, password_confirm: text })
                  }
                  onFocus={() => setFocusedInput("password_confirm")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isPending && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={isPending}
            >
              <Text style={styles.signUpButtonText}>
                {isPending ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Footer */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
    paddingBottom: 40,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: "#22C55E",
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    padding: 0,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F9FAFB",
    height: 56,
  },
  pickerButtonFocused: {
    borderColor: "#22C55E",
    backgroundColor: "#FFFFFF",
  },
  pickerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#22C55E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signUpButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 15,
  },
  signInLink: {
    color: "#22C55E",
    fontSize: 15,
    fontWeight: "700",
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