import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
 const TAB_HEIGHT = insets.bottom + 65

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5', // Indigo 600
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
        tabBarStyle: {
          borderTopWidth: isDark ? 0.5 : 0,
          borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : 'transparent',
          elevation: 20,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.5 : 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -10 },
          height: TAB_HEIGHT,
          paddingTop: 8,
          paddingBottom: insets.bottom,

          // Slightly lighter than slate-950 so the bar is visible in dark mode
          backgroundColor: isDark ? '#1E293B' : '#ffffff',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 10,
          marginTop: 4,

        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
