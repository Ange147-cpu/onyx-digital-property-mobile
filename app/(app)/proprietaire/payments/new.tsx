import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProprietaireStore } from '@/store/proprietaireStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtFCFA } from '@/utils/format';

const PAYMENT_METHODS = [
  { value: 'wave', label: 'Wave', icon: '💙' },
  { value: 'orange_money', label: 'Orange Money', icon: '🟠' },
  { value: 'mtn_money', label: 'MTN MoMo', icon: '🟡' },
  { value: 'moov_money', label: 'Moov Money', icon: '💚' },
  { value: 'cash', label: 'Espèces', icon: '💵' },
  { value: 'bank_transfer', label: 'Virement', icon: '🏦' },
];

export default function NewPaymentScreen() {
  const router = useRouter();
  const { tenants, properties, fetchAll } = useProprietaireStore();
  const { organizationId } = useAuthStore();

  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('wave');
  const [periodMonth, setPeriodMonth] = useState(new Date().toISOString().slice(0, 7) + '-01');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);
  const suggestedAmount = selectedTenant?.monthly_rent ?? null;

  const handleSave = async () => {
    if (!selectedTenantId || !amount || !organizationId) {
      Toast.show({ type: 'error', text1: 'Champs requis', text2: 'Sélectionnez un locataire et saisissez le montant.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('rent_payments').insert({
      organization_id: organizationId,
      tenant_id: selectedTenantId,
      property_id: selectedTenant?.property_id ?? null,
      amount: parseFloat(amount),
      payment_method: method,
      period_month: periodMonth,
      payment_date: new Date().toISOString().slice(0, 10),
      status: 'confirmed',
      notes: notes.trim() || null,
    } as any);
    setLoading(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'enregistrer le paiement.' });
    } else {
      if (organizationId) await fetchAll(organizationId);
      Toast.show({ type: 'success', text1: 'Paiement enregistré ✓' });
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saisir un paiement</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Tenant Selector */}
          <Text style={styles.fieldLabel}>Locataire *</Text>
          {tenants.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun locataire enregistré</Text>
            </Card>
          ) : (
            <ScrollView style={styles.tenantList} showsVerticalScrollIndicator={false} nestedScrollEnabled>
              {tenants.map((t) => {
                const prop = properties.find((p) => p.id === t.property_id);
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.tenantRow, selectedTenantId === t.id && styles.tenantRowActive]}
                    onPress={() => {
                      setSelectedTenantId(t.id);
                      if (t.monthly_rent) setAmount(String(t.monthly_rent));
                    }}
                  >
                    <View style={styles.tenantAvatar}>
                      <Text style={styles.tenantAvatarText}>{t.full_name.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.tenantInfo}>
                      <Text style={[styles.tenantName, selectedTenantId === t.id && { color: Colors.gold }]}>
                        {t.full_name}
                      </Text>
                      <Text style={styles.tenantProp}>{prop?.label ?? 'Sans bien associé'}</Text>
                    </View>
                    {selectedTenantId === t.id && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Amount */}
          <View style={styles.amountSection}>
            <Input
              label={`Montant (FCFA) *${suggestedAmount ? ` — Loyer : ${fmtFCFA(suggestedAmount)}` : ''}`}
              value={amount}
              onChangeText={setAmount}
              placeholder="150000"
              keyboardType="numeric"
            />
            {suggestedAmount && !amount && (
              <TouchableOpacity
                style={styles.suggestBtn}
                onPress={() => setAmount(String(suggestedAmount))}
              >
                <Text style={styles.suggestText}>Utiliser le loyer habituel → {fmtFCFA(suggestedAmount)}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Payment Method */}
          <Text style={styles.fieldLabel}>Mode de paiement</Text>
          <View style={styles.methodGrid}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.methodBtn, method === m.value && styles.methodBtnActive]}
                onPress={() => setMethod(m.value)}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <Text style={[styles.methodLabel, method === m.value && { color: Colors.gold }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Period */}
          <Input
            label="Mois de référence"
            value={periodMonth.slice(0, 7)}
            onChangeText={(v) => setPeriodMonth(v + '-01')}
            placeholder="2025-06"
            hint="Format: YYYY-MM"
          />

          <Input
            label="Notes (optionnelles)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Informations complémentaires..."
            multiline
          />

          <Button
            title="Enregistrer le paiement"
            onPress={handleSave}
            variant="gold"
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: Spacing.md }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  fieldLabel: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.foreground, marginBottom: 8, marginTop: 4 },
  emptyCard: { padding: Spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: FontSizes.sm, color: Colors.mutedForeground },
  tenantList: { maxHeight: 200, marginBottom: Spacing.lg },
  tenantRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: Radii.lg,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, marginBottom: Spacing.sm,
  },
  tenantRowActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}10` },
  tenantAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${Colors.gold}20`, alignItems: 'center', justifyContent: 'center',
  },
  tenantAvatarText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gold },
  tenantInfo: { flex: 1 },
  tenantName: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  tenantProp: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  amountSection: {},
  suggestBtn: {
    alignSelf: 'flex-start', marginTop: -Spacing.md, marginBottom: Spacing.md,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: `${Colors.gold}15`, borderRadius: Radii.full,
  },
  suggestText: { fontSize: FontSizes.xs, color: Colors.gold },
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  methodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radii.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  methodBtnActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}15` },
  methodIcon: { fontSize: 16 },
  methodLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground, fontWeight: FontWeights.medium },
});
