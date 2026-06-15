import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { BellRing, MapPin, MessageSquareWarning } from "lucide-react-native";
import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const highlights = [
  {
    icon: BellRing,
    title: "Nearby warnings",
    text: "See wildlife reports around your current location.",
  },
  {
    icon: MapPin,
    title: "Location-aware reports",
    text: "Submit warnings with map context and field details.",
  },
  {
    icon: MessageSquareWarning,
    title: "Feedback threads",
    text: "Reply to warnings so teams can coordinate quickly.",
  },
];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#F7FAF2", "#FFFFFF", "#EEF6E9"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.brandBlock}>
            <View style={styles.logoShell}>
              <Image
                source={require("@/assets/images/app-icon.png")}
                style={styles.logo}
              />
            </View>
            <Text style={styles.appName}>Wild Guard</Text>
            <Text style={styles.tagline}>
              Community wildlife warnings for people working near parks,
              farms, and protected areas.
            </Text>
          </View>

          <View style={styles.panel}>
            {highlights.map(({ icon: Icon, title, text }) => (
              <View key={title} style={styles.highlightRow}>
                <View style={styles.highlightIcon}>
                  <Icon size={20} color="#2D5A27" />
                </View>
                <View style={styles.highlightCopy}>
                  <Text style={styles.highlightTitle}>{title}</Text>
                  <Text style={styles.highlightText}>{text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Link href="/signup" asChild>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Create account</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF2",
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  brandBlock: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoShell: {
    width: 116,
    height: 116,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    shadowColor: "#0A3909",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  logo: {
    width: 92,
    height: 92,
    resizeMode: "contain",
  },
  appName: {
    fontSize: 38,
    fontWeight: "900",
    color: "#0A3909",
    textAlign: "center",
    marginBottom: 10,
  },
  tagline: {
    maxWidth: 330,
    fontSize: 16,
    lineHeight: 23,
    color: "#42493E",
    textAlign: "center",
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DDE8D6",
    marginBottom: 24,
  },
  highlightRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF6E9",
    alignItems: "center",
    justifyContent: "center",
  },
  highlightCopy: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 3,
  },
  highlightText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#5F6B5B",
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#2D5A27",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#9DD090",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: "#2D5A27",
    fontSize: 17,
    fontWeight: "800",
  },
});
