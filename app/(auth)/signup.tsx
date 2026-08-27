import { useRegister } from "@/services/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

const OCCUPATIONS = [
  { label: "Farmer", value: "FARMER" },
  { label: "Guide", value: "PARK_GUARD" },
];

const EAC_COUNTRY_CODES = [
  { country: "Rwanda", code: "250", localLength: 9, example: "788123456" },
  { country: "Kenya", code: "254", localLength: 9, example: "712345678" },
  { country: "Uganda", code: "256", localLength: 9, example: "712345678" },
  { country: "Tanzania", code: "255", localLength: 9, example: "712345678" },
  { country: "Burundi", code: "257", localLength: 8, example: "79123456" },
  { country: "DR Congo", code: "243", localLength: 9, example: "812345678" },
  { country: "South Sudan", code: "211", localLength: 9, example: "912345678" },
  { country: "Somalia", code: "252", localLength: 8, example: "61123456" },
];

const DEFAULT_COUNTRY_CODE = EAC_COUNTRY_CODES[0];

const sanitizePhoneNumber = (value: string) => {
  return value.replace(/\D/g, "");
};

const normalizeLocalPhoneNumber = (value: string) => {
  return sanitizePhoneNumber(value).replace(/^0+/, "");
};

const formatPhonePreview = (countryCode: string, localNumber: string) => {
  const normalizedLocalNumber = normalizeLocalPhoneNumber(localNumber);
  return normalizedLocalNumber ? `+${countryCode}${normalizedLocalNumber}` : "";
};

const schema = yup.object().shape({
  fullName: yup.string().trim().required("Full name is required"),
  phoneNumber: yup
    .string()
    .trim()
    .test(
      "valid-local-phone",
      "Enter the local number without the country code",
      (value) => {
        const normalized = normalizeLocalPhoneNumber(value || "");
        return normalized.length >= 8 && normalized.length <= 10;
      },
    )
    .required("Phone number is required"),
  occupation: yup.string().required("Occupation is required"),
  organization: yup.string().trim().required("Organization is required"),
  email: yup
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .trim()
    .lowercase()
    .email("Enter a valid email")
    .optional(),
  password: yup
    .string()
    .required("Password is required")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&_])[A-Za-z\d@$!%*#?&_]{6,}$/,
      "Password must be at least 6 characters and include 1 letter, 1 number, and 1 special character.",
    ),
  password_confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function SignUpScreen() {
  const { mutate, isPending } = useRegister();
  const [occupationOpen, setOccupationOpen] = useState(false);
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] =
    useState(DEFAULT_COUNTRY_CODE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      occupation: "",
      organization: "",
      email: "",
      password: "",
      password_confirm: "",
    },
  });

  const onSubmit = (data: any) => {
    const email = data.email?.trim().toLowerCase();
    const localPhoneNumber = normalizeLocalPhoneNumber(data.phoneNumber);
    if (localPhoneNumber.length !== selectedCountryCode.localLength) {
      Alert.alert(
        "Check phone number",
        `${selectedCountryCode.country} numbers should have ${selectedCountryCode.localLength} local digits after the country code.`,
      );
      return;
    }

    const payload = {
      ...data,
      phoneNumber: `${selectedCountryCode.code}${localPhoneNumber}`,
      email: email || `email-${Date.now()}@wildlife-warning.app`,
      role: data.occupation,
    };
    const { password_confirm, ...submitablePay } = payload;
    mutate(submitablePay);
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
          <Text style={styles.title}>Login</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text style={styles.subtitle}>
              Join us and start your journey today
            </Text>

            {/* Full Name */}
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedInput === "full_name" &&
                        styles.inputContainerFocused,
                    ]}
                  >
                    <User
                      size={20}
                      color={
                        focusedInput === "full_name" ? "#22C55E" : "#9CA3AF"
                      }
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
                  {errors.fullName && (
                    <Text style={styles.errorText}>
                      {errors.fullName.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Phone Number */}
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.phoneRow}>
                    <TouchableOpacity
                      style={styles.countryCodeButton}
                      activeOpacity={0.8}
                      onPress={() => setCountryCodeOpen(true)}
                    >
                      <Text style={styles.countryCodeText}>
                        +{selectedCountryCode.code}
                      </Text>
                      <ChevronDown size={18} color="#6B7280" />
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.inputContainer,
                        styles.phoneInputContainer,
                        focusedInput === "phone_number" &&
                          styles.inputContainerFocused,
                      ]}
                    >
                      <Phone
                        size={20}
                        color={
                          focusedInput === "phone_number"
                            ? "#22C55E"
                            : "#9CA3AF"
                        }
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        keyboardType="phone-pad"
                        value={value}
                        onChangeText={(text) => {
                          onChange(sanitizePhoneNumber(text).slice(0, 10));
                        }}
                        onFocus={() => setFocusedInput("phone_number")}
                        onBlur={() => setFocusedInput(null)}
                        placeholder={selectedCountryCode.example}
                        placeholderTextColor="#9CA3AF"
                        maxLength={10}
                      />
                    </View>
                  </View>
                  <Text style={styles.helperText}>
                    {formatPhonePreview(selectedCountryCode.code, value)
                      ? `We will save it as ${formatPhonePreview(
                          selectedCountryCode.code,
                          value,
                        )}`
                      : `Choose your EAC country code, then enter ${selectedCountryCode.localLength} local digits.`}
                  </Text>
                  {errors.phoneNumber && (
                    <Text style={styles.errorText}>
                      {errors.phoneNumber.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Occupation */}
            <Controller
              control={control}
              name="occupation"
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.inputGroup,
                    occupationOpen && styles.dropdownInputGroup,
                  ]}
                >
                  <Text style={styles.label}>Occupation</Text>
                  <View style={styles.dropdownRow}>
                    <Briefcase
                      size={20}
                      color={occupationOpen ? "#22C55E" : "#9CA3AF"}
                      style={styles.dropdownIcon}
                    />
                    <DropDownPicker
                      open={occupationOpen}
                      value={value || null}
                      items={OCCUPATIONS}
                      setOpen={setOccupationOpen}
                      setValue={(callback) => {
                        const nextValue =
                          typeof callback === "function"
                            ? callback(value)
                            : callback;
                        onChange(nextValue);
                      }}
                      placeholder="Select your occupation"
                      listMode="SCROLLVIEW"
                      style={[
                        styles.dropdown,
                        occupationOpen && styles.dropdownFocused,
                      ]}
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
                  </View>
                  {errors.occupation && (
                    <Text style={styles.errorText}>
                      {errors.occupation.message}
                    </Text>
                  )}
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
                      focusedInput === "organization" &&
                        styles.inputContainerFocused,
                    ]}
                  >
                    <Building2
                      size={20}
                      color={
                        focusedInput === "organization" ? "#22C55E" : "#9CA3AF"
                      }
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
                  {errors.organization && (
                    <Text style={styles.errorText}>
                      {errors.organization.message}
                    </Text>
                  )}
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
                      onChangeText={(text) => onChange(text.trim())}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
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
                  {errors.password && (
                    <Text style={styles.errorText}>
                      {errors.password.message}
                    </Text>
                  )}
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
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                    <Text style={styles.errorText}>
                      {errors.password_confirm.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                isPending && styles.signUpButtonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              <Text style={styles.signUpButtonText}>
                {isPending ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={countryCodeOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCountryCodeOpen(false)}
        >
          <View style={styles.countryModalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setCountryCodeOpen(false)}
            />
            <View style={styles.countryModalSheet}>
              <Text style={styles.countryModalTitle}>Country code</Text>
              {EAC_COUNTRY_CODES.map((item) => {
                const active = item.code === selectedCountryCode.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.countryOption,
                      active && styles.countryOptionActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedCountryCode(item);
                      setCountryCodeOpen(false);
                    }}
                  >
                    <View>
                      <Text
                        style={[
                          styles.countryName,
                          active && styles.countryNameActive,
                        ]}
                      >
                        {item.country}
                      </Text>
                      <Text style={styles.countryExample}>
                        Example: +{item.code}
                        {item.example}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.countryDialCode,
                        active && styles.countryDialCodeActive,
                      ]}
                    >
                      +{item.code}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
  dropdownInputGroup: {
    zIndex: 1000,
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
  phoneRow: {
    flexDirection: "row",
    gap: 10,
  },
  countryCodeButton: {
    height: 56,
    minWidth: 104,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countryCodeText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "700",
  },
  phoneInputContainer: {
    flex: 1,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: "#6B7280",
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
  dropdownRow: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownIcon: {
    position: "absolute",
    left: 16,
    top: 18,
    zIndex: 1001,
  },
  dropdown: {
    minHeight: 56,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    paddingLeft: 48,
    paddingRight: 14,
  },
  dropdownFocused: {
    borderColor: "#22C55E",
    backgroundColor: "#FFFFFF",
  },
  dropdownContainer: {
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1F2937",
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
  countryModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.36)",
    justifyContent: "flex-end",
  },
  countryModalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 28,
  },
  countryModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  countryOption: {
    minHeight: 62,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  countryOptionActive: {
    backgroundColor: "#F0FDF4",
  },
  countryName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  countryNameActive: {
    color: "#15803D",
  },
  countryExample: {
    marginTop: 3,
    fontSize: 12,
    color: "#6B7280",
  },
  countryDialCode: {
    fontSize: 15,
    fontWeight: "800",
    color: "#4B5563",
  },
  countryDialCodeActive: {
    color: "#15803D",
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
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
});
