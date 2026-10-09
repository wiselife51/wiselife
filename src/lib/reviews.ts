import { supabase } from './supabase';

export interface RatingSummary {
  psychologist_id: string;
  rating_avg: number;
  rating_count: number;
}

export interface PsychologistReview {
  id: string;
  psychologist_id: string;
  patient_display_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export async function fetchRatingSummaries(): Promise<Record<string, RatingSummary>> {
  const { data } = await supabase
    .from('psychologist_rating_summary')
    .select('psychologist_id, rating_avg, rating_count');

  const map: Record<string, RatingSummary> = {};
  for (const row of (data || []) as RatingSummary[]) {
    map[row.psychologist_id] = {
      psychologist_id: row.psychologist_id,
      rating_avg: Number(row.rating_avg),
      rating_count: Number(row.rating_count),
    };
  }
  return map;
}

export async function fetchReviews(psychologistId: string): Promise<PsychologistReview[]> {
  const { data } = await supabase
    .from('psychologist_reviews')
    .select('id, psychologist_id, patient_display_name, rating, comment, created_at')
    .eq('psychologist_id', psychologistId)
    .order('created_at', { ascending: false })
    .limit(50);
  return (data || []) as PsychologistReview[];
}

export function shortPatientName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Paciente';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}
