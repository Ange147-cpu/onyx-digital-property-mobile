import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProprietaireStore } from '@/store/proprietaireStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtFCFA, fmtDate, getInitials, truncate } from '@/utils/format';
import type { Tenant } from '@/types/database';

export default function TenantsScreen() {
  const router = useRouter();
  const { tenants, properties } = useProprietaireStore();
  const [search, setSearch] = useState('');

  const filtered = tenants.filter(
    (t) =>
      t.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (t.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.phone ?? '').includes(search)
  );

  const renderTenant = ({ item }: { item: Tenant }) => {
    const prop = properties.find((p) => p.id === item.property_id);
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(app)/proprietaire/tenants/${item.id}` as any)}
        activeOpacity={0.85}
      >
        <Card style={styles.tenantCard}>
          <View style={styles.tenantRow}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(item.full_name)}</Text>
            </View>

            {/* Info */}
            <View style={styles.tenantInfo}>
              <Text style={styles.tenantName}>{item.full_name}</Text>
              {item.email && <Text style={styles.tenantContact}>{item.email}</Text>}
              {item.phone && <Text style={styles.tenantContact}>{item.phone}</Text>}
              {prop && (
                <View style={styles.propChip}>
                  <Ionicons name="home-outline" size={11} color={Colors.gold} />
                  <Text style={styles.propChipText}>{truncate(prop.label, 22)}</Text>
                </View>
              )}
            </View>

            {/* Rent + Score */}
            <View style={styles.tenantRight}>
              {item.monthly_rent && (
                <Text style={styles.tenantRent}>{fmtFCFA(item.monthly_rent)}</Text>
              )}
              {item.score != null && (
                <View style={[styles.scoreBadge, { backgroundColor: item.score >= 80 ? `${Colors.success}20` : item.score >= 50 ? `${Colors.warning}20` : `${Colors.error}20` }]}>
                  <Text style={[styles.scoreText, { color: item.score >= 80 ? Colors.success : item.score >= 50 ? Colors.warning : Colors.error }]}>
                    ★ {item.score}
                  </Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={Colors.mutedForeground} />
            </View>
          </View>

          {/* Move-in */}
          {item.move_in_date && (
            <View style={styles.moveInRow}>
              <Ionicons name="calendar-outline" size={12} color={Colors.mutedForeground} />
              <Text style={styles.moveInText}>Depuis le {fmtDate(item.move_in_date, 'dd/MM/yyyy')}</Text>
            </View>
          )}
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
        <Text style={styles.headerTitle}>Locataires</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/proprietaire/tenants/new' as any)}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={22} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.mutedForeground} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, email ou téléphone..."
          placeholderTextColor={Colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.countText}>
        {filtered.length} locataire{filtered.length > 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTenant}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="👤"
            title={search ? 'Aucun résultat' : 'Aucun locataire enregistré'}
            actionLabel="Ajouter un locataire"
            onAction={() => router.push('/(app)/proprietaire/tenants/new' as any)}
          />
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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radii.md,
    marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md,
  },
  searchInput: { flex: 1, color: Colors.foreground, fontSize: FontSizes.base, paddingVertical: 10 },
  countText: { fontSize: FontSizes.xs, color: Colors.mutedForeground, paddingHorizontal: Spacing.lg, marginTop: Spacing.sm, marginBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['3xl'] },
  tenantCard: { marginBottom: Spacing.md, gap: Spacing.sm },
  tenantRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${Colors.gold}20`, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gold },
  tenantInfo: { flex: 1, gap: 2 },
  tenantName: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.foreground },
  tenantContact: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  propChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 4, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radii.full,
    backgroundColor: `${Colors.gold}10`,
  },
  propChipText: { fontSize: 10, color: Colors.gold, fontWeight: FontWeights.medium },
  tenantRight: { alignItems: 'flex-end', gap: 4 },
  tenantRent: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gold },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radii.full },
  scoreText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold },
  moveInRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  moveInText: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
});
