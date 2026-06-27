import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTenantStore } from '@/store/tenantStore';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtDate } from '@/utils/format';
import type { Document } from '@/types/database';

const DOC_ICONS: Record<string, string> = {
  contrat: 'document-text-outline',
  quittance: 'receipt-outline',
  bail: 'document-attach-outline',
  photo: 'image-outline',
  autre: 'document-outline',
};

function getDocIcon(type: string): string {
  const key = Object.keys(DOC_ICONS).find((k) => type.toLowerCase().includes(k));
  return DOC_ICONS[key ?? 'autre'];
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function LocataireDocumentsScreen() {
  const router = useRouter();
  const { documents } = useTenantStore();

  const openDocument = async (doc: Document) => {
    try {
      const supported = await Linking.canOpenURL(doc.url);
      if (supported) {
        await Linking.openURL(doc.url);
      } else {
        Toast.show({ type: 'error', text1: 'Impossible d\'ouvrir', text2: 'Lien non disponible.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'ouvrir le document.' });
    }
  };

  const renderDoc = ({ item }: { item: Document }) => (
    <TouchableOpacity onPress={() => openDocument(item)} activeOpacity={0.8}>
      <Card style={styles.docCard}>
        <View style={styles.docIcon}>
          <Ionicons name={getDocIcon(item.type) as any} size={22} color={Colors.gold} />
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.docMeta}>
            {item.type}
            {item.size_bytes ? ` · ${formatFileSize(item.size_bytes)}` : ''}
            {` · ${fmtDate(item.created_at, 'dd/MM/yyyy')}`}
          </Text>
        </View>
        <Ionicons name="download-outline" size={18} color={Colors.mutedForeground} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes documents</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.infoBar}>
        <Ionicons name="shield-checkmark-outline" size={14} color={Colors.gold} />
        <Text style={styles.infoText}>Documents sécurisés — accès chiffré</Text>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderDoc}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="📁"
            title="Aucun document disponible"
            description="Vos contrats, quittances et documents seront accessibles ici."
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
  headerTitle: { flex: 1, fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.foreground, textAlign: 'center' },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: `${Colors.gold}10`, borderBottomWidth: 1, borderBottomColor: `${Colors.gold}20`,
  },
  infoText: { fontSize: FontSizes.xs, color: Colors.gold },
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing['3xl'] },
  docCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  docIcon: {
    width: 44, height: 44, borderRadius: Radii.md,
    backgroundColor: `${Colors.gold}15`, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  docInfo: { flex: 1 },
  docName: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground },
  docMeta: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2, textTransform: 'capitalize' },
});
