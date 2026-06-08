import AlertCard from "@/components/AlertCard";
import LocationCard from "@/components/LocationCard";
import { useLocation } from "@/hooks/use-location";
import { wildlifeApi } from "@/services/api";
import { setSelectedAlert } from "@/services/selectedAlert";
import { WildlifeAlert } from "@/types/wildlife";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { TriangleAlert as AlertTriangle, Bell } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type tab = "nearMe" | "submittedByMe";

type AnimatedAlertCardProps = {
  alert: WildlifeAlert;
  isNew: boolean;
  location?: {
    lat?: number;
    lng?: number;
  };
  onPress: () => void;
};

const AnimatedAlertCard = ({
  alert,
  isNew,
  location,
  onPress,
}: AnimatedAlertCardProps) => {
  const entrance = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isNew) {
      entrance.setValue(1);
      shimmer.setValue(0);
      return;
    }

    entrance.setValue(0);
    shimmer.setValue(0);

    Animated.parallel([
      Animated.timing(entrance, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(180),
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [entrance, isNew, shimmer]);

  const translateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 0],
  });
  const scale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1],
  });
  const glowOpacity = shimmer.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 0.28, 0],
  });

  return (
    <Animated.View
      style={[
        styles.animatedAlert,
        {
          opacity: entrance,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {isNew && (
        <Animated.View
          pointerEvents="none"
          style={[styles.newAlertGlow, { opacity: glowOpacity }]}
        />
      )}
      <AlertCard alert={alert} location={location} onPress={onPress} />
    </Animated.View>
  );
};

export default function AlertsScreen() {
  const { location, normalized_location } = useLocation();
  const [alerts, setAlerts] = useState<WildlifeAlert[]>([]);
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<tab>("nearMe");
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedAlerts = useRef(false);
  const alertIdsRef = useRef<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, []),
  );

  const loadAlerts = async () => {
    try {
      const data = await wildlifeApi.getAlerts();
      const nextIds = new Set(data.map((alert) => String(alert.id)));
      const incomingIds = hasLoadedAlerts.current
        ? data
            .filter((alert) => !alertIdsRef.current.has(String(alert.id)))
            .map((alert) => String(alert.id))
        : [];

      setNewAlertIds(new Set(incomingIds));
      alertIdsRef.current = nextIds;
      hasLoadedAlerts.current = true;
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topHeader}>
          <View style={styles.logoContainer}>
            <View>
              <Image
                source={require("@/assets/images/new-logo.png")}
                style={{ width: 36, height: 36 }}
              />
            </View>
            <View>
              <Text style={styles.title}>Wild Guard</Text>
            </View>
          </View>
          <View>
            <Bell />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LocationCard
          location={location}
          normalized_location={normalized_location}
        />
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "nearMe" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("nearMe")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "nearMe" && styles.activeTabText,
              ]}
            >
              Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "submittedByMe" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("submittedByMe")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "submittedByMe" && styles.activeTabText,
              ]}
            >
              My reports
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "nearMe" ? (
          alerts.map((alert) => (
            <AnimatedAlertCard
              alert={alert}
              key={alert.id}
              isNew={newAlertIds.has(String(alert.id))}
              onPress={() => {
                setSelectedAlert(alert);
                router.push({
                  pathname: "/alert-details",
                  params: { id: alert.id },
                });
              }}
              location={{
                lat: location?.coords?.latitude,
                lng: location?.coords?.longitude,
              }}
            />
          ))
        ) : (
          <Text>Submitted by me</Text>
        )}

        {alerts.length === 0 && (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No alerts in your area</Text>
            <Text style={styles.emptyText}>
              {"We'll notify you when there's wildlife activity nearby"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  animatedAlert: {
    position: "relative",
  },
  newAlertGlow: {
    position: "absolute",
    top: -4,
    right: -4,
    bottom: 12,
    left: -4,
    borderRadius: 20,
    backgroundColor: "#22C55E",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#2d5a27",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  activeTabText: {
    color: "#FFF",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "white",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d5a27",
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
