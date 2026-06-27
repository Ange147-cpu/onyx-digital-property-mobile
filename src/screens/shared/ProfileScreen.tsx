import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { ROLE_LABELS } from '@/utils/format';
import type { Profile } from '@/types/database';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, activeRole, allowedRoles, signOut, setActiveRole } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as Profile);
          setFullName(data.full_name ?? '');
          setPhone(data.phone ?? '');
        }
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName, phone, updated_at: new Date().toISOString() } as any);
    setSaving(false);
    if (error) Toast.show({ type: 'error', text1: 'Erreur de sauvegarde' });
    else Toast.show({ type: 'success', text1: 'Profil mis à jour ✓' });
  };

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {(user?.email ?? '??').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Colors.gold} />
            <Text style={styles.roleText}>
              {activeRole ? ROLE_LABELS[activeRole] : 'Utilisateur'}
            </Text>
          </View>
        </View>

        {/* Switch role (if multiple) */}
        {allowedRoles.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changer de rôle</Text>
            <View style={styles.rolesGrid}>
              {allowedRoles.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleBtn, activeRole === role && styles.roleBtnActive]}
                  onPress={() => {
                    setActiveRole(role);
                    const routeMap: Record<string, string> = {
                      proprietaire: '/(app)/proprietaire/',
                      locataire: '/(app)/locataire/',
                      investisseur: '/(app)/investisseur/',
                      service_technique: '/(app)/prestataire/',
                    };
                    router.replace(routeMap[role] as any);
                  }}
                >
                  <Text style={[styles.roleBtnText, activeRole === role && { color: Colors.gold }]}>
                    {ROLE_LABELS[role]}
                  </Text>
                  {activeRole === role && (
                    <Ionicons name="checkmark" size={14} color={Colors.gold} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Edit profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <Input
            label="Nom complet"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Votre nom complet"
            leftIcon={<Ionicons name="person-outline" size={18} color={Colors.mutedForeground} />}
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
            title="Enregistrer les modifications"
            onPress={handleSave}
            variant="gold"
            loading={saving}
            fullWidth
          />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          {[
            { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
            { icon: 'lock-closed-outline', label: 'Sécurité & confidentialité', onPress: () => {} },
            { icon: 'help-circle-outline', label: 'Aide & support', onPress: () => {} },
            { icon: 'document-text-outline', label: 'CGU & Mentions légales', onPress: () => {} },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.settingRow} onPress={item.onPress} activeOpacity={0.7}>
              <Ionicons name={item.icon as any} size={20} color={Colors.mutedForeground} />
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Onyx Digital Property</Text>
          <Text style={styles.infoVersion}>Version 1.0.0</Text>
          <Text style={styles.infoSub}>Plateforme SaaS de gestion immobilière{'\n'}pensée pour l'Afrique francophone</Text>
        </Card>

        {/* Sign out */}
        <View style={styles.signOutSection}>
          <Button
            title="Se déconnecter"
            onPress={handleSignOut}
            variant="danger"
            fullWidth
            icon={<Ionicons name="log-out-outline" size={18} color={Colors.error} />}
          />
        </View>
      </ScrollView>
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
  scroll: { paddingBottom: Spacing['3xl'] },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.sm },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: `${Colors.gold}40`,
  },
  avatarText: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold, color: Colors.goldForeground },
  userEmail: { fontSize: FontSizes.sm, color: Colors.mutedForeground },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radii.full,
    backgroundColor: `${Colors.gold}15`, borderWidth: 1, borderColor: `${Colors.gold}30`,
  },
  roleText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: FontWeights.semibold },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, color: Colors.foreground, marginBottom: Spacing.md },
  rolesGrid: { gap: Spacing.sm },
  roleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderRadius: Radii.lg,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  roleBtnActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}10` },
  roleBtnText: { fontSize: FontSizes.sm, color: Colors.foreground, fontWeight: FontWeights.medium },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  settingLabel: { flex: 1, fontSize: FontSizes.sm, color: Colors.foreground },
  infoCard: { marginHorizontal: Spacing.lg, alignItems: 'center', gap: 4, marginBottom: Spacing.xl },
  infoTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gold },
  infoVersion: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  infoSub: { fontSize: FontSizes.xs, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 18 },
  signOutSection: { paddingHorizontal: Spacing.lg },
});
