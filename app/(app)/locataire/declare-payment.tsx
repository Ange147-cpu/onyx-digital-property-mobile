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
import { useTenantStore } from '@/store/tenantStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtFCFA } from '@/utils/format';

const PAYMENT_METHODS = [
  { value: 'wave', label: 'Wave', icon: '💙', color: '#1E88E5' },
  { value: 'orange_money', label: 'Orange Money', icon: '🟠', color: '#FF6D00' },
  { value: 'mtn_money', label: 'MTN MoMo', icon: '🟡', color: '#FFCA28' },
  { value: 'moov_money', label: 'Moov Money', icon: '💚', color: '#43A047' },
  { value: 'cash', label: 'Espèces', icon: '💵', color: '#78909C' },
  { value: 'bank_transfer', label: 'Virement', icon: '🏦', color: '#5C6BC0' },
];

export default function DeclarePaymentScreen() {
  const router = useRouter();
  const { tenant, lease, property, declarePayment } = useTenantStore();

  const [amount, setAmount] = useState(lease?.monthly_rent ? String(lease.monthly_rent) : '');
  const [method, setMethod] = useState('wave');
  const [periodMonth, setPeriodMonth] = useState(new Date().toISOString().slice(0, 7) + '-01');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const suggestedAmount = lease?.monthly_rent ?? tenant?.monthly_rent ?? null;

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({ type: 'error', text1: 'Montant requis', text2: 'Saisissez le montant payé.' });
      return;
    }

    if (!confirmed) {
      Toast.show({ type: 'error', text1: 'Confirmation requise', text2: 'Cochez la case de confirmation.' });
      return;
    }

    setLoading(true);
    const { error } = await declarePayment({
      amount: parseFloat(amount),
      payment_method: method,
      period_month: periodMonth,
      notes: notes.trim() || undefined,
    });
    setLoading(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'envoyer la déclaration.' });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Déclaration envoyée ✓',
        text2: 'Votre propriétaire va valider le paiement.',
      });
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Déclarer un paiement</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Context */}
          {property && (
            <Card style={styles.contextCard}>
              <Ionicons name="home-outline" size={20} color={Colors.gold} />
              <View>
                <Text style={styles.contextLabel}>{property.label}</Text>
                {property.city && <Text style={styles.contextSub}>{property.city}</Text>}
              </View>
            </Card>
          )}

          {/* Amount */}
          <Input
            label={`Montant payé (FCFA) *${suggestedAmount ? ` — Loyer : ${fmtFCFA(suggestedAmount)}` : ''}`}
            value={amount}
            onChangeText={setAmount}
            placeholder={suggestedAmount ? String(suggestedAmount) : '150000'}
            keyboardType="numeric"
          />
          {suggestedAmount && amount !== String(suggestedAmount) && (
            <TouchableOpacity
              style={styles.suggestBtn}
              onPress={() => setAmount(String(suggestedAmount))}
            >
              <Text style={styles.suggestText}>← Utiliser le montant du loyer : {fmtFCFA(suggestedAmount)}</Text>
            </TouchableOpacity>
          )}

          {/* Payment method */}
          <Text style={styles.fieldLabel}>Mode de paiement *</Text>
          <View style={styles.methodGrid}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.methodCard,
                  method === m.value && { borderColor: m.color, backgroundColor: `${m.color}15` },
                ]}
                onPress={() => setMethod(m.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <Text style={[styles.methodLabel, method === m.value && { color: m.color }]}>
                  {m.label}
                </Text>
                {method === m.value && (
                  <Ionicons name="checkmark-circle" size={16} color={m.color} style={styles.methodCheck} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Period */}
          <Input
            label="Mois concerné"
            value={periodMonth.slice(0, 7)}
            onChangeText={(v) => setPeriodMonth(v.length >= 7 ? v + '-01' : v)}
            placeholder="2025-06"
            hint="Format: YYYY-MM (ex: 2025-06 pour juin 2025)"
          />

          <Input
            label="Notes (optionnelles)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Référence de transaction, remarques..."
            multiline
          />

          {/* Confirmation checkbox */}
          <TouchableOpacity
            style={styles.confirmRow}
            onPress={() => setConfirmed(!confirmed)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, confirmed && styles.checkboxActive]}>
              {confirmed && <Ionicons name="checkmark" size={14} color={Colors.goldForeground} />}
            </View>
            <Text style={styles.confirmText}>
              Je certifie avoir effectué ce paiement et les informations ci-dessus sont exactes.
            </Text>
          </TouchableOpacity>

          <Button
            title="Envoyer la déclaration"
            onPress={handleSubmit}
            variant="gold"
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: Spacing.lg }}
            icon={<Ionicons name="send-outline" size={20} color={Colors.goldForeground} />}
            iconPosition="right"
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
  contextCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  contextLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  contextSub: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  fieldLabel: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.foreground, marginBottom: 8 },
  suggestBtn: {
    marginTop: -Spacing.md, marginBottom: Spacing.md,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: `${Colors.gold}15`, borderRadius: Radii.full, alignSelf: 'flex-start',
  },
  suggestText: { fontSize: FontSizes.xs, color: Colors.gold },
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: Radii.md,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    position: 'relative',
  },
  methodIcon: { fontSize: 18 },
  methodLabel: { fontSize: FontSizes.sm, color: Colors.foreground, fontWeight: FontWeights.medium },
  methodCheck: { marginLeft: 4 },
  confirmRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginTop: Spacing.sm },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxActive: { borderColor: Colors.gold, backgroundColor: Colors.gold },
  confirmText: { flex: 1, fontSize: FontSizes.xs, color: Colors.mutedForeground, lineHeight: 18 },
});
