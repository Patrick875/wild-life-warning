import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context'
import { TriangleAlert as AlertTriangle, MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { wildlifeApi } from '@/services/api';
import { WildlifeAlert } from '@/types/wildlife';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<WildlifeAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await wildlifeApi.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F97316';
      case 'low': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wildlife Alerts</Text>
        <Text style={styles.subtitle}>Recent activity in your area</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {alerts.map((alert) => (
          <TouchableOpacity key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={[
                styles.severityIndicator,
                { backgroundColor: getSeverityColor(alert.severity) }
              ]} />
              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertSpecies}>{alert.species}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
            
            <Text style={styles.alertDescription}>{alert.description}</Text>
            
            <View style={styles.alertFooter}>
              <View style={styles.alertMeta}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.alertLocation}>{alert.location}</Text>
              </View>
              <View style={styles.alertMeta}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.alertTime}>{formatTimeAgo(alert.timestamp)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {alerts.length === 0 && (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No alerts in your area</Text>
            <Text style={styles.emptyText}>
              We'll notify you when there's wildlife activity nearby
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
    paddingHorizontal: 24,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  alertSpecies: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  alertDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  alertTime: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});