import { formatCurrency, monthLabel, patientNameOf, type IncomeGroup, type IncomeTotals } from './incomeUtils';

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface IncomeChartsProps {
  totals: IncomeTotals;
  months: IncomeGroup[];
  patients: IncomeGroup[];
  onPatient: (patientId: string) => void;
}

const COLOR_PAID = '#8ee7c2';
const COLOR_VERIFY = '#ffd45c';
const COLOR_UNPAID = '#7d8597';
const COLOR_COMMISSION = '#c49bff';

const shortMonth = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  const name = new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  return `${name} ${String(y).slice(2)}`;
};

const share = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

function Donut({ title, slices, centerLabel }: { title: string; slices: Slice[]; centerLabel: string }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  let cursor = 0;
  const stops = slices
    .filter((s) => s.value > 0)
    .map((s) => {
      const start = (cursor / total) * 100;
      cursor += s.value;
      return `${s.color} ${start}% ${(cursor / total) * 100}%`;
    });
  const gradient = total > 0 ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(rgba(255,255,255,0.1) 0 100%)';

  return (
    <section className="inc-chart-card">
      <h3>{title}</h3>
      <div className="inc-donut-wrap">
        <div
          className="inc-donut"
          style={{ background: gradient }}
          role="img"
          aria-label={`${title}: ${slices.map((s) => `${s.label} ${formatCurrency(s.value)}`).join(', ')}`}
        >
          <div className="inc-donut-hole">
            <strong>{formatCurrency(total)}</strong>
            <small>{centerLabel}</small>
          </div>
        </div>
        <ul className="inc-legend">
          {slices.map((s) => (
            <li key={s.label}>
              <span className="inc-legend-dot" style={{ background: s.color }} aria-hidden="true" />
              <span className="inc-legend-label">{s.label}</span>
              <span className="inc-legend-value">
                {formatCurrency(s.value)}
                <small>{share(s.value, total)}%</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function IncomeCharts({ totals, months, patients, onPatient }: IncomeChartsProps) {
  const series = [...months].reverse().slice(-12);
  const maxMonth = Math.max(...series.flatMap((g) => [g.totals.paid, g.totals.verify, g.totals.commPaid]), 1);
  const topPatients = patients.filter((g) => g.totals.paid > 0).slice(0, 6);
  const maxPatient = Math.max(...topPatients.map((g) => g.totals.paid), 1);

  return (
    <div className="inc-charts">
      <section className="inc-chart-card inc-chart-card--wide">
        <div className="inc-chart-head">
          <h3>Evolución mensual</h3>
          <ul className="inc-legend inc-legend--inline">
            <li><span className="inc-legend-dot" style={{ background: COLOR_PAID }} aria-hidden="true" />Cobrado</li>
            <li><span className="inc-legend-dot" style={{ background: COLOR_VERIFY }} aria-hidden="true" />Por verificar</li>
            <li><span className="inc-legend-dot" style={{ background: COLOR_COMMISSION }} aria-hidden="true" />Comisión pagada</li>
          </ul>
        </div>
        {series.length === 0 ? (
          <p className="inc-chart-empty">Sin movimientos para graficar.</p>
        ) : (
          <div className="inc-bars-scroll">
            <div className="inc-bars" role="img" aria-label={`Evolución mensual de ingresos, ${series.length} meses`}>
              {series.map((g) => (
                <div key={g.key} className="inc-bars-col" title={`${monthLabel(g.key)} - Cobrado ${formatCurrency(g.totals.paid)}, por verificar ${formatCurrency(g.totals.verify)}, comisión pagada ${formatCurrency(g.totals.commPaid)}`}>
                  <div className="inc-bars-plot">
                    <span className="inc-bar-v" style={{ height: `${Math.max((g.totals.paid / maxMonth) * 100, g.totals.paid > 0 ? 3 : 0)}%`, background: COLOR_PAID }} />
                    <span className="inc-bar-v" style={{ height: `${Math.max((g.totals.verify / maxMonth) * 100, g.totals.verify > 0 ? 3 : 0)}%`, background: COLOR_VERIFY }} />
                    <span className="inc-bar-v" style={{ height: `${Math.max((g.totals.commPaid / maxMonth) * 100, g.totals.commPaid > 0 ? 3 : 0)}%`, background: COLOR_COMMISSION }} />
                  </div>
                  <span className="inc-bars-label">{shortMonth(g.key)}</span>
                  <strong className="inc-bars-value">{formatCurrency(g.totals.paid)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Donut
        title="Estado de los pagos"
        centerLabel="en total"
        slices={[
          { label: 'Cobrado', value: totals.paid, color: COLOR_PAID },
          { label: 'Por verificar', value: totals.verify, color: COLOR_VERIFY },
          { label: 'Sin pago', value: totals.unpaid, color: COLOR_UNPAID },
        ]}
      />
      <Donut
        title="Estado de las comisiones"
        centerLabel="en comisiones"
        slices={[
          { label: 'Pagada', value: totals.commPaid, color: COLOR_PAID },
          { label: 'En revisión', value: totals.commReview, color: COLOR_VERIFY },
          { label: 'Por pagar', value: totals.commPending, color: COLOR_COMMISSION },
        ]}
      />

      <section className="inc-chart-card inc-chart-card--wide">
        <h3>Pacientes con mayor aporte</h3>
        {topPatients.length === 0 ? (
          <p className="inc-chart-empty">Aún no hay pagos cobrados.</p>
        ) : (
          <ul className="inc-hbars">
            {topPatients.map((g) => (
              <li key={g.key}>
                <button type="button" onClick={() => onPatient(g.key)} title="Ver movimientos de este paciente">
                  <span className="inc-hbar-name">{patientNameOf(g.rows[0])}</span>
                  <span className="inc-hbar-track" aria-hidden="true"><span style={{ width: `${Math.max((g.totals.paid / maxPatient) * 100, 3)}%` }} /></span>
                  <strong className="inc-hbar-value">{formatCurrency(g.totals.paid)}</strong>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
