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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { OnyxLogo } from '@/components/ui/OnyxLogo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const activeRole = useAuthStore((s) => s.activeRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide';
    if (!password) e.password = 'Le mot de passe est requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Connexion échouée', text2: error });
      return;
    }

    // Navigate based on role
    const roleRoutes: Record<string, string> = {
      proprietaire: '/(app)/proprietaire/',
      locataire: '/(app)/locataire/',
      investisseur: '/(app)/investisseur/',
      service_technique: '/(app)/prestataire/',
    };
    const dest = activeRole ? roleRoutes[activeRole] : '/(app)/proprietaire/';
    router.replace(dest as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[Colors.background, '#0D1F3C', Colors.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <OnyxLogo size="lg" />
          <View style={styles.goldLine} />
          <Text style={styles.tagline}>
            Gérez votre patrimoine immobilier{'\n'}en toute sécurité, où que vous soyez.
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>
          <Text style={styles.cardSub}>Accédez à votre espace personnel</Text>

          <Input
            label="Adresse email"
            value={email}
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.mutedForeground} />}
          />

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoComplete="password"
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.mutedForeground} />}
            rightIcon={
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.mutedForeground}
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => router.push('/(auth)/forgot-password' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.forgot}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            variant="gold"
            loading={loading}
            fullWidth
            size="lg"
            style={styles.loginBtn}
            icon={<Ionicons name="log-in-outline" size={20} color={Colors.goldForeground} />}
            iconPosition="right"
          />

          {/* Separator */}
          <View style={styles.separator}>
            <View style={styles.sepLine} />
            <Text style={styles.sepText}>ou</Text>
            <View style={styles.sepLine} />
          </View>

          {/* Register prompt */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text style={styles.registerLink}>Demander un accès</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mobile Money badges */}
        <View style={styles.mobileMoneyRow}>
          {['Wave', 'Orange Money', 'MTN MoMo', 'Moov'].map((mm) => (
            <View key={mm} style={styles.mmBadge}>
              <Text style={styles.mmText}>{mm}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.mmSub}>Paiements Mobile Money supportés</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  goldLine: {
    width: 40,
    height: 3,
    backgroundColor: Colors.gold,
    borderRadius: 2,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  tagline: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.foreground,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginBottom: Spacing.xl,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  forgot: {
    fontSize: FontSizes.sm,
    color: Colors.gold,
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  sepLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  sepText: {
    color: Colors.mutedForeground,
    fontSize: FontSizes.xs,
    marginHorizontal: Spacing.md,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  registerLink: {
    fontSize: FontSizes.sm,
    color: Colors.gold,
    fontWeight: FontWeights.semibold,
  },
  mobileMoneyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  mmBadge: {
    backgroundColor: Colors.white5,
    borderRadius: Radii.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mmText: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    fontWeight: FontWeights.medium,
  },
  mmSub: {
    fontSize: FontSizes.xs,
    color: `${Colors.mutedForeground}80`,
    textAlign: 'center',
  },
});
