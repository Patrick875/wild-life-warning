import { AuthContext } from "@/context/AuthContext";
import { useLogin } from "@/services/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

const loginSchema = yup.object().shape({
  identifier: yup
    .string()
    .trim()
    .required("Email or phone is required")
    .test("is-valid", "Enter a valid email or phone", (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{9,15}$/;
      return emailRegex.test(value || "") || phoneRegex.test(value || "");
    }),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

export default function LoginScreen() {
  const { mutate, isPending } = useLogin();
  const {login}=useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (data: { identifier: string; password: string }) => {
    mutate({
      identifier: data.identifier.trim(),
      password: data.password.trim(),
    },{
      onSuccess:(res)=>{
        login(res.data?.access_token as string)
      }
    });
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
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your journey
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Identifier Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Phone Number</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === "identifier" && styles.inputContainerFocused,
                ]}
              >
                <Mail
                  size={20}
                  color={focusedInput === "identifier" ? "#22C55E" : "#9CA3AF"}
                  style={styles.inputIcon}
                />
                <Controller
                  control={control}
                  name="identifier"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocusedInput("identifier")}
                      onBlur={() => {
                        setFocusedInput(null);
                        onBlur();
                      }}
                      placeholder="Enter your email or phone"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  )}
                />
              </View>
              {errors.identifier && (
                <Text style={styles.errorText}>{errors.identifier.message}</Text>
              )}
            </View>

            {/* Password Input */}
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
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => {
                        setFocusedInput(null);
                        onBlur();
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                    />
                  )}
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
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.8}
              disabled={isPending}
            >
              <Text style={styles.loginButtonText}>
                {isPending ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  form: {
    paddingHorizontal: 24,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#22C55E",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#6B7280",
    fontSize: 15,
  },
  signUpLink: {
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