import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OnyxLogo } from '@/components/ui/OnyxLogo';
import { supabase } from '@/services/supabase';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Email requis' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: 'onyx://reset-password',
    });
    setLoading(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'envoyer l\'email.' });
    } else {
      setSent(true);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
          </TouchableOpacity>

          <OnyxLogo size="md" showText={false} />

          {sent ? (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>📧</Text>
              <Text style={styles.successTitle}>Email envoyé !</Text>
              <Text style={styles.successText}>
                Vérifiez votre boîte mail ({email}) et cliquez sur le lien pour réinitialiser votre mot de passe.
              </Text>
              <Button
                title="Retour à la connexion"
                onPress={() => router.replace('/(auth)/login')}
                variant="gold"
                fullWidth
                style={{ marginTop: Spacing.xl }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.title}>Mot de passe oublié ?</Text>
              <Text style={styles.sub}>
                Saisissez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </Text>

              <Input
                label="Adresse email"
                value={email}
                onChangeText={setEmail}
                placeholder="vous@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.mutedForeground} />}
              />

              <Button
                title="Envoyer le lien"
                onPress={handleSubmit}
                variant="gold"
                loading={loading}
                fullWidth
                size="lg"
              />

              <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                <Text style={styles.backLinkText}>← Retour à la connexion</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.xl, paddingTop: Spacing['2xl'], gap: Spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  title: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold, color: Colors.foreground, marginTop: Spacing.lg },
  sub: { fontSize: FontSizes.sm, color: Colors.mutedForeground, lineHeight: 20 },
  successBox: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing['2xl'] },
  successIcon: { fontSize: 56 },
  successTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.foreground },
  successText: { fontSize: FontSizes.sm, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
  backLink: { alignItems: 'center', marginTop: Spacing.md },
  backLinkText: { fontSize: FontSizes.sm, color: Colors.mutedForeground },
});
