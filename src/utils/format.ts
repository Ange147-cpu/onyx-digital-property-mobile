// Utility functions for Onyx Digital Property Mobile

import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a number as FCFA currency
 */
export function fmtFCFA(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  return `${Number(amount).toLocaleString('fr-FR')} FCFA`;
}

/**
 * Format a date string
 */
export function fmtDate(dateStr: string | null | undefined, fmt = 'dd/MM/yyyy'): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    return format(date, fmt);
  } catch {
    return '—';
  }
}

/**
 * Format a period month (YYYY-MM-DD) to "Juin 2025"
 */
export function fmtMonth(periodMonth: string | null | undefined): string {
  if (!periodMonth) return '—';
  try {
    const date = parseISO(periodMonth);
    const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return periodMonth ?? '—';
  }
}

/**
 * Get initials from a name or email
 */
export function getInitials(nameOrEmail: string | null | undefined): string {
  if (!nameOrEmail) return '??';
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nameOrEmail.slice(0, 2).toUpperCase();
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  mtn_money: 'MTN MoMo',
  moov_money: 'Moov Money',
  cash: 'Espèces',
  bank_transfer: 'Virement',
  cheque: 'Chèque',
};

export function fmtPaymentMethod(method: string | null | undefined): string {
  if (!method) return '—';
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Faible', color: '#6B7280' },
  medium: { label: 'Normale', color: '#F59E0B' },
  high: { label: 'Haute', color: '#EF4444' },
  urgent: { label: 'Urgente', color: '#DC2626' },
};

export const MAINTENANCE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: 'Ouvert', color: '#F59E0B' },
  assigned: { label: 'Assigné', color: '#3B82F6' },
  in_progress: { label: 'En cours', color: '#8B5CF6' },
  resolved: { label: 'Résolu', color: '#22C55E' },
  closed: { label: 'Clôturé', color: '#6B7280' },
};

export const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  confirmed: { label: 'Confirmé', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  rejected: { label: 'Rejeté', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  late: { label: 'En retard', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  paid: { label: 'Payé', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
};

export const ROLE_LABELS: Record<string, string> = {
  proprietaire: 'Propriétaire',
  locataire: 'Locataire',
  investisseur: 'Investisseur',
  service_technique: 'Prestataire',
};

export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '…';
}
