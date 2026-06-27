import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProprietaireStore } from '@/store/proprietaireStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtDate, PRIORITY_CONFIG, MAINTENANCE_STATUS_CONFIG, truncate } from '@/utils/format';
import type { MaintenanceTicket } from '@/types/database';

const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'open', label: 'Ouverts' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'resolved', label: 'Résolus' },
];

export default function MaintenanceScreen() {
  const router = useRouter();
  const { maintenanceTickets, properties, tenants } = useProprietaireStore();
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = maintenanceTickets.filter(
    (t) => statusFilter === 'all' || t.status === statusFilter
  );

  const renderTicket = ({ item }: { item: MaintenanceTicket }) => {
    const prop = properties.find((p) => p.id === item.property_id);
    const tenant = tenants.find((t) => t.id === item.tenant_id);
    const priority = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.medium;
    const status = MAINTENANCE_STATUS_CONFIG[item.status] ?? MAINTENANCE_STATUS_CONFIG.open;

    return (
      <Card style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketIconWrap}>
            <Ionicons name="hammer-outline" size={20} color={Colors.gold} />
          </View>
          <View style={styles.ticketMeta}>
            <Text style={styles.ticketTitle}>{truncate(item.title, 35)}</Text>
            <Text style={styles.ticketDate}>
              {fmtDate(item.created_at, 'dd/MM/yyyy')}
            </Text>
          </View>
          <View style={styles.ticketBadges}>
            <Badge label={priority.label} color={priority.color} bg={`${priority.color}20`} />
            <Badge label={status.label} color={status.color} bg={`${status.color}20`} />
          </View>
        </View>

        {item.description && (
          <Text style={styles.ticketDesc}>{truncate(item.description, 100)}</Text>
        )}

        <View style={styles.ticketFooter}>
          {prop && (
            <View style={styles.footerItem}>
              <Ionicons name="home-outline" size={13} color={Colors.mutedForeground} />
              <Text style={styles.footerText}>{truncate(prop.label, 20)}</Text>
            </View>
          )}
          {tenant && (
            <View style={styles.footerItem}>
              <Ionicons name="person-outline" size={13} color={Colors.mutedForeground} />
              <Text style={styles.footerText}>{tenant.full_name}</Text>
            </View>
          )}
          {item.scheduled_at && (
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={13} color={Colors.mutedForeground} />
              <Text style={styles.footerText}>Planifié: {fmtDate(item.scheduled_at, 'dd/MM')}</Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintenance</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {maintenanceTickets.filter((t) => t.status === 'open').length}
          </Text>
        </View>
      </View>

      {/* Status filters */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
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
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="🔧" title="Aucun ticket de maintenance" description="Aucune intervention en cours" />
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
  countBadge: {
    minWidth: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: '#fff' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}15` },
  filterText: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  filterTextActive: { color: Colors.gold, fontWeight: FontWeights.semibold },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['3xl'], paddingTop: Spacing.sm },
  ticketCard: { marginBottom: Spacing.md, gap: Spacing.md },
  ticketHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  ticketIconWrap: {
    width: 40, height: 40, borderRadius: Radii.md,
    backgroundColor: `${Colors.gold}15`, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ticketMeta: { flex: 1 },
  ticketTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  ticketDate: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  ticketBadges: { gap: 4, alignItems: 'flex-end' },
  ticketDesc: { fontSize: FontSizes.xs, color: Colors.mutedForeground, lineHeight: 18 },
  ticketFooter: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md,
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
});
