import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';

export default function Index() {
  const router = useRouter();
  const { user, activeRole, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!user) {
      router.replace('/(auth)/login');
    } else {
      const roleMap: Record<string, string> = {
        proprietaire: '/(app)/proprietaire/',
        locataire: '/(app)/locataire/',
        investisseur: '/(app)/investisseur/',
        service_technique: '/(app)/prestataire/',
      };
      const dest = (activeRole && roleMap[activeRole]) || '/(app)/proprietaire/';
      router.replace(dest as any);
    }
  }, [isInitialized, isLoading, user, activeRole]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.gold} />
    </View>
  );
}
