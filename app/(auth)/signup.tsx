import { useRegister } from "@/services/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Picker } from "@react-native-picker/picker";
import { Link } from "expo-router";
import { ArrowLeft, Briefcase, Building2, ChevronDown, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

const OCCUPATIONS = [
  { label: "Farmer", value: "farmer" },
  { label: "Guide", value: "guide" },
  { label: "Other", value: "other" },
];

const schema = yup.object().shape({
  full_name: yup.string().trim().required("Full name is required"),
  phone_number: yup
    .string()
    .matches(/^[0-9]{9}$/, "Phone number must be 9 digits")
    .required("Phone number is required"),
  occupation: yup.string().required("Occupation is required"),
  organization: yup.string().trim().required("Organization is required"),
  email: yup.string().email("Enter a valid email").optional(),
  password: yup
    .string()
    .required("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 number"
    ),
  password_confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function SignUpScreen() {
  const { mutate, isPending } = useRegister();
  const [showOccupationPicker, setShowOccupationPicker] = useState(false);
  const [tempOccupation, setTempOccupation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      occupation: "",
      organization: "",
      email: "",
      password: "",
      password_confirm: "",
    },
  });

  const phoneDigits = watch("phone_number");

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      phone_number: `+250${data.phone_number}`,
    };
    mutate(payload);
  };

  const handleOccupationConfirm = () => {
    setValue("occupation", tempOccupation);
    setShowOccupationPicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
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
            <Text style={styles.subtitle}>Join us and start your journey today</Text>

            {/* Full Name */}
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, value } }) => (
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
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocusedInput("full_name")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.full_name && <Text style={styles.errorText}>{errors.full_name.message}</Text>}
                </View>
              )}
            />

            {/* Phone Number */}
            <Controller
              control={control}
              name="phone_number"
              render={({ field: { onChange, value } }) => (
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
                    <Text style={styles.phonePrefix}>+250</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="phone-pad"
                      value={value}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, "");
                        onChange(cleaned);
                      }}
                      onFocus={() => setFocusedInput("phone_number")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="7XX XXX XXX"
                      placeholderTextColor="#9CA3AF"
                      maxLength={9}
                    />
                  </View>
                  {errors.phone_number && <Text style={styles.errorText}>{errors.phone_number.message}</Text>}
                </View>
              )}
            />

            {/* Occupation */}
            <Controller
              control={control}
              name="occupation"
              render={({ field: { value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Occupation</Text>
                  <TouchableOpacity
                    style={[styles.pickerButton]}
                    onPress={() => {
                      setTempOccupation(value);
                      setShowOccupationPicker(true);
                    }}
                  >
                    <View style={styles.pickerButtonContent}>
                      <Briefcase size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <Text
                        style={[
                          styles.pickerButtonText,
                          !value && styles.pickerPlaceholder,
                        ]}
                      >
                        {value
                          ? OCCUPATIONS.find((occ) => occ.value === value)?.label
                          : "Select your occupation"}
                      </Text>
                    </View>
                    <ChevronDown size={20} color="#6B7280" />
                  </TouchableOpacity>
                  {errors.occupation && <Text style={styles.errorText}>{errors.occupation.message}</Text>}
                </View>
              )}
            />

            {/* Organization */}
            <Controller
              control={control}
              name="organization"
              render={({ field: { onChange, value } }) => (
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
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocusedInput("organization")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Enter your organization"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {errors.organization && <Text style={styles.errorText}>{errors.organization.message}</Text>}
                </View>
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email (optional)</Text>
                  <View style={styles.inputContainer}>
                    <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                </View>
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputContainer]}>
                    <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={value}
                      onChangeText={onChange}
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
                  {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                </View>
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="password_confirm"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={value}
                      onChangeText={onChange}
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
                  {errors.password_confirm && (
                    <Text style={styles.errorText}>{errors.password_confirm.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.signUpButton, isPending && styles.signUpButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              <Text style={styles.signUpButtonText}>
                {isPending ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Occupation Modal */}
        <Modal
          visible={showOccupationPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowOccupationPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowOccupationPicker(false)}>
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
              >
                {OCCUPATIONS.map((occupation) => (
                  <Picker.Item key={occupation.value} label={occupation.label} value={occupation.value} />
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
  phonePrefix: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    marginRight: 4,
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
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
});