import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { User, Bell, MapPin, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState({
    alerts: true,
    observations: false,
    newsletter: true,
  });

  const [location, setLocation] = useState({
    enabled: true,
    accuracy: 'high',
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true,
    rightElement 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightElement?: React.ReactNode;
  }) => (
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
      {rightElement || (showChevron && <ChevronRight size={20} color="#9CA3AF" />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon={User}
            title="Profile"
            subtitle="Manage your personal information"
            onPress={() => console.log('Profile pressed')}
          />
          
          <SettingItem
            icon={Shield}
            title="Privacy & Security"
            subtitle="Control your privacy settings"
            onPress={() => console.log('Privacy pressed')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon={Bell}
            title="Wildlife Alerts"
            subtitle="Get notified about wildlife activity"
            showChevron={false}
            rightElement={
              <Switch
                value={notifications.alerts}
                onValueChange={(value) => 
                  setNotifications(prev => ({ ...prev, alerts: value }))
                }
                trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                thumbColor="white"
              />
            }
          />
          
          <SettingItem
            icon={Bell}
            title="Observation Updates"
            subtitle="Updates on your submitted observations"
            showChevron={false}
            rightElement={
              <Switch
                value={notifications.observations}
                onValueChange={(value) => 
                  setNotifications(prev => ({ ...prev, observations: value }))
                }
                trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                thumbColor="white"
              />
            }
          />
          
          <SettingItem
            icon={Bell}
            title="Newsletter"
            subtitle="Wildlife conservation news and tips"
            showChevron={false}
            rightElement={
              <Switch
                value={notifications.newsletter}
                onValueChange={(value) => 
                  setNotifications(prev => ({ ...prev, newsletter: value }))
                }
                trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                thumbColor="white"
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <SettingItem
            icon={MapPin}
            title="Location Services"
            subtitle="Enable location for better wildlife tracking"
            showChevron={false}
            rightElement={
              <Switch
                value={location.enabled}
                onValueChange={(value) => 
                  setLocation(prev => ({ ...prev, enabled: value }))
                }
                trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                thumbColor="white"
              />
            }
          />
          
          <SettingItem
            icon={MapPin}
            title="Location Accuracy"
            subtitle={`Currently: ${location.accuracy}`}
            onPress={() => console.log('Location accuracy pressed')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon={HelpCircle}
            title="Help & FAQ"
            subtitle="Get answers to common questions"
            onPress={() => console.log('Help pressed')}
          />
          
          <SettingItem
            icon={HelpCircle}
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => console.log('Support pressed')}
          />
        </View>

        <View style={styles.section}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    margin: 20,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});