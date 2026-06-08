import { useLocationName } from "@/hooks/use-location";
import { getSelectedAlert } from "@/services/selectedAlert";
import { AlertEvidence } from "@/types/wildlife";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import {
  ArrowLeft,
  CalendarClock,
  FileVideo,
  MapPin,
  ShieldAlert,
  User,
} from "lucide-react-native";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatBytes = (value?: string | number) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const formatCoordinate = (value?: number) => {
  if (!Number.isFinite(value)) return "Not available";
  return Number(value).toFixed(6);
};

const getMediaUri = (media: AlertEvidence) => media.url || media.uri;

const isImage = (media: AlertEvidence) =>
  media.type === "image" || media.mimeType?.startsWith("image");

const openMedia = async (media: AlertEvidence) => {
  const uri = getMediaUri(media);
  if (!uri) return;
  await Linking.openURL(uri);
};

export default function AlertDetailsScreen() {
  const alert = getSelectedAlert();
  const { locationName } = useLocationName({
    lat: alert?.location?.lat,
    lng: alert?.location?.lng,
    withCountry: true,
  });

  if (!alert) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Alert details unavailable</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const evidence = alert.evidence || [];
  const rawSubmission = alert.rawSubmission || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, styles[`severity_${alert.severity}`]]}>
          <View style={styles.severityRow}>
            <ShieldAlert size={18} color="#111827" />
            <Text style={styles.severityText}>{alert.severity}</Text>
          </View>
          <Text style={styles.title}>{alert.title}</Text>
          <Text style={styles.description}>{alert.description}</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Species</Text>
            <Text style={styles.summaryValue}>{alert.species}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Number</Text>
            <Text style={styles.summaryValue}>{alert.count || "1"}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Behaviour</Text>
            <Text style={styles.summaryValue}>
              {alert.behavior || "Not provided"}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Threat</Text>
            <Text style={styles.summaryValue}>{alert.severity}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.metaRow}>
            <MapPin size={18} color="#4B5563" />
            <View>
              <Text style={styles.metaText}>{locationName}</Text>
              <Text style={styles.metaText}>
                {formatCoordinate(alert.location?.lat)},{" "}
                {formatCoordinate(alert.location?.lng)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report info</Text>
          <View style={styles.metaRow}>
            <User size={18} color="#4B5563" />
            <Text style={styles.metaText}>
              {alert.submittedBy || "Unknown"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <CalendarClock size={18} color="#4B5563" />
            <Text style={styles.metaText}>
              {new Date(alert.timestamp).toLocaleString()} (
              {formatDistanceToNow(new Date(alert.timestamp), {
                addSuffix: true,
              })}
              )
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence</Text>
          {evidence.length > 0 ? (
            <View style={styles.evidence}>
              {evidence.map((media, index) => {
                const uri = getMediaUri(media);
                return (
                  <TouchableOpacity
                    key={`${uri || media.name}-${index}`}
                    style={styles.mediaItem}
                    onPress={() => openMedia(media)}
                    disabled={true}
                  >
                    {uri && isImage(media) ? (
                      <Image source={{ uri }} style={styles.mediaImage} />
                    ) : (
                      <View style={styles.mediaFallback}>
                        <FileVideo size={28} color="#2D5A27" />
                        <Text style={styles.mediaType}>
                          {media.type || media.mimeType || "media"}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.mediaName} numberOfLines={1}>
                      {media.name || `Evidence ${index + 1}`}
                    </Text>
                    {!!formatBytes(media.size) && (
                      <Text style={styles.mediaSize}>
                        {formatBytes(media.size)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>No evidence media attached.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission reference</Text>
          {/* <Text style={styles.referenceText}>ID: {alert.id}</Text> */}
          {!!rawSubmission._uuid && (
            <Text style={styles.referenceText}>
              UUID: {rawSubmission._uuid}
            </Text>
          )}
          {/* {!!rawSubmission._status && (
            <Text style={styles.referenceText}>
              Status: {rawSubmission._status}
            </Text>
          )} */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  hero: {
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    marginBottom: 16,
  },
  severity_critical: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  severity_high: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  severity_medium: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },
  severity_low: {
    borderColor: "#22C55E",
    backgroundColor: "#F0FDF4",
  },
  severityRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  severityText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 23,
    color: "#374151",
  },
  evidence: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  summaryItem: {
    width: "48%",
    minHeight: 86,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    padding: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    textTransform: "capitalize",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  metaText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
  },
  mediaItem: {
    width: 128,
    marginRight: 12,
  },
  mediaImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  mediaFallback: {
    width: 128,
    height: 128,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  mediaType: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  mediaName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  mediaSize: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  referenceText: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  primaryButton: {
    backgroundColor: "#2D5A27",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "800",
  },
});
