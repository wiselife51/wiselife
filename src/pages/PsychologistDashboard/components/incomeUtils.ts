export interface IncomeAppointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_reference: string | null;
  payment_amount: number | null;
  payment_proof_path: string | null;
  commission_amount: number | null;
  commission_status: string;
  commission_reference: string | null;
  commission_proof_path: string | null;
  commission_review_note: string | null;
  patient: { id: string; full_name: string | null } | null;
}

export type PaymentState = 'pagado' | 'por_verificar' | 'sin_pago' | 'cancelada';
export type Period = 'todo' | 'hoy' | 'semana' | 'mes' | 'mes_anterior' | 'anio' | 'rango';
export type View = 'resumen' | 'movimientos' | 'pacientes' | 'meses' | 'semanas' | 'comisiones';
export type ProofBucket = 'payment-proofs' | 'commission-proofs';

export const PAYMENT_LABEL: Record<PaymentState, string> = {
  pagado: 'Pagado por el paciente',
  por_verificar: 'Por verificar',
  sin_pago: 'Sin pago',
  cancelada: 'Cancelada',
};

export const COMMISSION_LABEL: Record<string, string> = {
  verificada: 'Comisión pagada',
  reportada: 'Comisión en revisión',
  pendiente: 'Comisión por pagar',
  no_aplica: 'Sin comisión',
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

export const pad = (n: number) => String(n).padStart(2, '0');
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const formatDate = (key: string) => key.split('-').reverse().join('/');
export const formatHour = (t: string) => t.slice(0, 5);

export function weekStartKey(key: string): string {
  const date = parseKey(key);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return toKey(date);
}

export function weekLabel(startKey: string): string {
  const start = parseKey(startKey);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const short = (d: Date) => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).replace('.', '');
  return `${short(start)} – ${short(end)} ${end.getFullYear()}`;
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function periodRange(period: Period, from: string, to: string): [string, string] | null {
  const now = new Date();
  switch (period) {
    case 'hoy':
      return [toKey(now), toKey(now)];
    case 'semana': {
      const start = weekStartKey(toKey(now));
      const end = parseKey(start);
      end.setDate(end.getDate() + 6);
      return [start, toKey(end)];
    }
    case 'mes':
      return [toKey(new Date(now.getFullYear(), now.getMonth(), 1)), toKey(new Date(now.getFullYear(), now.getMonth() + 1, 0))];
    case 'mes_anterior':
      return [toKey(new Date(now.getFullYear(), now.getMonth() - 1, 1)), toKey(new Date(now.getFullYear(), now.getMonth(), 0))];
    case 'anio':
      return [`${now.getFullYear()}-01-01`, `${now.getFullYear()}-12-31`];
    case 'rango':
      return [from || '0000-01-01', to || '9999-12-31'];
    default:
      return null;
  }
}

export function paymentStateOf(a: IncomeAppointment): PaymentState {
  if (a.payment_status === 'pagado') return 'pagado';
  if (a.status === 'cancelada') return 'cancelada';
  return a.payment_proof_path ? 'por_verificar' : 'sin_pago';
}

export const amountOf = (a: IncomeAppointment) => Number(a.payment_amount || 0);
export const commissionOf = (a: IncomeAppointment) => Number(a.commission_amount || 0);

export function summarize(rows: IncomeAppointment[]) {
  const totals = {
    count: rows.length,
    paid: 0, paidCount: 0,
    verify: 0, verifyCount: 0,
    unpaid: 0, unpaidCount: 0,
    commPaid: 0, commPaidCount: 0,
    commReview: 0, commReviewCount: 0,
    commPending: 0, commPendingCount: 0,
    net: 0,
  };
  for (const a of rows) {
    const state = paymentStateOf(a);
    const amount = amountOf(a);
    const commission = commissionOf(a);
    if (state === 'pagado') {
      totals.paid += amount; totals.paidCount += 1;
      if (a.commission_status !== 'no_aplica') totals.net -= commission;
      totals.net += amount;
    } else if (state === 'por_verificar') {
      totals.verify += amount; totals.verifyCount += 1;
    } else if (state === 'sin_pago') {
      totals.unpaid += amount; totals.unpaidCount += 1;
    }
    if (a.commission_status === 'verificada') { totals.commPaid += commission; totals.commPaidCount += 1; }
    else if (a.commission_status === 'reportada') { totals.commReview += commission; totals.commReviewCount += 1; }
    else if (a.commission_status === 'pendiente') { totals.commPending += commission; totals.commPendingCount += 1; }
  }
  return totals;
}

export const patientIdOf = (a: IncomeAppointment) => a.patient?.id || 'sin-paciente';
export const patientNameOf = (a: IncomeAppointment) => a.patient?.full_name || 'Paciente sin nombre';

export type IncomeTotals = ReturnType<typeof summarize>;

export interface IncomeGroup {
  key: string;
  rows: IncomeAppointment[];
  totals: IncomeTotals;
}

function groupRows(rows: IncomeAppointment[], keyOf: (a: IncomeAppointment) => string): IncomeGroup[] {
  const map = new Map<string, IncomeAppointment[]>();
  rows.forEach((a) => {
    const key = keyOf(a);
    const list = map.get(key);
    if (list) list.push(a);
    else map.set(key, [a]);
  });
  return [...map.entries()].map(([key, list]) => ({ key, rows: list, totals: summarize(list) }));
}

export function buildGroups(rows: IncomeAppointment[]) {
  return {
    pacientes: groupRows(rows, patientIdOf).sort((x, y) => y.totals.paid - x.totals.paid),
    meses: groupRows(rows, (a) => a.appointment_date.slice(0, 7)).sort((x, y) => y.key.localeCompare(x.key)),
    semanas: groupRows(rows, (a) => weekStartKey(a.appointment_date)).sort((x, y) => y.key.localeCompare(x.key)),
  };
}
