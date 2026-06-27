import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProprietaireStore } from '@/store/proprietaireStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtFCFA, fmtMonth, fmtDate } from '@/utils/format';
import type { RentPayment } from '@/types/database';

const FILTER_STATUS = [
  { value: 'all', label: 'Tous' },
  { value: 'confirmed', label: 'Payés' },
  { value: 'pending', label: 'En attente' },
  { value: 'late', label: 'En retard' },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const { rentPayments, tenants } = useProprietaireStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = rentPayments.filter((rp) => {
    const tenant = tenants.find((t) => t.id === rp.tenant_id);
    const matchStatus = statusFilter === 'all' || rp.status === statusFilter;
    const matchSearch =
      !search ||
      (tenant?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      fmtMonth(rp.period_month).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalAmount = filtered.reduce((s, rp) => s + (rp.amount || 0), 0);

  const renderItem = ({ item }: { item: RentPayment }) => {
    const tenant = tenants.find((t) => t.id === item.tenant_id);
    return (
      <Card style={styles.row}>
        <View style={styles.rowLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(tenant?.full_name ?? '?').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>{tenant?.full_name ?? 'Locataire inconnu'}</Text>
            <Text style={styles.rowPeriod}>{fmtMonth(item.period_month)}</Text>
            {item.payment_date && (
              <Text style={styles.rowDate}>Payé le {fmtDate(item.payment_date, 'dd/MM/yyyy')}</Text>
            )}
          </View>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowAmount}>{fmtFCFA(item.amount)}</Text>
          <StatusBadge status={item.status} />
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
        <Text style={styles.headerTitle}>Loyers & paiements</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/proprietaire/payments/new' as any)}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={22} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total affiché</Text>
        <Text style={styles.summaryAmount}>{fmtFCFA(totalAmount)}</Text>
        <Text style={styles.summaryCount}>{filtered.length} paiement{filtered.length > 1 ? 's' : ''}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.mutedForeground} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor={Colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTER_STATUS.map((f) => (
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
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="💳" title="Aucun paiement trouvé" />
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
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${Colors.gold}20`, alignItems: 'center', justifyContent: 'center' },
  summary: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
  },
  summaryLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground, flex: 1 },
  summaryAmount: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.gold },
  summaryCount: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radii.md,
    marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md,
  },
  searchInput: { flex: 1, color: Colors.foreground, fontSize: FontSizes.base, paddingVertical: 10 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}15` },
  filterText: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  filterTextActive: { color: Colors.gold, fontWeight: FontWeights.semibold },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['3xl'], paddingTop: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  rowLeft: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', flex: 1 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${Colors.gold}20`, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gold },
  rowInfo: { flex: 1 },
  rowName: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  rowPeriod: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  rowDate: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  rowAmount: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gold },
});
