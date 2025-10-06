import { Tabs } from 'expo-router';
import { TriangleAlert as AlertTriangle, Camera, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' 
            ? insets.bottom    
            : insets.bottom > 0 
              ? insets.bottom 
              : 76,
          minHeight: 70,
          elevation: 5, // Android shadow
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ size, color }) => <AlertTriangle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="collect"
        options={{
          title: 'Collect Data',
          tabBarIcon: ({ size, color }) => <Camera size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
