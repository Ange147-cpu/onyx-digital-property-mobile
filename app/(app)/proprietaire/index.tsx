import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KpiTile } from '@/components/ui/KpiTile';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { OnyxLogo } from '@/components/ui/OnyxLogo';
import { useAuthStore } from '@/store/authStore';
import { useProprietaireStore } from '@/store/proprietaireStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtFCFA, fmtDate, fmtMonth, truncate } from '@/utils/format';

export default function ProprietaireDashboard() {
  const router = useRouter();
  const { user, organizationId, signOut } = useAuthStore();
  const { kpis, properties, tenants, rentPayments, reminders, activityFeed, isLoading, fetchAll } =
    useProprietaireStore();

  const load = useCallback(() => {
    if (organizationId) fetchAll(organizationId);
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => { signOut(); router.replace('/(auth)/login'); } },
    ]);
  };

  const recentPayments = rentPayments.slice(0, 5);
  const pendingReminders = reminders.slice(0, 3);
  const recentActivity = activityFeed.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <OnyxLogo size="sm" />
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(app)/proprietaire/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.foreground} />
          </TouchableOpacity>
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
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={Colors.gold} />
        }
      >
        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeSub}>Bienvenue,</Text>
          <Text style={styles.welcomeName}>{user?.email?.split('@')[0] ?? 'Propriétaire'}</Text>
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <KpiTile
            label="Biens"
            value={kpis.totalProperties}
            icon={<Ionicons name="business-outline" size={18} color={Colors.gold} />}
            accent
            loading={isLoading}
          />
          <KpiTile
            label="Occupation"
            value={`${kpis.occupationPct}%`}
            sub={`${kpis.occupiedCount}/${kpis.totalProperties} occupés`}
            icon={<Ionicons name="people-outline" size={18} color={Colors.gold} />}
            loading={isLoading}
          />
        </View>
        <View style={styles.kpiGrid}>
          <KpiTile
            label="Revenus/mois"
            value={fmtFCFA(kpis.monthlyRevenue)}
            icon={<Ionicons name="wallet-outline" size={18} color={Colors.gold} />}
            accent
            loading={isLoading}
          />
          <KpiTile
            label="En attente"
            value={kpis.pendingPayments}
            icon={<Ionicons name="time-outline" size={18} color={Colors.warning} />}
            loading={isLoading}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'add-circle-outline', label: 'Ajouter un bien', route: '/(app)/proprietaire/properties/new' },
            { icon: 'person-add-outline', label: 'Nouveau locataire', route: '/(app)/proprietaire/tenants/new' },
            { icon: 'receipt-outline', label: 'Saisir un loyer', route: '/(app)/proprietaire/payments/new' },
            { icon: 'hammer-outline', label: 'Maintenance', route: '/(app)/proprietaire/maintenance' },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.quickBtn}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.75}
            >
              <View style={styles.quickIcon}>
                <Ionicons name={a.icon as any} size={22} color={Colors.gold} />
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Payments */}
        <View style={styles.section}>
          <SectionHeader
            title="Derniers paiements"
            action={{ label: 'Voir tout', onPress: () => router.push('/(app)/proprietaire/payments' as any) }}
          />
          {recentPayments.length === 0 ? (
            <EmptyState icon="💳" title="Aucun paiement enregistré" />
          ) : (
            recentPayments.map((rp) => {
              const tenant = tenants.find((t) => t.id === rp.tenant_id);
              return (
                <Card key={rp.id} style={styles.paymentRow}>
                  <View style={styles.paymentLeft}>
                    <Text style={styles.paymentName}>{tenant?.full_name ?? 'Locataire'}</Text>
                    <Text style={styles.paymentPeriod}>{fmtMonth(rp.period_month)}</Text>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>{fmtFCFA(rp.amount)}</Text>
                    <StatusBadge status={rp.status} />
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* Properties */}
        <View style={styles.section}>
          <SectionHeader
            title="Mes biens"
            action={{ label: 'Gérer', onPress: () => router.push('/(app)/proprietaire/properties' as any) }}
          />
          {properties.length === 0 ? (
            <EmptyState
              icon="🏠"
              title="Aucun bien enregistré"
              actionLabel="Ajouter un bien"
              onAction={() => router.push('/(app)/proprietaire/properties/new' as any)}
            />
          ) : (
            properties.slice(0, 4).map((prop) => (
              <TouchableOpacity
                key={prop.id}
                onPress={() => router.push(`/(app)/proprietaire/properties/${prop.id}` as any)}
                activeOpacity={0.8}
              >
                <Card style={styles.propRow}>
                  <View style={styles.propIcon}>
                    <Ionicons name="home-outline" size={20} color={Colors.gold} />
                  </View>
                  <View style={styles.propInfo}>
                    <Text style={styles.propLabel}>{truncate(prop.label, 28)}</Text>
                    <Text style={styles.propCity}>{prop.city ?? prop.address ?? '—'}</Text>
                  </View>
                  <View style={styles.propRight}>
                    <Text style={styles.propRent}>{fmtFCFA(prop.monthly_rent)}</Text>
                    <Badge
                      label={prop.status === 'occupied' ? 'Occupé' : prop.status === 'vacant' ? 'Vacant' : 'Maintenance'}
                      color={prop.status === 'occupied' ? Colors.success : prop.status === 'vacant' ? Colors.mutedForeground : Colors.warning}
                      bg={prop.status === 'occupied' ? `${Colors.success}20` : prop.status === 'vacant' ? `${Colors.mutedForeground}20` : `${Colors.warning}20`}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Reminders */}
        {pendingReminders.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Rappels" subtitle={`${pendingReminders.length} en attente`} />
            {pendingReminders.map((r) => (
              <Card key={r.id} style={styles.reminderRow}>
                <Ionicons name="alarm-outline" size={16} color={Colors.warning} />
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{r.title}</Text>
                  <Text style={styles.reminderDate}>{fmtDate(r.due_date)}</Text>
                </View>
                <Badge
                  label={r.priority === 'high' ? 'Urgent' : r.priority === 'medium' ? 'Normal' : 'Faible'}
                  color={r.priority === 'high' ? Colors.error : r.priority === 'medium' ? Colors.warning : Colors.mutedForeground}
                  bg={r.priority === 'high' ? `${Colors.error}20` : r.priority === 'medium' ? `${Colors.warning}20` : `${Colors.mutedForeground}20`}
                />
              </Card>
            ))}
          </View>
        )}

        {/* Activity Feed */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Activité récente" />
            {recentActivity.map((a) => (
              <View key={a.id} style={styles.activityRow}>
                <View style={styles.activityDot} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{a.title}</Text>
                  <Text style={styles.activityDate}>{fmtDate(a.created_at, 'dd/MM à HH:mm')}</Text>
                </View>
              </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRight: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  notifBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.goldForeground, fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  scroll: { paddingBottom: Spacing['3xl'] },
  welcome: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, marginBottom: Spacing.base },
  welcomeSub: { fontSize: FontSizes.sm, color: Colors.mutedForeground },
  welcomeName: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.foreground, textTransform: 'capitalize' },
  kpiGrid: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm },
  quickActions: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg,
    gap: Spacing.sm, marginBottom: Spacing.xl, marginTop: Spacing.md,
  },
  quickBtn: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: Radii.lg,
    padding: Spacing.md, alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${Colors.gold}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { fontSize: FontSizes.xs, color: Colors.foreground, fontWeight: FontWeights.medium, textAlign: 'center' },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  paymentLeft: { flex: 1 },
  paymentName: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  paymentPeriod: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  paymentRight: { alignItems: 'flex-end', gap: 4 },
  paymentAmount: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gold },
  propRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.md },
  propIcon: {
    width: 40, height: 40, borderRadius: Radii.md,
    backgroundColor: `${Colors.gold}15`,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  propInfo: { flex: 1 },
  propLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  propCity: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  propRight: { alignItems: 'flex-end', gap: 4 },
  propRent: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.gold },
  reminderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.md },
  reminderInfo: { flex: 1 },
  reminderTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.foreground },
  reminderDate: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  activityRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'flex-start' },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold, marginTop: 6, flexShrink: 0 },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: FontSizes.sm, color: Colors.foreground },
  activityDate: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
});
