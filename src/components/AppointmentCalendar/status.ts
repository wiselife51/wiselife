/**
 * Metadatos de estado de cita, en archivo aparte para que el modulo del
 * componente solo exporte componentes (regla react-refresh/only-export-components).
 */
export const STATUS_META: Record<string, { label: string; key: string }> = {
  confirmada: { label: 'Confirmada', key: 'confirmed' },
  pendiente_pago: { label: 'Pago pendiente', key: 'pending' },
  completada: { label: 'Completada', key: 'done' },
  cancelada: { label: 'Cancelada', key: 'cancelled' },
};

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarAppointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  /** Nombre de la contraparte: paciente en el panel del psicologo y viceversa. */
  title: string;
  subtitle?: string | null;
  avatarUrl?: string | null;
}
