import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { Tenant, Property, RentPayment, PaymentDeclaration, Document, Lease, MaintenanceTicket } from '@/types/database';

interface TenantPortalState {
  tenant: Tenant | null;
  property: Property | null;
  lease: Lease | null;
  rentPayments: RentPayment[];
  declarations: PaymentDeclaration[];
  documents: Document[];
  maintenanceTickets: MaintenanceTicket[];
  isLoading: boolean;
  error: string | null;
  fetchPortal: (userId: string) => Promise<void>;
  declarePayment: (data: { amount: number; payment_method: string; period_month: string; notes?: string }) => Promise<{ error: string | null }>;
}

export const useTenantStore = create<TenantPortalState>((set, get) => ({
  tenant: null,
  property: null,
  lease: null,
  rentPayments: [],
  declarations: [],
  documents: [],
  maintenanceTickets: [],
  isLoading: false,
  error: null,

  fetchPortal: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: tenantData } = await supabase
        .from('tenants').select('*').eq('user_id', userId).limit(1).single();
      if (!tenantData) { set({ isLoading: false }); return; }
      const tenant = tenantData as Tenant;
      const [propRes, leaseRes, paymentsRes, declRes, docsRes, ticketsRes] = await Promise.all([
        tenant.property_id ? supabase.from('properties').select('*').eq('id', tenant.property_id).single() : Promise.resolve({ data: null }),
        supabase.from('leases').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('rent_payments').select('*').eq('tenant_id', tenant.id).order('period_month', { ascending: false }).limit(24),
        supabase.from('payment_declarations').select('*').eq('tenant_id', tenant.id).order('declared_at', { ascending: false }).limit(20),
        supabase.from('documents').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false }),
        supabase.from('maintenance_tickets').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false }).limit(20),
      ]);
      const leases = (leaseRes.data ?? []) as Lease[];
      const activeLease = leases.find((l) => l.status === 'valide') ?? leases[0] ?? null;
      set({
        tenant,
        property: (propRes.data ?? null) as Property | null,
        lease: activeLease,
        rentPayments: (paymentsRes.data ?? []) as RentPayment[],
        declarations: (declRes.data ?? []) as PaymentDeclaration[],
        documents: (docsRes.data ?? []) as Document[],
        maintenanceTickets: (ticketsRes.data ?? []) as MaintenanceTicket[],
        isLoading: false,
      });
    } catch { set({ error: 'Erreur portail.', isLoading: false }); }
  },

  declarePayment: async (data) => {
    const { tenant } = get();
    if (!tenant) return { error: 'Locataire introuvable.' };
    const { error } = await supabase.from('payment_declarations').insert({
      tenant_id: tenant.id,
      organization_id: tenant.organization_id,
      ...data,
      declared_at: new Date().toISOString(),
      status: 'pending',
    } as any);
    if (error) return { error: error.message };
    return { error: null };
  },
}));
