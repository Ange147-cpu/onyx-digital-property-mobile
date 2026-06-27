import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { OnyxLogo } from '@/components/ui/OnyxLogo';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtDate, PRIORITY_CONFIG, MAINTENANCE_STATUS_CONFIG, truncate } from '@/utils/format';
import type { MaintenanceTicket } from '@/types/database';

const STATUS_ORDER = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];

export default function PrestataireDashboard() {
  const router = useRouter();
  const { user, organizationId, signOut } = useAuthStore();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    if (!organizationId) return;
    setLoading(true);
    const { data } = await supabase
      .from('maintenance_tickets')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(50);
    setTickets((data ?? []) as MaintenanceTicket[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [organizationId]);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('maintenance_tickets')
      .update({ status: newStatus, ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) } as any)
      .eq('id', id);

    if (error) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de mettre à jour.' });
    } else {
      Toast.show({ type: 'success', text1: 'Statut mis à jour' });
      await load();
    }
  };

  const filtered = statusFilter === 'all' ? tickets : tickets.filter((t) => t.status === statusFilter);

  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'assigned').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;

  const handleSignOut = () => {
    Alert.alert('Déconnexion', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => { signOut(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <OnyxLogo size="sm" />
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Ionicons name="construct-outline" size={13} color={Colors.gold} />
            <Text style={styles.badgeText}>Prestataire</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>{(user?.email ?? '??').slice(0, 2).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={Colors.gold} />}
      >
        {/* Summary KPIs */}
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{openCount}</Text>
            <Text style={styles.kpiLabel}>À traiter</Text>
          </Card>
          <Card style={[styles.kpiCard, { borderColor: `${Colors.warning}40` }]}>
            <Text style={[styles.kpiValue, { color: Colors.warning }]}>{inProgressCount}</Text>
            <Text style={styles.kpiLabel}>En cours</Text>
          </Card>
          <Card style={[styles.kpiCard, { borderColor: `${Colors.success}40` }]}>
            <Text style={[styles.kpiValue, { color: Colors.success }]}>
              {tickets.filter((t) => t.status === 'resolved').length}
            </Text>
            <Text style={styles.kpiLabel}>Résolues</Text>
          </Card>
        </View>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {[
            { value: 'all', label: 'Toutes' },
            { value: 'open', label: '🔴 Ouvertes' },
            { value: 'assigned', label: '🔵 Assignées' },
            { value: 'in_progress', label: '🟡 En cours' },
            { value: 'resolved', label: '🟢 Résolues' },
          ].map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, statusFilter === f.value && styles.filterChipActive]}
              onPress={() => setStatusFilter(f.value)}
            >
              <Text style={[styles.filterText, statusFilter === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tickets */}
        <View style={styles.section}>
          {filtered.length === 0 ? (
            <EmptyState icon="🔧" title="Aucune mission" description="Vos interventions apparaîtront ici." />
          ) : (
            filtered.map((ticket) => {
              const priority = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
              const status = MAINTENANCE_STATUS_CONFIG[ticket.status] ?? MAINTENANCE_STATUS_CONFIG.open;
              const currentIdx = STATUS_ORDER.indexOf(ticket.status);
              const nextStatus = STATUS_ORDER[currentIdx + 1];

              return (
                <Card key={ticket.id} style={styles.ticketCard}>
                  <View style={styles.ticketTop}>
                    <View style={styles.ticketPriorityBar} />
                    <View style={styles.ticketMain}>
                      <View style={styles.ticketHeader}>
                        <Text style={styles.ticketTitle}>{truncate(ticket.title, 40)}</Text>
                        <Badge label={status.label} color={status.color} bg={`${status.color}20`} />
                      </View>
                      {ticket.description && (
                        <Text style={styles.ticketDesc}>{truncate(ticket.description, 80)}</Text>
                      )}
                      <View style={styles.ticketMeta}>
                        <Badge label={priority.label} color={priority.color} bg={`${priority.color}20`} />
                        <Text style={styles.ticketDate}>{fmtDate(ticket.created_at, 'dd/MM/yyyy à HH:mm')}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action button */}
                  {nextStatus && nextStatus !== 'closed' && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() =>
                        Alert.alert(
                          'Mettre à jour le statut',
                          `Passer en "${MAINTENANCE_STATUS_CONFIG[nextStatus]?.label}" ?`,
                          [
                            { text: 'Annuler', style: 'cancel' },
                            { text: 'Confirmer', onPress: () => updateStatus(ticket.id, nextStatus) },
                          ]
                        )
                      }
                    >
                      <Ionicons name="arrow-forward-circle-outline" size={16} color={Colors.gold} />
                      <Text style={styles.actionBtnText}>
                        → {MAINTENANCE_STATUS_CONFIG[nextStatus]?.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerRight: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.full,
    backgroundColor: `${Colors.gold}15`, borderWidth: 1, borderColor: `${Colors.gold}30`,
  },
  badgeText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: FontWeights.semibold },
  avatarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.goldForeground, fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  scroll: { paddingBottom: Spacing['3xl'] },
  kpiRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.lg },
  kpiCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg },
  kpiValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.gold },
  kpiLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 4 },
  filterScroll: { marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.lg, gap: 8 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}15` },
  filterText: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  filterTextActive: { color: Colors.gold, fontWeight: FontWeights.semibold },
  section: { paddingHorizontal: Spacing.lg },
  ticketCard: { marginBottom: Spacing.md, padding: 0, overflow: 'hidden' },
  ticketTop: { flexDirection: 'row', padding: Spacing.md },
  ticketPriorityBar: { width: 4, borderRadius: 2, backgroundColor: Colors.gold, marginRight: Spacing.md },
  ticketMain: { flex: 1, gap: 6 },
  ticketHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  ticketTitle: { flex: 1, fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  ticketDesc: { fontSize: FontSizes.xs, color: Colors.mutedForeground, lineHeight: 18 },
  ticketMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketDate: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: `${Colors.gold}08`,
  },
  actionBtnText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: FontWeights.semibold },
});
