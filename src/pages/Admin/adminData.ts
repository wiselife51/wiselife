import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type VerificationStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export type AppointmentStatus =
  | 'pendiente_pago'
  | 'confirmada'
  | 'completada'
  | 'cancelada'
  | 'no_asistio';

export interface AdminPsychologist {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  license_number: string | null;
  education: string | null;
  years_experience: number | null;
  city: string | null;
  specialties: string[] | null;
  is_active: boolean | null;
  verification_status: VerificationStatus;
  verification_submitted_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
}

export interface AdminAppointment {
  id: string;
  psychologist_id: string;
  patient_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  payment_method: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  modality: string | null;
  patient_type: string | null;
  notes: string | null;
  commission_status: string | null;
  commission_amount: number | null;
}

export interface AdminBlock {
  id: string;
  psychologist_id: string;
  block_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export interface AdminData {
  psychologists: AdminPsychologist[];
  profiles: AdminProfile[];
  appointments: AdminAppointment[];
  blocks: AdminBlock[];
  adminIds: string[];
}

export const STATUS_META: Record<AppointmentStatus, { label: string; badge: string }> = {
  pendiente_pago: { label: 'Pendiente de pago', badge: 'pending' },
  confirmada: { label: 'Confirmada', badge: 'confirmed' },
  completada: { label: 'Completada', badge: 'done' },
  cancelada: { label: 'Cancelada', badge: 'cancelled' },
  no_asistio: { label: 'No asistió', badge: 'noshow' },
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  pending: 'Sin documentos',
  submitted: 'En revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

export function todayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export const formatDate = (iso: string | null): string =>
  iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—';

export const formatTime = (t: string | null): string => (t ? t.slice(0, 5) : '');

export const formatCurrency = (value: number | null): string =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );

export const isUpcoming = (a: AdminAppointment, today = todayKey()): boolean =>
  a.appointment_date >= today && (a.status === 'confirmada' || a.status === 'pendiente_pago');

export function sortByDateAsc(a: AdminAppointment, b: AdminAppointment): number {
  return `${a.appointment_date} ${a.start_time}`.localeCompare(`${b.appointment_date} ${b.start_time}`);
}

export function sortByDateDesc(a: AdminAppointment, b: AdminAppointment): number {
  return sortByDateAsc(b, a);
}

async function fetchAdminData(): Promise<{ data: AdminData; error: string }> {
  const [appts, psys, profs, blocks, roles] = await Promise.all([
    supabase
      .from('appointments')
      .select(
        'id, psychologist_id, patient_id, appointment_date, start_time, end_time, status, payment_method, payment_status, payment_amount, modality, patient_type, notes, commission_status, commission_amount',
      )
      .order('appointment_date', { ascending: false })
      .limit(3000),
    supabase
      .from('psychologists')
      .select(
        'id, user_id, full_name, email, phone, avatar_url, license_number, education, years_experience, city, specialties, is_active, verification_status, verification_submitted_at, rejection_reason, created_at',
      )
      .order('full_name', { ascending: true }),
    supabase
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url, date_of_birth, gender, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('schedule_blocks')
      .select('id, psychologist_id, block_date, start_time, end_time, reason')
      .gte('block_date', todayKey())
      .order('block_date', { ascending: true }),
    supabase.from('user_roles').select('user_id').eq('role_code', 'admin'),
  ]);

  const firstError = [appts, psys, profs, blocks, roles].find((r) => r.error)?.error;

  return {
    error: firstError?.message ?? '',
    data: {
      appointments: (appts.data as AdminAppointment[]) || [],
      psychologists: (psys.data as AdminPsychologist[]) || [],
      profiles: (profs.data as AdminProfile[]) || [],
      blocks: (blocks.data as AdminBlock[]) || [],
      adminIds: ((roles.data as { user_id: string }[]) || []).map((r) => r.user_id),
    },
  };
}

const EMPTY: AdminData = { psychologists: [], profiles: [], appointments: [], blocks: [], adminIds: [] };

export function useAdminData(enabled: boolean) {
  const [data, setData] = useState<AdminData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      const result = await fetchAdminData();
      if (cancelled) return;
      setData(result.data);
      setError(result.error);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, reload };
}

export async function setAppointmentsStatus(
  ids: string[],
  status: AppointmentStatus,
): Promise<string> {
  const { error } = await supabase.from('appointments').update({ status }).in('id', ids);
  return error?.message ?? '';
}

export async function deleteAppointment(id: string): Promise<string> {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  return error?.message ?? '';
}
