import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../../lib/supabase';
import { DashboardModuleHeader } from './DashboardModuleHeader';
import { IncomeCharts } from './IncomeCharts';
import {
  COMMISSION_LABEL,
  PAYMENT_LABEL,
  amountOf,
  buildGroups,
  commissionOf,
  formatCurrency,
  formatDate,
  formatHour,
  monthLabel,
  parseKey,
  patientIdOf,
  patientNameOf,
  paymentStateOf,
  periodRange,
  summarize,
  toKey,
  weekLabel,
  type IncomeAppointment,
  type PaymentState,
  type Period,
  type ProofBucket,
  type View,
} from './incomeUtils';
import './IncomeModule.css';

export type { IncomeAppointment };

const PAGE_SIZE = 30;

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'todo', label: 'Todo el historial' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
  { value: 'mes_anterior', label: 'Mes anterior' },
  { value: 'anio', label: 'Este año' },
  { value: 'rango', label: 'Rango personalizado' },
];

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'movimientos', label: 'Movimientos' },
  { value: 'pacientes', label: 'Por paciente' },
  { value: 'meses', label: 'Por mes' },
  { value: 'semanas', label: 'Por semana' },
  { value: 'comisiones', label: 'Comisiones' },
];


function csvCell(value: string | number | null): string {
  if (value === null || value === '') return '""';
  if (typeof value === 'number') return String(value);
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadReport(rows: IncomeAppointment[]) {
  const header = ['Fecha', 'Hora', 'Paciente', 'Estado de la cita', 'Estado del pago', 'Método de pago', 'Referencia del pago', 'Monto', 'Comisión', 'Estado de la comisión', 'Referencia de la comisión'];
  const lines = rows.map((a) => [
    a.appointment_date,
    formatHour(a.start_time),
    patientNameOf(a),
    a.status,
    PAYMENT_LABEL[paymentStateOf(a)],
    a.payment_method,
    a.payment_reference,
    amountOf(a),
    commissionOf(a),
    COMMISSION_LABEL[a.commission_status] || a.commission_status,
    a.commission_reference,
  ].map(csvCell).join(','));
  const blob = new Blob([`\ufeff${[header.map(csvCell).join(','), ...lines].join('\r\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `informe-ingresos-${toKey(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

interface MovementRowProps {
  appointment: IncomeAppointment;
  expanded: boolean;
  loadingKey: string | null;
  onToggle: () => void;
  onProof: (bucket: ProofBucket, path: string, key: string) => void;
}

function MovementRow({ appointment: a, expanded, loadingKey, onToggle, onProof }: MovementRowProps) {
  const state = paymentStateOf(a);
  const hasCommission = a.commission_status !== 'no_aplica';
  const paymentKey = `${a.id}:payment`;
  const commissionKey = `${a.id}:commission`;

  return (
    <div className={`inc-row${expanded ? ' inc-row--open' : ''}`}>
      <button type="button" className="inc-row-main" onClick={onToggle} aria-expanded={expanded}>
        <span className="inc-row-date">
          <strong>{formatDate(a.appointment_date)}</strong>
          <small>{formatHour(a.start_time)}</small>
        </span>
        <span className="inc-row-patient">
          <strong>{patientNameOf(a)}</strong>
          <span className="inc-row-badges">
            <span className={`inc-badge inc-badge--${state}`}>{PAYMENT_LABEL[state]}</span>
            {hasCommission && (
              <span className={`inc-badge inc-badge--c-${a.commission_status}`}>{COMMISSION_LABEL[a.commission_status] || a.commission_status}</span>
            )}
          </span>
        </span>
        <span className="inc-row-amount">
          <strong className={state === 'pagado' ? 'inc-amount--paid' : 'inc-amount--muted'}>{formatCurrency(amountOf(a))}</strong>
          {hasCommission && <small>Comisión {formatCurrency(commissionOf(a))}</small>}
        </span>
        <svg className="inc-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {expanded && (
        <div className="inc-detail">
          <section className="inc-detail-block">
            <h4>Pago del paciente</h4>
            <dl>
              <div><dt>Estado</dt><dd>{PAYMENT_LABEL[state]}</dd></div>
              <div><dt>Monto</dt><dd>{formatCurrency(amountOf(a))}</dd></div>
              <div><dt>Método</dt><dd>{a.payment_method || 'No registrado'}</dd></div>
              <div><dt>Referencia</dt><dd>{a.payment_reference || 'Sin referencia'}</dd></div>
            </dl>
            {a.payment_proof_path ? (
              <button type="button" className="inc-proof-btn" disabled={loadingKey === paymentKey} onClick={() => onProof('payment-proofs', a.payment_proof_path as string, paymentKey)}>
                {loadingKey === paymentKey ? 'Cargando...' : 'Ver soporte de pago'}
              </button>
            ) : (
              <p className="inc-detail-note">El paciente no ha cargado soporte de pago.</p>
            )}
          </section>

          <section className="inc-detail-block">
            <h4>Comisión de la plataforma</h4>
            {hasCommission ? (
              <>
                <dl>
                  <div><dt>Estado</dt><dd>{COMMISSION_LABEL[a.commission_status] || a.commission_status}</dd></div>
                  <div><dt>Monto</dt><dd>{formatCurrency(commissionOf(a))}</dd></div>
                  <div><dt>Referencia</dt><dd>{a.commission_reference || 'Sin referencia'}</dd></div>
                  <div><dt>Cita</dt><dd>{a.status.replace('_', ' ')}</dd></div>
                </dl>
                {a.commission_review_note && <p className="inc-detail-alert" role="note">Comprobante rechazado: {a.commission_review_note}</p>}
                {a.commission_proof_path ? (
                  <button type="button" className="inc-proof-btn" disabled={loadingKey === commissionKey} onClick={() => onProof('commission-proofs', a.commission_proof_path as string, commissionKey)}>
                    {loadingKey === commissionKey ? 'Cargando...' : 'Ver soporte de comisión'}
                  </button>
                ) : (
                  <p className="inc-detail-note">Aún no has reportado el pago de esta comisión.</p>
                )}
              </>
            ) : (
              <p className="inc-detail-note">Esta cita no genera comisión.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

interface IncomeModuleProps {
  appointments: IncomeAppointment[];
  psychologistName?: string;
  onMenu: () => void;
}

export function IncomeModule({ appointments, psychologistName, onMenu }: IncomeModuleProps) {
  const [view, setView] = useState<View>('resumen');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [period, setPeriod] = useState<Period>('todo');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [patient, setPatient] = useState('all');
  const [payFilter, setPayFilter] = useState<'all' | PaymentState>('all');
  const [commFilter, setCommFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState<string | null>(null);
  const [proofError, setProofError] = useState('');

  const patients = useMemo(() => {
    const map = new Map<string, string>();
    appointments.forEach((a) => map.set(patientIdOf(a), patientNameOf(a)));
    return [...map.entries()].sort((x, y) => x[1].localeCompare(y[1], 'es'));
  }, [appointments]);

  const rows = useMemo(() => {
    const range = periodRange(period, from, to);
    const term = search.trim().toLowerCase();
    return appointments
      .filter((a) => {
        if (range && (a.appointment_date < range[0] || a.appointment_date > range[1])) return false;
        if (patient !== 'all' && patientIdOf(a) !== patient) return false;
        if (payFilter !== 'all' && paymentStateOf(a) !== payFilter) return false;
        if (commFilter !== 'all' && a.commission_status !== commFilter) return false;
        if (term) {
          const haystack = `${patientNameOf(a)} ${a.payment_reference || ''} ${a.commission_reference || ''}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort((x, y) => `${y.appointment_date}${y.start_time}`.localeCompare(`${x.appointment_date}${x.start_time}`));
  }, [appointments, period, from, to, patient, payFilter, commFilter, search]);

  const totals = useMemo(() => summarize(rows), [rows]);

  const groups = useMemo(() => buildGroups(rows), [rows]);

  const filterLines = useMemo(() => {
    const lines: string[] = [];
    const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label;
    if (period === 'rango') lines.push(`Periodo: ${from ? formatDate(from) : 'inicio'} a ${to ? formatDate(to) : 'hoy'}`);
    else if (period !== 'todo' && periodLabel) lines.push(`Periodo: ${periodLabel}`);
    if (patient !== 'all') lines.push(`Paciente: ${patients.find(([id]) => id === patient)?.[1] || ''}`);
    if (payFilter !== 'all') lines.push(`Pago: ${PAYMENT_LABEL[payFilter]}`);
    if (commFilter !== 'all') lines.push(`Comisión: ${COMMISSION_LABEL[commFilter] || commFilter}`);
    if (search.trim()) lines.push(`Búsqueda: ${search.trim()}`);
    return lines;
  }, [period, from, to, patient, payFilter, commFilter, search, patients]);

  const downloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const { generateIncomeReportPdf } = await import('./incomeReportPdf');
      generateIncomeReportPdf({ rows, psychologistName: psychologistName || 'Psicólogo', filterLines });
    } catch {
      setProofError('No se pudo generar el PDF. Inténtalo de nuevo.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const hasFilters = period !== 'todo' || patient !== 'all' || payFilter !== 'all' || commFilter !== 'all' || search.trim() !== '';

  const resetFilters = () => {
    setPeriod('todo'); setFrom(''); setTo('');
    setPatient('all'); setPayFilter('all'); setCommFilter('all'); setSearch('');
    setVisible(PAGE_SIZE);
  };

  const applyCard = (pay: 'all' | PaymentState, comm: string) => {
    setPayFilter(pay);
    setCommFilter(comm);
    setView('movimientos');
    setVisible(PAGE_SIZE);
  };

  const openRange = (start: string, end: string) => {
    setPeriod('rango'); setFrom(start); setTo(end);
    setView('movimientos');
    setVisible(PAGE_SIZE);
  };

  const openProof = async (bucket: ProofBucket, path: string, key: string) => {
    setProofLoading(key);
    setProofError('');
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
    setProofLoading(null);
    if (error || !data?.signedUrl) {
      setProofError('No se pudo cargar el soporte. Inténtalo de nuevo.');
      return;
    }
    setProofUrl(data.signedUrl);
  };

  const renderRow = (a: IncomeAppointment) => (
    <MovementRow
      key={a.id}
      appointment={a}
      expanded={expandedId === a.id}
      loadingKey={proofLoading}
      onToggle={() => setExpandedId(expandedId === a.id ? null : a.id)}
      onProof={openProof}
    />
  );

  const renderEmpty = (text: string) => <div className="psy-dash-empty"><p>{text}</p></div>;

  const renderPeriodTable = (kind: 'pacientes' | 'meses' | 'semanas') => {
    const list = groups[kind];
    if (list.length === 0) return renderEmpty('No hay movimientos para los filtros seleccionados.');
    const maxPaid = Math.max(...list.map((g) => g.totals.paid), 1);
    const firstColumn = kind === 'pacientes' ? 'Paciente' : kind === 'meses' ? 'Mes' : 'Semana';
    return (
      <div className="inc-table-wrap">
        <table className="inc-table">
          <thead>
            <tr>
              <th scope="col">{firstColumn}</th>
              <th scope="col" className="inc-num">Citas</th>
              <th scope="col" className="inc-num">Cobrado</th>
              <th scope="col" className="inc-num">Por verificar</th>
              <th scope="col" className="inc-num">Sin pago</th>
              <th scope="col" className="inc-num">Comisión pagada</th>
              <th scope="col" className="inc-num">Comisión pendiente</th>
              <th scope="col" className="inc-num">Neto</th>
            </tr>
          </thead>
          <tbody>
            {list.map((g) => {
              const label = kind === 'pacientes' ? patientNameOf(g.rows[0]) : kind === 'meses' ? monthLabel(g.key) : weekLabel(g.key);
              const open = () => {
                if (kind === 'pacientes') { setPatient(g.key); setView('movimientos'); setVisible(PAGE_SIZE); return; }
                if (kind === 'meses') {
                  const [y, m] = g.key.split('-').map(Number);
                  openRange(toKey(new Date(y, m - 1, 1)), toKey(new Date(y, m, 0)));
                  return;
                }
                const end = parseKey(g.key);
                end.setDate(end.getDate() + 6);
                openRange(g.key, toKey(end));
              };
              return (
                <tr key={g.key}>
                  <th scope="row">
                    <button type="button" className="inc-link" onClick={open} title="Ver movimientos">{label}</button>
                    <span className="inc-bar" aria-hidden="true"><span style={{ width: `${Math.round((g.totals.paid / maxPaid) * 100)}%` }} /></span>
                  </th>
                  <td className="inc-num">{g.totals.count}</td>
                  <td className="inc-num inc-amount--paid">{formatCurrency(g.totals.paid)}</td>
                  <td className="inc-num">{formatCurrency(g.totals.verify)}</td>
                  <td className="inc-num">{formatCurrency(g.totals.unpaid)}</td>
                  <td className="inc-num">{formatCurrency(g.totals.commPaid)}</td>
                  <td className="inc-num">{formatCurrency(g.totals.commPending + g.totals.commReview)}</td>
                  <td className="inc-num"><strong>{formatCurrency(g.totals.net)}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCommissions = () => {
    const sections = [
      { key: 'verificada', title: 'Comisiones pagadas', hint: 'Verificadas por la plataforma', total: totals.commPaid },
      { key: 'reportada', title: 'Comisiones en revisión', hint: 'Comprobante enviado, esperando verificación', total: totals.commReview },
      { key: 'pendiente', title: 'Comisiones por pagar', hint: 'Aún no has reportado la transferencia', total: totals.commPending },
    ];
    return (
      <div className="inc-commissions">
        {sections.map((section) => {
          const list = rows.filter((a) => a.commission_status === section.key);
          return (
            <section key={section.key} className="inc-comm-section">
              <header className="inc-comm-head">
                <div><h3>{section.title}</h3><small>{section.hint}</small></div>
                <div className="inc-comm-total"><strong>{formatCurrency(section.total)}</strong><small>{list.length} {list.length === 1 ? 'movimiento' : 'movimientos'}</small></div>
              </header>
              {list.length === 0 ? <p className="inc-comm-empty">Sin movimientos en esta categoría.</p> : <div className="inc-list">{list.map(renderRow)}</div>}
            </section>
          );
        })}
      </div>
    );
  };

  return (
    <section className="psy-income-page inc-page">
      <DashboardModuleHeader
        title="Ingresos"
        subtitle="Pagos de pacientes, comisiones y soportes en un solo lugar."
        onMenu={onMenu}
        action={
          <div className="inc-export-group">
            <button type="button" className="inc-export-btn inc-export-btn--primary" onClick={downloadPdf} disabled={rows.length === 0 || generatingPdf} aria-label="Descargar informe en PDF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
              {generatingPdf ? 'Generando...' : 'PDF'}
            </button>
            <button type="button" className="inc-export-btn" onClick={() => downloadReport(rows)} disabled={rows.length === 0} aria-label="Descargar movimientos en CSV">CSV</button>
          </div>
        }
      />

      <div className="inc-scroll">
        <div className="inc-stats-group" aria-label="Pagos de pacientes">
          <button type="button" className="inc-stat inc-stat--paid" onClick={() => applyCard('pagado', 'all')}>
            <span>Cobrado</span><strong>{formatCurrency(totals.paid)}</strong><small>{totals.paidCount} pagos</small>
          </button>
          <button type="button" className="inc-stat inc-stat--verify" onClick={() => applyCard('por_verificar', 'all')}>
            <span>Por verificar</span><strong>{formatCurrency(totals.verify)}</strong><small>{totals.verifyCount} con soporte</small>
          </button>
          <button type="button" className="inc-stat" onClick={() => applyCard('sin_pago', 'all')}>
            <span>Sin pago</span><strong>{formatCurrency(totals.unpaid)}</strong><small>{totals.unpaidCount} citas</small>
          </button>
          <div className="inc-stat inc-stat--net">
            <span>Neto estimado</span><strong>{formatCurrency(totals.net)}</strong><small>Cobrado menos comisión</small>
          </div>
        </div>
        <div className="inc-stats-group" aria-label="Comisiones">
          <button type="button" className="inc-stat inc-stat--paid" onClick={() => applyCard('all', 'verificada')}>
            <span>Comisión pagada</span><strong>{formatCurrency(totals.commPaid)}</strong><small>{totals.commPaidCount} verificadas</small>
          </button>
          <button type="button" className="inc-stat inc-stat--verify" onClick={() => applyCard('all', 'reportada')}>
            <span>Comisión en revisión</span><strong>{formatCurrency(totals.commReview)}</strong><small>{totals.commReviewCount} reportadas</small>
          </button>
          <button type="button" className="inc-stat inc-stat--due" onClick={() => applyCard('all', 'pendiente')}>
            <span>Comisión por pagar</span><strong>{formatCurrency(totals.commPending)}</strong><small>{totals.commPendingCount} pendientes</small>
          </button>
        </div>

        <div className="inc-filters">
          <label>Periodo
            <select value={period} onChange={(e) => { setPeriod(e.target.value as Period); setVisible(PAGE_SIZE); }}>
              {PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          {period === 'rango' && (
            <>
              <label>Desde<input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></label>
              <label>Hasta<input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></label>
            </>
          )}
          <label>Paciente
            <select value={patient} onChange={(e) => { setPatient(e.target.value); setVisible(PAGE_SIZE); }}>
              <option value="all">Todos los pacientes</option>
              {patients.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <label>Estado del pago
            <select value={payFilter} onChange={(e) => { setPayFilter(e.target.value as 'all' | PaymentState); setVisible(PAGE_SIZE); }}>
              <option value="all">Todos</option>
              <option value="pagado">Pagados por el paciente</option>
              <option value="por_verificar">Por verificar</option>
              <option value="sin_pago">Sin pago</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </label>
          <label>Comisión
            <select value={commFilter} onChange={(e) => { setCommFilter(e.target.value); setVisible(PAGE_SIZE); }}>
              <option value="all">Todas</option>
              <option value="verificada">Pagadas</option>
              <option value="reportada">En revisión</option>
              <option value="pendiente">Por pagar</option>
              <option value="no_aplica">Sin comisión</option>
            </select>
          </label>
          <label className="inc-filter-search">Buscar
            <input type="search" value={search} placeholder="Paciente o referencia" onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }} />
          </label>
          {hasFilters && <button type="button" className="inc-reset-btn" onClick={resetFilters}>Limpiar filtros</button>}
        </div>

        <div className="inc-tabs" role="tablist" aria-label="Vistas del informe">
          {VIEW_OPTIONS.map((o) => (
            <button key={o.value} type="button" role="tab" aria-selected={view === o.value} className={`inc-tab${view === o.value ? ' inc-tab--active' : ''}`} onClick={() => setView(o.value)}>{o.label}</button>
          ))}
        </div>

        {proofError && <p className="inc-error" role="alert">{proofError}</p>}

        <div className="inc-content" role="tabpanel">
          {appointments.length === 0 ? renderEmpty('Aún no tienes movimientos registrados.') : view === 'resumen' ? (
            rows.length === 0 ? renderEmpty('No hay movimientos para los filtros seleccionados.') : (
              <IncomeCharts
                totals={totals}
                months={groups.meses}
                patients={groups.pacientes}
                onPatient={(id) => { setPatient(id); setView('movimientos'); setVisible(PAGE_SIZE); }}
              />
            )
          ) : view === 'movimientos' ? (
            rows.length === 0 ? renderEmpty('No hay movimientos para los filtros seleccionados.') : (
              <>
                <p className="inc-count">Mostrando {Math.min(visible, rows.length)} de {rows.length} movimientos</p>
                <div className="inc-list">{rows.slice(0, visible).map(renderRow)}</div>
                {visible < rows.length && (
                  <button type="button" className="inc-more-btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Ver más movimientos</button>
                )}
              </>
            )
          ) : view === 'comisiones' ? renderCommissions() : renderPeriodTable(view)}
        </div>
      </div>

      {proofUrl && createPortal(
        <div className="psy-proof-overlay" onClick={() => setProofUrl(null)}>
          <div className="psy-proof-modal" role="dialog" aria-modal="true" aria-label="Soporte de pago" onClick={(e) => e.stopPropagation()}>
            <div className="psy-proof-head">
              <strong>Soporte de pago</strong>
              <button type="button" className="psy-proof-close" onClick={() => setProofUrl(null)} aria-label="Cerrar soporte">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="psy-proof-body">
              <img
                src={proofUrl}
                alt="Soporte de pago"
                className="psy-proof-img"
                onError={() => { setProofUrl(null); setProofError('No se pudo mostrar la imagen del soporte.'); }}
              />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
