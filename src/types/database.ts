// Types de base de données Supabase — Onyx Digital Property Mobile

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = 'proprietaire' | 'locataire' | 'investisseur' | 'service_technique';
export type PackTier = 'essentiel' | 'performance' | 'premium';
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected' | 'late';
export type PropertyStatus = 'vacant' | 'occupied' | 'maintenance';
export type MaintenanceStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  pack: PackTier;
  trial_ends_at: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  organization_id: string;
  label: string;
  address: string | null;
  city: string | null;
  type: string | null;
  status: PropertyStatus;
  monthly_rent: number | null;
  surface_m2: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  organization_id: string;
  property_id: string | null;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  move_in_date: string | null;
  move_out_date: string | null;
  monthly_rent: number | null;
  deposit_amount: number | null;
  score: number | null;
  created_at: string;
}

export interface Lease {
  id: string;
  organization_id: string;
  property_id: string;
  tenant_id: string;
  status: 'brouillon' | 'valide' | 'resilie' | 'archive';
  type: 'habitation' | 'commercial' | 'mixte';
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  charges: number | null;
  deposit: number | null;
  signed_at: string | null;
  created_at: string;
}

export interface RentPayment {
  id: string;
  organization_id: string;
  tenant_id: string;
  property_id: string | null;
  amount: number;
  period_month: string;
  payment_date: string | null;
  payment_method: string | null;
  status: PaymentStatus;
  late_fee: number | null;
  notes: string | null;
  created_at: string;
}

export interface PaymentDeclaration {
  id: string;
  organization_id: string;
  tenant_id: string;
  amount: number;
  payment_method: string;
  period_month: string;
  declared_at: string;
  status: 'pending' | 'confirmed' | 'rejected';
  proof_url: string | null;
  notes: string | null;
}

export interface MaintenanceTicket {
  id: string;
  organization_id: string;
  property_id: string | null;
  tenant_id: string | null;
  provider_id: string | null;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: MaintenanceStatus;
  category: string | null;
  scheduled_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  organization_id: string;
  property_id: string | null;
  tenant_id: string | null;
  name: string;
  type: string;
  url: string;
  size_bytes: number | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  organization_id: string;
  title: string;
  body: string | null;
  kind: string;
  read_at: string | null;
  link: string | null;
  created_at: string;
}

export interface ActivityFeedItem {
  id: number;
  organization_id: string;
  actor_id: string | null;
  title: string;
  kind: string;
  link: string | null;
  metadata: Json;
  resource_id: string | null;
  resource_table: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  organization_id: string;
  title: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  done: boolean;
  property_id: string | null;
  tenant_id: string | null;
  created_at: string;
}

// Simplified Database interface for createClient typing
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> };
      properties: { Row: Property; Insert: Partial<Property>; Update: Partial<Property> };
      tenants: { Row: Tenant; Insert: Partial<Tenant>; Update: Partial<Tenant> };
      leases: { Row: Lease; Insert: Partial<Lease>; Update: Partial<Lease> };
      rent_payments: { Row: RentPayment; Insert: Partial<RentPayment>; Update: Partial<RentPayment> };
      payment_declarations: { Row: PaymentDeclaration; Insert: Partial<PaymentDeclaration>; Update: Partial<PaymentDeclaration> };
      maintenance_tickets: { Row: MaintenanceTicket; Insert: Partial<MaintenanceTicket>; Update: Partial<MaintenanceTicket> };
      documents: { Row: Document; Insert: Partial<Document>; Update: Partial<Document> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      activity_feed: { Row: ActivityFeedItem; Insert: Partial<ActivityFeedItem>; Update: Partial<ActivityFeedItem> };
      reminders: { Row: Reminder; Insert: Partial<Reminder>; Update: Partial<Reminder> };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
