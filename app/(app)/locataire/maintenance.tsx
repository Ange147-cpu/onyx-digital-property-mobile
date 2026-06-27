import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTenantStore } from '@/store/tenantStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '@/constants/theme';
import { fmtDate, PRIORITY_CONFIG, MAINTENANCE_STATUS_CONFIG, truncate } from '@/utils/format';

const CATEGORIES = [
  { value: 'plomberie', label: 'Plomberie', icon: '🔧' },
  { value: 'electricite', label: 'Électricité', icon: '⚡' },
  { value: 'serrurerie', label: 'Serrurerie', icon: '🔑' },
  { value: 'climatisation', label: 'Climatisation', icon: '❄️' },
  { value: 'peinture', label: 'Peinture', icon: '🎨' },
  { value: 'autre', label: 'Autre', icon: '🏠' },
];

const PRIORITIES = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Normale' },
  { value: 'high', label: 'Haute' },
  { value: 'urgent', label: 'Urgente' },
];

type Tab = 'list' | 'new';

export default function LocataireMaintenanceScreen() {
  const router = useRouter();
  const { tenant, property, maintenanceTickets, fetchPortal } = useTenantStore();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('list');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('plomberie');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Titre requis', text2: 'Décrivez brièvement le problème.' });
      return;
    }
    if (!tenant) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Profil locataire introuvable.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('maintenance_tickets').insert({
      organization_id: tenant.organization_id,
      property_id: tenant.property_id,
      tenant_id: tenant.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      priority,
      status: 'open',
    } as any);
    setLoading(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'envoyer la demande.' });
    } else {
      Toast.show({ type: 'success', text1: 'Demande envoyée ✓', text2: 'Votre propriétaire en sera informé.' });
      setTitle(''); setDescription(''); setCategory('plomberie'); setPriority('medium');
      if (user?.id) await fetchPortal(user.id);
      setTab('list');
    }
  };

  const renderTicket = (ticket: typeof maintenanceTickets[0]) => {
    const priority = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
    const status = MAINTENANCE_STATUS_CONFIG[ticket.status] ?? MAINTENANCE_STATUS_CONFIG.open;
    return (
      <Card key={ticket.id} style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle}>{ticket.title}</Text>
          <View style={styles.ticketBadges}>
            <Badge label={status.label} color={status.color} bg={`${status.color}20`} />
          </View>
        </View>
        {ticket.description && (
          <Text style={styles.ticketDesc}>{truncate(ticket.description, 100)}</Text>
        )}
        <View style={styles.ticketFooter}>
          <Badge label={priority.label} color={priority.color} bg={`${priority.color}20`} />
          <Text style={styles.ticketDate}>{fmtDate(ticket.created_at, 'dd/MM/yyyy')}</Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintenance</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['list', 'new'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'list' ? `Mes demandes (${maintenanceTickets.length})` : 'Nouvelle demande'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'list' ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {maintenanceTickets.length === 0 ? (
            <EmptyState
              icon="🔧"
              title="Aucune demande d'intervention"
              actionLabel="Signaler un problème"
              onAction={() => setTab('new')}
            />
          ) : (
            maintenanceTickets.map(renderTicket)
          )}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            {/* Category */}
            <Text style={styles.fieldLabel}>Catégorie</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.categoryBtn, category === c.value && styles.categoryBtnActive]}
                  onPress={() => setCategory(c.value)}
                >
                  <Text style={styles.categoryIcon}>{c.icon}</Text>
                  <Text style={[styles.categoryLabel, category === c.value && { color: Colors.gold }]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Titre du problème *"
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Fuite d'eau dans la cuisine"
            />

            <Input
              label="Description détaillée"
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez le problème en détail, depuis quand il existe..."
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />

            {/* Priority */}
            <Text style={styles.fieldLabel}>Priorité</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => {
                const cfg = PRIORITY_CONFIG[p.value];
                return (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.priorityBtn,
                      priority === p.value && { borderColor: cfg.color, backgroundColor: `${cfg.color}15` },
                    ]}
                    onPress={() => setPriority(p.value)}
                  >
                    <Text style={[styles.priorityLabel, priority === p.value && { color: cfg.color }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Envoyer la demande"
              onPress={handleSubmit}
              variant="gold"
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.lg }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.gold },
  tabText: { fontSize: FontSizes.sm, color: Colors.mutedForeground, fontWeight: FontWeights.medium },
  tabTextActive: { color: Colors.gold, fontWeight: FontWeights.semibold },
  listContent: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  formContent: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  fieldLabel: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.foreground, marginBottom: 8, marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  categoryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radii.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  categoryBtnActive: { borderColor: Colors.gold, backgroundColor: `${Colors.gold}15` },
  categoryIcon: { fontSize: 16 },
  categoryLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground, fontWeight: FontWeights.medium },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg },
  priorityBtn: {
    flex: 1, paddingVertical: 8, borderRadius: Radii.md,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  priorityLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground, fontWeight: FontWeights.medium },
  ticketCard: { marginBottom: Spacing.md, gap: Spacing.sm },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ticketTitle: { flex: 1, fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.foreground, marginRight: Spacing.sm },
  ticketBadges: { flexShrink: 0 },
  ticketDesc: { fontSize: FontSizes.xs, color: Colors.mutedForeground, lineHeight: 18 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketDate: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
});
