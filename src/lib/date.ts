/**
 * Utilidades de fecha de calendario (sin hora).
 *
 * Regla: para un dato de tipo fecha (appointment_date, block_date) NUNCA usar
 * `toISOString()`, porque convierte a UTC. En Colombia (UTC-5) una fecha local
 * a partir de las 19:00 cae al dia siguiente en UTC, y el usuario acaba
 * agendando el 11 cuando eligio el 10.
 *
 * `toISOString()` sigue siendo correcto para timestamps (created_at,
 * updated_at), donde si queremos el instante en UTC.
 */

/** Devuelve la fecha en formato YYYY-MM-DD segun el calendario local. */
export function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Fecha de hoy en formato YYYY-MM-DD segun el calendario local. */
export function todayStr(): string {
  return toDateStr(new Date());
}

/** Suma dias a una fecha y devuelve una nueva instancia (no muta la original). */
export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}
