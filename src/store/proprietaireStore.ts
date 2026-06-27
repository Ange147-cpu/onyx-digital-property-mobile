import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { Property, Tenant, RentPayment, MaintenanceTicket, Reminder, ActivityFeedItem } from '@/types/database';

interface Kpis {
  totalProperties: number;
  occupiedCount: number;
  occupationPct: number;
  monthlyRevenue: number;
  pendingPayments: number;
  openTickets: number;
}

interface ProprietaireState {
  properties: Property[];
  tenants: Tenant[];
  rentPayments: RentPayment[];
  maintenanceTickets: MaintenanceTicket[];
  reminders: Reminder[];
  activityFeed: ActivityFeedItem[];
  isLoading: boolean;
  error: string | null;
  kpis: Kpis;
  fetchAll: (organizationId: string) => Promise<void>;
  addProperty: (data: Partial<Property>, organizationId: string) => Promise<{ error: string | null }>;
  deleteProperty: (id: string, organizationId: string) => Promise<{ error: string | null }>;
}

function computeKpis(properties: Property[], tenants: Tenant[], rentPayments: RentPayment[], tickets: MaintenanceTicket[]): Kpis {
  const total = properties.length;
  const linkedPropIds = new Set(tenants.map((t) => t.property_id).filter(Boolean));
  const occupiedCount = properties.filter((p) => p.status === 'occupied' || linkedPropIds.has(p.id)).length;
  const occupationPct = total > 0 ? Math.round((occupiedCount / total) * 100) : 0;
  const monthlyRevenue = properties
    .filter((p) => p.status === 'occupied' || linkedPropIds.has(p.id))
    .reduce((s, p) => s + (Number(p.monthly_rent) || 0), 0);
  const pendingPayments = rentPayments.filter((rp) => rp.status === 'pending').length;
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'assigned').length;
  return { totalProperties: total, occupiedCount, occupationPct, monthlyRevenue, pendingPayments, openTickets };
}

export const useProprietaireStore = create<ProprietaireState>((set, get) => ({
  properties: [],
  tenants: [],
  rentPayments: [],
  maintenanceTickets: [],
  reminders: [],
  activityFeed: [],
  isLoading: false,
  error: null,
  kpis: { totalProperties: 0, occupiedCount: 0, occupationPct: 0, monthlyRevenue: 0, pendingPayments: 0, openTickets: 0 },

  fetchAll: async (organizationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [propsRes, tenantsRes, paymentsRes, ticketsRes, remindersRes, feedRes] = await Promise.all([
        supabase.from('properties').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }),
        supabase.from('tenants').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }),
        supabase.from('rent_payments').select('*').eq('organization_id', organizationId).order('period_month', { ascending: false }).limit(100),
        supabase.from('maintenance_tickets').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(50),
        supabase.from('reminders').select('*').eq('organization_id', organizationId).eq('done', false).order('due_date', { ascending: true }).limit(20),
        supabase.from('activity_feed').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(30),
      ]);
      const properties = (propsRes.data ?? []) as Property[];
      const tenants = (tenantsRes.data ?? []) as Tenant[];
      const rentPayments = (paymentsRes.data ?? []) as RentPayment[];
      const tickets = (ticketsRes.data ?? []) as MaintenanceTicket[];
      set({
        properties, tenants, rentPayments,
        maintenanceTickets: tickets,
        reminders: (remindersRes.data ?? []) as Reminder[],
        activityFeed: (feedRes.data ?? []) as ActivityFeedItem[],
        kpis: computeKpis(properties, tenants, rentPayments, tickets),
        isLoading: false,
      });
    } catch {
      set({ error: 'Erreur de chargement.', isLoading: false });
    }
  },

  addProperty: async (data, organizationId) => {
    const { error } = await supabase.from('properties').insert({ ...data, organization_id: organizationId } as any);
    if (error) return { error: error.message };
    await get().fetchAll(organizationId);
    return { error: null };
  },

  deleteProperty: async (id, organizationId) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) return { error: error.message };
    await get().fetchAll(organizationId);
    return { error: null };
  },
}));
