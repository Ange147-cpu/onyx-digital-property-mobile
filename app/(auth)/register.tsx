import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OnyxLogo } from '@/components/ui/OnyxLogo';
import { supabase } from '@/services/supabase';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';

const ROLES = [
  { value: 'proprietaire', label: '🏠 Propriétaire', desc: 'Je gère des biens immobiliers' },
  { value: 'locataire', label: '🔑 Locataire', desc: 'Je suis locataire d\'un bien' },
  { value: 'investisseur', label: '📊 Investisseur', desc: 'Je suis un investisseur' },
  { value: 'service_technique', label: '🔧 Prestataire', desc: 'Je suis prestataire technique' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !email || !role) {
      Toast.show({ type: 'error', text1: 'Champs requis', text2: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('trial_applications' as any).insert({
        full_name: fullName,
        email: email.trim().toLowerCase(),
        phone,
        role,
        status: 'pending',
      });

      if (error) throw error;

      Toast.show({ type: 'success', text1: 'Demande envoyée !', text2: 'Notre équipe vous contactera sous 48h.' });
      router.replace('/(auth)/login');
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'envoyer la demande. Réessayez.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
          </TouchableOpacity>
          <OnyxLogo size="sm" />
        </View>

        <Text style={styles.title}>Demander un accès</Text>
        <Text style={styles.sub}>
          Onyx Digital Property est une plateforme sur invitation.{'\n'}
          Remplissez ce formulaire et notre équipe vous contactera.
        </Text>

        {/* Role Selector */}
        <Text style={styles.sectionLabel}>Votre profil *</Text>
        <View style={styles.rolesGrid}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.roleCard, role === r.value && styles.roleCardActive]}
              onPress={() => setRole(r.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.roleEmoji}>{r.label.split(' ')[0]}</Text>
              <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                {r.label.slice(3)}
              </Text>
              <Text style={styles.roleDesc}>{r.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Nom complet *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Jean-Pierre Kouassi"
            autoComplete="name"
            leftIcon={<Ionicons name="person-outline" size={18} color={Colors.mutedForeground} />}
          />
          <Input
            label="Email *"
            value={email}
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.mutedForeground} />}
          />
          <Input
            label="Téléphone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+225 07 XX XX XX XX"
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={18} color={Colors.mutedForeground} />}
          />

          <Button
            title="Envoyer la demande"
            onPress={handleSubmit}
            variant="gold"
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Retour à la connexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.foreground,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.foreground,
    marginBottom: Spacing.md,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  roleCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleCardActive: {
    borderColor: Colors.gold,
    backgroundColor: `${Colors.gold}10`,
  },
  roleEmoji: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  roleLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.foreground,
    marginBottom: 2,
  },
  roleLabelActive: {
    color: Colors.gold,
  },
  roleDesc: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
  },
  form: {
    gap: 0,
  },
  backLink: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  backLinkText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
});
