export interface BookingPsychologist {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  specialties: string[];
  session_price: number;
  session_prices?: Record<string, Record<string, number>> | null;
  session_duration: number;
  modality: string[];
  city: string | null;
  years_experience: number;
  license_number: string;
  profile_text?: string | null;
  bio?: string | null;
  languages?: string[] | null;
}

export interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface ScheduleBlock {
  block_date: string;
  start_time: string;
  end_time: string;
}

export interface ExistingAppointment {
  appointment_date: string;
  start_time: string;
}

export interface BookingDay {
  date: Date;
  dayOfWeek: number;
  label: string;
}

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

export const MODALITY_LABELS: Record<string, string> = { virtual: 'Virtual', presencial: 'Presencial' };

export const PATIENT_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual (adulto)',
  nino_adolescente: 'Niño / adolescente',
  pareja: 'Pareja',
  familia: 'Familia',
};

export const SPECIALTY_FILTERS = [
  'Ansiedad',
  'Depresion',
  'Relaciones',
  'Duelo',
  'Autoestima',
  'Terapia de pareja',
  'Estres laboral',
  'Traumas',
  'TDAH',
  'Sexualidad',
];

export const BOOKING_DAYS_AHEAD = 14;

export function getUpcomingDays(): BookingDay[] {
  const today = new Date();
  return Array.from({ length: BOOKING_DAYS_AHEAD }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d,
      dayOfWeek: d.getDay(),
      label: i === 0 ? 'Hoy' : i === 1 ? 'Manana' : `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
    };
  });
}

export function normalizeTime(time: string): string {
  return time.slice(0, 5);
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export function formatDateLong(date: Date): string {
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function getAvailableModalities(psy: BookingPsychologist): string[] {
  const raw = (psy.modality || []).map((m) => m.toLowerCase());
  if (raw.includes('mixta')) return ['virtual', 'presencial'];
  const known = raw.filter((m) => m === 'virtual' || m === 'presencial');
  return known.length > 0 ? known : ['virtual'];
}

export function getPatientTypesForModality(psy: BookingPsychologist, modality: string): string[] {
  const prices = psy.session_prices?.[modality] || {};
  const keys = Object.keys(prices).filter((key) => prices[key] > 0);
  return keys.length > 0 ? keys : ['individual'];
}

export function getPriceFor(psy: BookingPsychologist, modality: string, patientType: string): number {
  return psy.session_prices?.[modality]?.[patientType] || psy.session_price || 0;
}
