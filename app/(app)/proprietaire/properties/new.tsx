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
import { useProprietaireStore } from '@/store/proprietaireStore';
import { useAuthStore } from '@/store/authStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';

const PROPERTY_TYPES = ['appartement', 'maison', 'villa', 'studio', 'bureau', 'commerce', 'entrepot', 'terrain'];
const PROPERTY_STATUS = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupé' },
  { value: 'maintenance', label: 'En travaux' },
];

export default function NewPropertyScreen() {
  const router = useRouter();
  const { addProperty } = useProprietaireStore();
  const { organizationId } = useAuthStore();

  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('appartement');
  const [status, setStatus] = useState<'vacant' | 'occupied' | 'maintenance'>('vacant');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [surface, setSurface] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!label.trim()) {
      Toast.show({ type: 'error', text1: 'Champ requis', text2: 'Le nom du bien est obligatoire.' });
      return;
    }
    if (!organizationId) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Organisation introuvable.' });
      return;
    }

    setLoading(true);
    const { error } = await addProperty({
      organization_id: organizationId,
      label: label.trim(),
      address: address.trim() || null,
      city: city.trim() || null,
      type,
      status,
      monthly_rent: monthlyRent ? parseFloat(monthlyRent) : null,
      surface_m2: surface ? parseFloat(surface) : null,
      description: description.trim() || null,
    });
    setLoading(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'enregistrer le bien.' });
    } else {
      Toast.show({ type: 'success', text1: 'Bien ajouté !', text2: `"${label}" a été enregistré.` });
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau bien</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Nom du bien *"
            value={label}
            onChangeText={setLabel}
            placeholder="Ex: Villa Cocody, Appartement Plateau..."
          />
          <Input label="Adresse" value={address} onChangeText={setAddress} placeholder="12 Rue des Manguiers" />
          <Input label="Ville" value={city} onChangeText={setCity} placeholder="Abidjan, Bouaké..." />

          {/* Type Selector */}
          <Text style={styles.fieldLabel}>Type de bien</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {PROPERTY_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, type === t && styles.chipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Status Selector */}
          <Text style={styles.fieldLabel}>Statut</Text>
          <View style={styles.statusRow}>
            {PROPERTY_STATUS.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.statusBtn, status === s.value && styles.statusBtnActive]}
                onPress={() => setStatus(s.value as any)}
              >
                <Text style={[styles.statusText, status === s.value && styles.statusTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Loyer mensuel (FCFA)"
            value={monthlyRent}
            onChangeText={setMonthlyRent}
            placeholder="150000"
            keyboardType="numeric"
          />
          <Input
            label="Surface (m²)"
            value={surface}
            onChangeText={setSurface}
            placeholder="65"
            keyboardType="numeric"
          />
          <Input
            label="Description (optionnelle)"
            value={description}
            onChangeText={setDescription}
            placeholder="Détails supplémentaires..."
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />

          <Button
            title="Enregistrer le bien"
            onPress={handleSave}
            variant="gold"
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: Spacing.lg }}
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
  chipScroll: { marginBottom: Spacing.lg },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radii.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    marginRight: 8,
  },
  chipActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}15` },
  chipText: { fontSize: FontSizes.sm, color: Colors.mutedForeground },
  chipTextActive: { color: Colors.gold, fontWeight: FontWeights.semibold },
  statusRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statusBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radii.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  statusBtnActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}15` },
  statusText: { fontSize: FontSizes.sm, color: Colors.mutedForeground },
  statusTextActive: { color: Colors.gold, fontWeight: FontWeights.semibold },
});
