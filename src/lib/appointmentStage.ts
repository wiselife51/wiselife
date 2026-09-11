/**
 * Deriva la "etapa clinica" real de una cita a partir de status + attended_at
 * + fecha/hora, en lugar de asumir que status ('confirmada' | 'pendiente_pago'
 * | 'completada' | 'cancelada' | 'no_asistio') alcanza para saber si ya se
 * atendio o si le falta la nota de evolucion.
 *
 * attended_at se marca cuando el psicologo confirma que el paciente asistio,
 * de forma independiente a escribir la nota SOAP (session_notes). El status
 * solo pasa a 'completada' cuando existe una nota de evolucion no-borrador.
 */
export type AppointmentStage =
  | 'proxima'
  | 'pago_pendiente'
  | 'verificar'
  | 'atendida_sin_evolucion'
  | 'completada'
  | 'no_asistio'
  | 'cancelada';

export const STAGE_META: Record<AppointmentStage, { label: string; shortLabel: string; badgeClass: string }> = {
  proxima: { label: 'Proxima', shortLabel: 'proxima', badgeClass: 'confirmed' },
  pago_pendiente: { label: 'Pago pendiente', shortLabel: 'pago', badgeClass: 'pending' },
  verificar: { label: 'Verificar si fue atendida', shortLabel: 'verificar', badgeClass: 'verify' },
  atendida_sin_evolucion: { label: 'Atendida - falta evolucion', shortLabel: 'falta nota', badgeClass: 'attended' },
  completada: { label: 'Completada', shortLabel: 'completada', badgeClass: 'done' },
  no_asistio: { label: 'No asistio', shortLabel: 'no asistio', badgeClass: 'noshow' },
  cancelada: { label: 'Cancelada', shortLabel: 'cancelada', badgeClass: 'cancelled' },
};

interface StageInput {
  status: string;
  attended_at?: string | null;
  appointment_date: string;
  end_time: string;
}

export function getAppointmentStage(appt: StageInput, now: Date = new Date()): AppointmentStage {
  if (appt.status === 'cancelada') return 'cancelada';
  if (appt.status === 'no_asistio') return 'no_asistio';
  if (appt.status === 'completada') return 'completada';
  if (appt.status === 'pendiente_pago') return 'pago_pendiente';

  // status === 'confirmada'
  if (appt.attended_at) return 'atendida_sin_evolucion';

  const end = new Date(`${appt.appointment_date}T${appt.end_time}`);
  if (!Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) return 'verificar';

  return 'proxima';
}
