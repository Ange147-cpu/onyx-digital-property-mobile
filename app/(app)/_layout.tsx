import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Colors, FontSizes } from '@/constants/theme';

function TabIcon({ name, color, size }: { name: any; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function AppLayout() {
  const router = useRouter();
  const { user, isInitialized, activeRole } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/(auth)/login');
    }
  }, [isInitialized, user]);

  const tabBarStyle = {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 64,
  };

  const screenOptions = {
    tabBarActiveTintColor: Colors.gold,
    tabBarInactiveTintColor: Colors.mutedForeground,
    tabBarStyle,
    tabBarLabelStyle: { fontSize: FontSizes.xs, fontWeight: '500' as const },
    headerShown: false,
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="proprietaire"
        options={{
          title: 'Propriétaire',
          href: activeRole === 'proprietaire' ? undefined : null,
          tabBarIcon: ({ color, size }) => <TabIcon name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="locataire"
        options={{
          title: 'Locataire',
          href: activeRole === 'locataire' ? undefined : null,
          tabBarIcon: ({ color, size }) => <TabIcon name="key-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="investisseur"
        options={{
          title: 'Investisseur',
          href: activeRole === 'investisseur' ? undefined : null,
          tabBarIcon: ({ color, size }) => <TabIcon name="trending-up-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="prestataire"
        options={{
          title: 'Prestataire',
          href: activeRole === 'service_technique' ? undefined : null,
          tabBarIcon: ({ color, size }) => <TabIcon name="construct-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
