import { useLocationDistance } from "@/hooks/use-location-distance";
import { formatDistanceToNow } from "date-fns";
import { MapPin, MessageSquare, Tractor } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  alert: {
    id: number | string;
    severity: string;
    title: string;
    species: string;
    description: string;
    location?: { lat?: number; lng?: number };
    timestamp: string;
    behavior?: string;
    submittedBy?: string;
    replyNumber?: number;
  };
  location?: {
    lat?: number;
    lng?: number;
  };
  onPress?: () => void;
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

const AlertCard = ({ alert, location, onPress }: Props) => {
  // console.log("card-alert", alert);
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

  const replies = alert.replyNumber || 0;

  return (
    <TouchableOpacity
      key={alert.id}
      style={[styles.alertCard, getSeverityStyle(alert.severity)]}
      onPress={onPress}
      activeOpacity={0.85}
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
            {alert.submittedBy ? `by ${alert.submittedBy}` : "Unknown"} •{" "}
            {formatDistanceToNow(new Date(alert.timestamp), {
              addSuffix: true,
            })}
          </Text>
        </View>
      </View>

      <View>
        <Text style={styles.alertDescription}>
          {`${alert.species} reported ${alert?.behavior || " Moving north"}`
            ?.split("")[0]
            .toLocaleUpperCase() +
            `${alert.species} reported ${alert?.behavior || " Moving north"}`
              ?.toLocaleLowerCase()
              .substring(1)}
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

        <View style={styles.alertMeta}>
          <MessageSquare size={16} color="#6B7280" />
          <Text style={styles.alertTime}>{replies} replies</Text>
        </View>
      </View>
    </TouchableOpacity>
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
