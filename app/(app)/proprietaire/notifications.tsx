import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtDate } from '@/utils/format';
import type { Notification } from '@/types/database';

const KIND_ICONS: Record<string, { icon: string; color: string }> = {
  payment: { icon: 'cash-outline', color: Colors.success },
  maintenance: { icon: 'hammer-outline', color: Colors.warning },
  document: { icon: 'document-outline', color: Colors.info },
  reminder: { icon: 'alarm-outline', color: Colors.gold },
  system: { icon: 'information-circle-outline', color: Colors.mutedForeground },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setNotifications((data ?? []) as Notification[]);
        setLoading(false);
      });
  }, [user?.id]);

  const markAllRead = async () => {
    if (!user?.id) return;
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() } as any)
      .eq('user_id', user.id)
      .is('read_at', null);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const renderItem = ({ item }: { item: Notification }) => {
    const config = KIND_ICONS[item.kind] ?? KIND_ICONS.system;
    const isUnread = !item.read_at;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={async () => {
          if (isUnread) {
            await supabase.from('notifications').update({ read_at: new Date().toISOString() } as any).eq('id', item.id);
            setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n));
          }
        }}
      >
        <Card style={[styles.notif, isUnread && styles.notifUnread]}>
          <View style={[styles.iconWrap, { backgroundColor: `${config.color}20` }]}>
            <Ionicons name={config.icon as any} size={20} color={config.color} />
          </View>
          <View style={styles.notifInfo}>
            <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}>{item.title}</Text>
            {item.body && <Text style={styles.notifBody}>{item.body}</Text>}
            <Text style={styles.notifDate}>{fmtDate(item.created_at, "dd/MM/yyyy 'à' HH:mm")}</Text>
          </View>
          {isUnread && <View style={styles.unreadDot} />}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="🔔" title="Aucune notification" description="Vous êtes à jour !" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.foreground, textAlign: 'center' },
  markAllText: { fontSize: FontSizes.xs, color: Colors.gold },
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing['3xl'] },
  notif: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm, alignItems: 'flex-start' },
  notifUnread: { borderColor: `${Colors.gold}40`, backgroundColor: `${Colors.gold}05` },
  iconWrap: { width: 40, height: 40, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.foreground },
  notifTitleUnread: { fontWeight: FontWeights.bold },
  notifBody: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2, lineHeight: 17 },
  notifDate: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold, marginTop: 6 },
});
