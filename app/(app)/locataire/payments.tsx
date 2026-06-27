import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTenantStore } from '@/store/tenantStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtFCFA, fmtMonth, fmtDate, fmtPaymentMethod } from '@/utils/format';
import type { RentPayment } from '@/types/database';

export default function LocatairePaymentsScreen() {
  const router = useRouter();
  const { rentPayments, tenant, property } = useTenantStore();

  const renderItem = ({ item }: { item: RentPayment }) => (
    <Card style={styles.row}>
      <View style={styles.rowTop}>
        <View style={styles.periodIcon}>
          <Ionicons name="calendar-outline" size={18} color={Colors.gold} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.period}>{fmtMonth(item.period_month)}</Text>
          {item.payment_date && (
            <Text style={styles.date}>Payé le {fmtDate(item.payment_date, 'dd/MM/yyyy')}</Text>
          )}
          {item.payment_method && (
            <Text style={styles.method}>via {fmtPaymentMethod(item.payment_method)}</Text>
          )}
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.amount}>{fmtFCFA(item.amount)}</Text>
          <StatusBadge status={item.status} />
        </View>
      </View>

      {item.status === 'confirmed' && (
        <TouchableOpacity
          style={styles.quittanceBtn}
          onPress={() =>
            Toast.show({ type: 'info', text1: 'Quittance', text2: 'Téléchargement PDF bientôt disponible.' })
          }
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={15} color={Colors.gold} />
          <Text style={styles.quittanceBtnText}>Télécharger la quittance</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes paiements & quittances</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{rentPayments.length}</Text>
          <Text style={styles.summaryLabel}>Paiements</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {rentPayments.filter((p) => p.status === 'confirmed').length}
          </Text>
          <Text style={styles.summaryLabel}>Confirmés</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {fmtFCFA(rentPayments.filter((p) => p.status === 'confirmed').reduce((s, p) => s + (p.amount || 0), 0))}
          </Text>
          <Text style={styles.summaryLabel}>Total payé</Text>
        </View>
      </View>

      <FlatList
        data={rentPayments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="💳"
            title="Aucun paiement enregistré"
            description="Vos paiements apparaîtront ici une fois confirmés par votre propriétaire."
            actionLabel="Déclarer un paiement"
            onAction={() => router.push('/(app)/locataire/declare-payment' as any)}
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
  headerTitle: { flex: 1, fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.foreground, textAlign: 'center' },
  summary: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.gold },
  summaryLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  summaryDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing['3xl'] },
  row: { marginBottom: Spacing.md, gap: Spacing.md },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  periodIcon: {
    width: 40, height: 40, borderRadius: Radii.md,
    backgroundColor: `${Colors.gold}15`, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowInfo: { flex: 1 },
  period: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  date: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  method: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: FontSizes.base, fontWeight: FontWeights.bold, color: Colors.gold },
  quittanceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: `${Colors.gold}10`, borderRadius: Radii.md,
    borderWidth: 1, borderColor: `${Colors.gold}30`, alignSelf: 'flex-start',
  },
  quittanceBtnText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: FontWeights.medium },
});
