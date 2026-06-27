import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProprietaireStore } from '@/store/proprietaireStore';
import { useAuthStore } from '@/store/authStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtFCFA, truncate } from '@/utils/format';
import type { Property } from '@/types/database';

const STATUS_CONFIG = {
  occupied: { label: 'Occupé', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  vacant: { label: 'Vacant', color: '#7A8BAA', bg: 'rgba(122,139,170,0.15)' },
  maintenance: { label: 'Travaux', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
};

export default function PropertiesScreen() {
  const router = useRouter();
  const { properties, deleteProperty, fetchAll } = useProprietaireStore();
  const { organizationId } = useAuthStore();
  const [search, setSearch] = useState('');

  const filtered = properties.filter(
    (p) =>
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (prop: Property) => {
    Alert.alert(
      'Supprimer ce bien ?',
      `"${prop.label}" sera définitivement supprimé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteProperty(prop.id);
            if (error) Toast.show({ type: 'error', text1: 'Erreur', text2: error });
            else Toast.show({ type: 'success', text1: 'Bien supprimé' });
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Property }) => {
    const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.vacant;
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(app)/proprietaire/properties/${item.id}` as any)}
        activeOpacity={0.85}
      >
        <Card style={styles.propCard}>
          <View style={styles.propHeader}>
            <View style={styles.propIcon}>
              <Ionicons name="home-outline" size={22} color="#C9A84C" />
            </View>
            <View style={styles.propMeta}>
              <Text style={styles.propLabel}>{truncate(item.label, 30)}</Text>
              <Text style={styles.propType}>{item.type ?? 'Bien immobilier'}</Text>
            </View>
            <Badge label={status.label} color={status.color} bg={status.bg} />
          </View>
          <View style={styles.propDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color={Colors.mutedForeground} />
              <Text style={styles.detailText}>{item.city ?? item.address ?? '—'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="wallet-outline" size={14} color={Colors.mutedForeground} />
              <Text style={styles.detailText}>{fmtFCFA(item.monthly_rent)}/mois</Text>
            </View>
            {item.surface_m2 && (
              <View style={styles.detailItem}>
                <Ionicons name="resize-outline" size={14} color={Colors.mutedForeground} />
                <Text style={styles.detailText}>{item.surface_m2} m²</Text>
              </View>
            )}
          </View>
          <View style={styles.propActions}>
            <TouchableOpacity
              onPress={() => router.push(`/(app)/proprietaire/properties/edit/${item.id}` as any)}
              style={styles.actionBtn}
            >
              <Ionicons name="pencil-outline" size={16} color={Colors.gold} />
              <Text style={styles.actionText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
              <Text style={[styles.actionText, { color: Colors.error }]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes biens</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/proprietaire/properties/new' as any)}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={22} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.mutedForeground} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un bien..."
          placeholderTextColor={Colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>{filtered.length} bien{filtered.length > 1 ? 's' : ''}</Text>
        <Text style={styles.statsText}>
          {filtered.filter((p) => p.status === 'occupied').length} occupé{filtered.filter((p) => p.status === 'occupied').length > 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="🏠"
            title={search ? 'Aucun résultat' : 'Aucun bien enregistré'}
            description={search ? 'Essayez un autre terme de recherche' : 'Ajoutez votre premier bien immobilier'}
            actionLabel="Ajouter un bien"
            onAction={() => router.push('/(app)/proprietaire/properties/new' as any)}
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
    marginHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.foreground, fontSize: FontSizes.base, paddingVertical: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  statsText: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['3xl'] },
  propCard: { marginBottom: Spacing.md, gap: Spacing.md },
  propHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  propIcon: {
    width: 44, height: 44, borderRadius: Radii.md,
    backgroundColor: `${Colors.gold}15`, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  propMeta: { flex: 1 },
  propLabel: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.foreground },
  propType: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2, textTransform: 'capitalize' },
  propDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  propActions: { flexDirection: 'row', gap: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: FontWeights.medium },
});
