import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { KpiTile } from '@/components/ui/KpiTile';
import { OnyxLogo } from '@/components/ui/OnyxLogo';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtFCFA, fmtDate } from '@/utils/format';
import type { Property } from '@/types/database';

export default function InvestisseurDashboard() {
  const router = useRouter();
  const { user, organizationId, signOut } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!organizationId) return;
    setLoading(true);
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    setProperties((data ?? []) as Property[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [organizationId]);

  const totalProperties = properties.length;
  const occupiedCount = properties.filter((p) => p.status === 'occupied').length;
  const totalRevenue = properties
    .filter((p) => p.status === 'occupied')
    .reduce((s, p) => s + (Number(p.monthly_rent) || 0), 0);
  const vacantCount = properties.filter((p) => p.status === 'vacant').length;
  const occupationRate = totalProperties > 0 ? Math.round((occupiedCount / totalProperties) * 100) : 0;

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => { signOut(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <OnyxLogo size="sm" />
        <TouchableOpacity onPress={handleSignOut} style={styles.avatarBtn}>
          <Text style={styles.avatarText}>{(user?.email ?? '??').slice(0, 2).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={Colors.gold} />}
      >
        {/* Hero Banner */}
        <LinearGradient
          colors={['#0D1F3C', '#162840']}
          style={styles.heroBanner}
        >
          <Text style={styles.heroLabel}>Espace Investisseur</Text>
          <Text style={styles.heroSub}>Vue consolidée de votre portefeuille</Text>
          <View style={styles.goldDivider} />
          <Text style={styles.heroRevenue}>{fmtFCFA(totalRevenue * 12)}</Text>
          <Text style={styles.heroRevenueLabel}>Revenu annuel estimé</Text>
        </LinearGradient>

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          <KpiTile label="Biens" value={totalProperties} icon={<Ionicons name="business-outline" size={18} color={Colors.gold} />} accent loading={loading} />
          <KpiTile label="Taux d'occupation" value={`${occupationRate}%`} icon={<Ionicons name="stats-chart-outline" size={18} color={Colors.gold} />} loading={loading} />
        </View>
        <View style={styles.kpiGrid}>
          <KpiTile label="Revenu mensuel" value={fmtFCFA(totalRevenue)} accent loading={loading} />
          <KpiTile label="Biens vacants" value={vacantCount} loading={loading} />
        </View>

        {/* Coming soon features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctionnalités avancées</Text>
          {[
            { icon: '📊', title: 'Analytiques de performance', sub: 'ROI, TRI, comparatifs sectoriels', badge: 'Premium' },
            { icon: '💼', title: 'Opportunités d\'investissement', sub: 'Biens à fort potentiel en Côte d\'Ivoire', badge: 'Premium' },
            { icon: '📈', title: 'Rapports financiers', sub: 'Exportation PDF mensuelle et annuelle', badge: 'Performance' },
            { icon: '🌍', title: 'Gestion multi-pays', sub: 'Portefeuille panafricain consolidé', badge: 'Premium' },
          ].map((f) => (
            <Card key={f.title} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
              <View style={[styles.featureBadge, f.badge === 'Premium' && styles.featureBadgePremium]}>
                <Text style={styles.featureBadgeText}>{f.badge}</Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Portfolio list */}
        {properties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portefeuille immobilier</Text>
            {properties.map((p) => (
              <Card key={p.id} style={styles.propCard}>
                <View style={styles.propRow}>
                  <View style={styles.propDot(p.status)} />
                  <View style={styles.propInfo}>
                    <Text style={styles.propLabel}>{p.label}</Text>
                    <Text style={styles.propCity}>{p.city ?? '—'}</Text>
                  </View>
                  <View style={styles.propRight}>
                    <Text style={styles.propRent}>{fmtFCFA(p.monthly_rent)}</Text>
                    <Text style={styles.propRentLabel}>/mois</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.goldForeground, fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  scroll: { paddingBottom: Spacing['3xl'] },
  heroBanner: {
    margin: Spacing.lg, borderRadius: Radii.xl, padding: Spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  heroLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.gold, textTransform: 'uppercase', letterSpacing: 1.5 },
  heroSub: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 4 },
  goldDivider: { width: 40, height: 2, backgroundColor: Colors.gold, borderRadius: 1, marginVertical: Spacing.lg },
  heroRevenue: { fontSize: FontSizes['3xl'], fontWeight: FontWeights.bold, color: Colors.foreground },
  heroRevenueLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 4 },
  kpiGrid: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.foreground, marginBottom: Spacing.md },
  featureCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  featureIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  featureInfo: { flex: 1 },
  featureTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  featureSub: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  featureBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radii.full,
    backgroundColor: `${Colors.gold}20`,
  },
  featureBadgePremium: { backgroundColor: 'rgba(167,139,250,0.2)' },
  featureBadgeText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: FontWeights.semibold },
  propCard: { marginBottom: Spacing.sm },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  propDot: (status: string) => ({
    width: 10, height: 10, borderRadius: 5, flexShrink: 0,
    backgroundColor: status === 'occupied' ? Colors.success : status === 'vacant' ? Colors.mutedForeground : Colors.warning,
  }),
  propInfo: { flex: 1 },
  propLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  propCity: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  propRight: { alignItems: 'flex-end' },
  propRent: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gold },
  propRentLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
});
