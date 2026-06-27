import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { OnyxLogo } from '@/components/ui/OnyxLogo';
import { useTenantStore } from '@/store/tenantStore';
import { useAuthStore } from '@/store/authStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtFCFA, fmtDate, fmtMonth, fmtPaymentMethod } from '@/utils/format';

export default function LocataireDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const {
    tenant, property, lease, rentPayments, declarations,
    maintenanceTickets, isLoading, fetchPortal,
  } = useTenantStore();

  const load = useCallback(() => {
    if (user?.id) fetchPortal(user.id);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const lastPayment = rentPayments[0] ?? null;
  const pendingDeclarations = declarations.filter((d) => d.status === 'pending');
  const openTickets = maintenanceTickets.filter((t) => t.status === 'open' || t.status === 'in_progress');

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => { signOut(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <OnyxLogo size="sm" />
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleSignOut} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>
              {(user?.email ?? '??').slice(0, 2).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={Colors.gold} />}
      >
        {/* Property Hero Card */}
        {property ? (
          <LinearGradient
            colors={['#0D1F3C', Colors.surface]}
            style={styles.propertyHero}
          >
            <View style={styles.heroIcon}>
              <Ionicons name="home" size={32} color={Colors.gold} />
            </View>
            <Text style={styles.heroLabel}>{property.label}</Text>
            <Text style={styles.heroCity}>{property.city ?? property.address ?? ''}</Text>
            <View style={styles.heroRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{fmtFCFA(lease?.monthly_rent ?? property.monthly_rent)}</Text>
                <Text style={styles.heroStatLabel}>Loyer/mois</Text>
              </View>
              {lease && (
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{fmtDate(lease.start_date, 'dd/MM/yy')}</Text>
                  <Text style={styles.heroStatLabel}>Début bail</Text>
                </View>
              )}
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{property.surface_m2 ? `${property.surface_m2}m²` : '—'}</Text>
                <Text style={styles.heroStatLabel}>Surface</Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <EmptyState icon="🏠" title="Aucun logement associé" description="Votre propriétaire n'a pas encore lié votre compte à un bien." />
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/(app)/locataire/declare-payment' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${Colors.success}20` }]}>
                <Ionicons name="cash-outline" size={22} color={Colors.success} />
              </View>
              <Text style={styles.quickLabel}>Déclarer{'\n'}un paiement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/(app)/locataire/payments' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${Colors.gold}20` }]}>
                <Ionicons name="receipt-outline" size={22} color={Colors.gold} />
              </View>
              <Text style={styles.quickLabel}>Mes{'\n'}quittances</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/(app)/locataire/maintenance' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${Colors.warning}20` }]}>
                <Ionicons name="hammer-outline" size={22} color={Colors.warning} />
              </View>
              <Text style={styles.quickLabel}>Signaler{'\n'}maintenance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/(app)/locataire/documents' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${Colors.info}20` }]}>
                <Ionicons name="document-outline" size={22} color={Colors.info} />
              </View>
              <Text style={styles.quickLabel}>Mes{'\n'}documents</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Last payment */}
        {lastPayment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dernier paiement enregistré</Text>
            <Card style={styles.lastPaymentCard}>
              <View style={styles.lastPaymentRow}>
                <View>
                  <Text style={styles.lastPaymentAmount}>{fmtFCFA(lastPayment.amount)}</Text>
                  <Text style={styles.lastPaymentPeriod}>{fmtMonth(lastPayment.period_month)}</Text>
                </View>
                <StatusBadge status={lastPayment.status} size="md" />
              </View>
              {lastPayment.payment_method && (
                <Text style={styles.lastPaymentMethod}>
                  via {fmtPaymentMethod(lastPayment.payment_method)}
                </Text>
              )}
            </Card>
          </View>
        )}

        {/* Pending declarations */}
        {pendingDeclarations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Déclarations en attente de validation</Text>
            {pendingDeclarations.map((d) => (
              <Card key={d.id} style={styles.declCard}>
                <View style={styles.declRow}>
                  <Ionicons name="time-outline" size={18} color={Colors.warning} />
                  <View style={styles.declInfo}>
                    <Text style={styles.declAmount}>{fmtFCFA(d.amount)}</Text>
                    <Text style={styles.declPeriod}>
                      {fmtMonth(d.period_month)} · {fmtPaymentMethod(d.payment_method)}
                    </Text>
                  </View>
                  <StatusBadge status={d.status} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Open maintenance tickets */}
        {openTickets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interventions en cours</Text>
            {openTickets.map((t) => (
              <Card key={t.id} style={styles.ticketCard}>
                <View style={styles.ticketRow}>
                  <Ionicons name="hammer-outline" size={18} color={Colors.warning} />
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketTitle}>{t.title}</Text>
                    <Text style={styles.ticketDate}>{fmtDate(t.created_at, 'dd/MM/yyyy')}</Text>
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
  headerRight: { flexDirection: 'row', gap: Spacing.sm },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.goldForeground, fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  scroll: { paddingBottom: Spacing['3xl'] },
  propertyHero: {
    margin: Spacing.lg, borderRadius: Radii.xl, padding: Spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  heroIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: `${Colors.gold}20`, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  heroLabel: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.foreground, textAlign: 'center' },
  heroCity: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 4, marginBottom: Spacing.lg },
  heroRow: { flexDirection: 'row', gap: Spacing.xl },
  heroStat: { alignItems: 'center' },
  heroStatValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.gold },
  heroStatLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.foreground, marginBottom: Spacing.md },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  quickBtn: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radii.lg,
    padding: Spacing.md, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 10, color: Colors.foreground, textAlign: 'center', fontWeight: FontWeights.medium, lineHeight: 14 },
  lastPaymentCard: { gap: Spacing.sm },
  lastPaymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastPaymentAmount: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.gold },
  lastPaymentPeriod: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  lastPaymentMethod: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  declCard: { marginBottom: Spacing.sm },
  declRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  declInfo: { flex: 1 },
  declAmount: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  declPeriod: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  ticketCard: { marginBottom: Spacing.sm },
  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  ticketInfo: { flex: 1 },
  ticketTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.foreground },
  ticketDate: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
});
