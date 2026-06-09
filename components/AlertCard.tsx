import { useLocationDistance } from "@/hooks/use-location-distance";
import { WildlifeAlert } from "@/types/wildlife";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  MessageSquare,
  ShieldAlert,
  Tractor,
} from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  alert: WildlifeAlert;
  location?: {
    lat?: number;
    lng?: number;
  };
  onDetailsPress?: () => void;
  onFeedbackPress?: () => void;
}

const getSeverityStyle = (severity?: string) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return {
        borderWidth: 1,
        borderColor: "#DC2626", // red-600
      };

    case "high":
      return {
        borderWidth: 1,
        borderColor: "#EF4444", // red-500
      };

    case "medium":
      return {
        borderWidth: 1,
        borderColor: "#f89327", // orange-500
      };

    case "low":
      return {
        borderWidth: 1,
        borderColor: "#22C55E", // green-500
      };

    default:
      return {
        borderWidth: 1,
        borderColor: "#9CA3AF", // gray-400
      };
  }
};

const AlertCard = ({
  alert,
  location,
  onDetailsPress,
  onFeedbackPress,
}: Props) => {
  const { distance, unit } = useLocationDistance({
    locationFrom: {
      latitude: alert.location?.lat,
      longitude: alert.location?.lng,
    },
    locationTo: {
      latitude: location?.lat,
      longitude: location?.lng,
    },
    unit: "km",
  });

  const replies = alert.replyNumber || alert.feedbacks?.length || 0;
  const reportedBy = alert.submittedBy || alert.rawSubmission?.user?.full_name;
  const behaviorText = alert.behavior ? ` ${alert.behavior}` : "";
  const headline = `${alert.species} reported${behaviorText}`;

  return (
    <View
      key={alert.id}
      style={[styles.alertCard, getSeverityStyle(alert.severity)]}
    >
      <View style={styles.alertHeader}>
        <View style={styles.cardIconContainer}>
          <Tractor color="#9DD090" size={24} />
        </View>

        <View style={styles.alertInfo}>
          <Text style={styles.alertTitle} numberOfLines={2}>
            {alert.title}
          </Text>

          <Text style={styles.alertMetaText} numberOfLines={1}>
            {reportedBy ? `by ${reportedBy}` : "Unknown"} •{" "}
            {formatDistanceToNow(new Date(alert.created_at), {
              addSuffix: true,
            })}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open warning details"
          hitSlop={10}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          onPress={onDetailsPress}
        >
          <ShieldAlert size={20} color="#B45309" />
        </Pressable>
      </View>

      <View>
        <Text style={styles.alertDescription}>
          {headline.charAt(0).toLocaleUpperCase() +
            headline.substring(1).toLocaleLowerCase()}
        </Text>

        <Text style={styles.alertDescription}>{alert.description}</Text>
      </View>

      <View style={styles.alertFooter}>
        <View style={styles.alertMeta}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.alertLocation}>
            {Number(distance).toFixed(1)} {unit} away
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open warning feedbacks"
          hitSlop={8}
          style={({ pressed }) => [
            styles.feedbackButton,
            pressed && styles.feedbackButtonPressed,
          ]}
          onPress={onFeedbackPress}
        >
          <MessageSquare size={16} color="#6B7280" />
          <Text style={styles.alertTime}>
            Reply {replies > 0 ? `(${replies})` : ""}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },

  cardIconContainer: {
    padding: 8,
    backgroundColor: "#2D5A27",
    borderRadius: 8,
  },

  alertInfo: {
    flex: 1,
    minWidth: 0,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  iconButtonPressed: {
    opacity: 0.72,
  },

  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 23,
    marginBottom: 4,
  },

  alertMetaText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  alertDescription: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 12,
    // textTransform: "capitalize",
  },

  alertFooter: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginTop: 4,
  },

  alertMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  feedbackButton: {
    minHeight: 34,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: -6,
  },

  feedbackButtonPressed: {
    backgroundColor: "#F3F4F6",
  },

  alertLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },

  alertTime: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
});

export default AlertCard;
