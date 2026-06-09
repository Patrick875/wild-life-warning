import ProfileCard from "@/components/ProfileCard";
import { AuthContext } from "@/context/AuthContext";
import {
  Bell,
  ChevronRight,
  CircleHelp as HelpCircle,
  LogOut,
  MapPin,
  Shield,
  User,
} from "lucide-react-native";
import React, { useContext, useState } from "react";
import {
  Alert,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingItemProps {
  icon: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

export default function SettingsScreen() {
  const { logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState({
    alerts: true,
    observations: false,
    newsletter: true,
  });

  const [location, setLocation] = useState({
    enabled: true,
    accuracy: "high",
  });

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    rightElement,
  }: SettingItemProps) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#22C55E" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement ||
        (showChevron && <ChevronRight size={20} color="#9CA3AF" />)}
    </TouchableOpacity>
  );

  const sections = [
    {
      title: "Account",
      data: [
        {
          id: "profile",
          icon: User,
          title: "Profile",
          subtitle: "Manage your personal information",
          showChevron: false,
        },
        {
          id: "privacy",
          icon: Shield,
          title: "Privacy & Security",
          subtitle: "Control your privacy settings",
          showChevron: false,
        },
      ],
    },
    {
      title: "Notifications",
      data: [
        {
          id: "alerts",
          icon: Bell,
          title: "Wildlife Alerts",
          subtitle: "Get notified about wildlife activity",
          showChevron: false,
          rightElement: (
            <Switch
              value={notifications.alerts}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, alerts: value }))
              }
              trackColor={{ false: "#E5E7EB", true: "#22C55E" }}
              thumbColor="white"
            />
          ),
        },
        {
          id: "observations",
          icon: Bell,
          title: "Observation Updates",
          subtitle: "Updates on your submitted observations",
          showChevron: false,
          rightElement: (
            <Switch
              value={notifications.observations}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, observations: value }))
              }
              trackColor={{ false: "#E5E7EB", true: "#22C55E" }}
              thumbColor="white"
            />
          ),
        },
        {
          id: "newsletter",
          icon: Bell,
          title: "Newsletter",
          subtitle: "Wildlife conservation news and tips",
          showChevron: false,
          rightElement: (
            <Switch
              value={notifications.newsletter}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, newsletter: value }))
              }
              trackColor={{ false: "#E5E7EB", true: "#22C55E" }}
              thumbColor="white"
            />
          ),
        },
      ],
    },
    {
      title: "Location",
      data: [
        {
          id: "location-services",
          icon: MapPin,
          title: "Location Services",
          subtitle: "Enable location for better wildlife tracking",
          showChevron: false,
          rightElement: (
            <Switch
              value={location.enabled}
              onValueChange={(value) =>
                setLocation((prev) => ({ ...prev, enabled: value }))
              }
              trackColor={{ false: "#E5E7EB", true: "#22C55E" }}
              thumbColor="white"
            />
          ),
        },
        {
          id: "location-accuracy",
          icon: MapPin,
          title: "Location Accuracy",
          subtitle: `Currently: ${location.accuracy}`,
          showChevron: false,
        },
      ],
    },
    {
      title: "Support",
      data: [
        {
          id: "help",
          icon: HelpCircle,
          title: "Help & FAQ",
          subtitle: "Get answers to common questions",
          showChevron: false,
        },
        {
          id: "contact",
          icon: HelpCircle,
          title: "Contact Support",
          subtitle: "Get in touch with our team",
          showChevron: false,
        },
      ],
    },
  ];

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({
    item,
    section,
    index,
  }: {
    item: any;
    section: any;
    index: number;
  }) => {
    const isLastItem = index === section.data.length - 1;
    return (
      <View style={isLastItem ? styles.lastSettingItem : undefined}>
        <SettingItem {...item} />
      </View>
    );
  };

  const renderFooter = () => (
    <>
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>WildTracker v1.0.0</Text>
        <Text style={styles.footerSubtext}>
          Helping protect wildlife through community data collection
        </Text>
      </View>
    </>
  );
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <ProfileCard />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={() => <View style={{ height: 16 }} />}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  contentContainer: {
    paddingBottom: 32,
  },
  sectionHeaderContainer: {
    backgroundColor: "white",
    marginTop: 16,
    marginHorizontal: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "white",
    marginHorizontal: 24,
  },
  lastSettingItem: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutSection: {
    marginTop: 16,
    marginHorizontal: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
