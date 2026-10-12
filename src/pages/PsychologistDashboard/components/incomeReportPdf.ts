import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  COMMISSION_LABEL,
  PAYMENT_LABEL,
  amountOf,
  buildGroups,
  commissionOf,
  formatDate,
  formatHour,
  monthLabel,
  parseKey,
  patientNameOf,
  paymentStateOf,
  summarize,
  toKey,
  weekLabel,
  type IncomeAppointment,
} from './incomeUtils';

export interface IncomeReportInput {
  rows: IncomeAppointment[];
  psychologistName: string;
  filterLines: string[];
}

type Rgb = [number, number, number];

const COLORS = {
  primary: [96, 58, 168] as Rgb,
  primarySoft: [237, 230, 250] as Rgb,
  paid: [30, 150, 108] as Rgb,
  verify: [214, 150, 10] as Rgb,
  unpaid: [150, 156, 170] as Rgb,
  commission: [138, 92, 246] as Rgb,
  text: [32, 36, 48] as Rgb,
  muted: [105, 112, 128] as Rgb,
  line: [220, 223, 232] as Rgb,
  card: [247, 248, 252] as Rgb,
};

const PAGE_MARGIN = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - 18;

const money = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .format(value)
    .replace(/\s/g, ' ');

const compact = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')} M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} mil`;
  return String(Math.round(value));
};

const percent = (part: number, total: number) => (total > 0 ? `${Math.round((part / total) * 100)}%` : '0%');

const shortMonth = (monthKey: string) => {
  const [y, m] = monthKey.split('-').map(Number);
  const name = new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  return `${name} ${String(y).slice(2)}`;
};

const cleanWeekLabel = (key: string) => weekLabel(key).replace('–', '-');

const truncate = (doc: jsPDF, text: string, maxWidth: number) => {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && doc.getTextWidth(`${out}...`) > maxWidth) out = out.slice(0, -1);
  return `${out}...`;
};

export function generateIncomeReportPdf({ rows, psychologistName, filterLines }: IncomeReportInput) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const totals = summarize(rows);
  const groups = buildGroups(rows);
  let y = 0;

  const setText = (color: Rgb) => doc.setTextColor(color[0], color[1], color[2]);
  const setFill = (color: Rgb) => doc.setFillColor(color[0], color[1], color[2]);
  const setDraw = (color: Rgb) => doc.setDrawColor(color[0], color[1], color[2]);

  const ensureSpace = (height: number) => {
    if (y + height > BOTTOM_LIMIT) {
      doc.addPage();
      y = 20;
    }
  };

  const sectionTitle = (title: string, hint?: string) => {
    ensureSpace(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    setText(COLORS.primary);
    doc.text(title, PAGE_MARGIN, y);
    y += 1.8;
    setDraw(COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
    y += 5;
    if (hint) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setText(COLORS.muted);
      doc.text(hint, PAGE_MARGIN, y);
      y += 5;
    }
  };

  const generatedAt = new Date().toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
  const dates = rows.map((a) => a.appointment_date).sort();
  const coverage = dates.length ? `${formatDate(dates[0])} al ${formatDate(dates[dates.length - 1])}` : 'Sin movimientos';

  setFill(COLORS.primary);
  doc.rect(0, 0, PAGE_WIDTH, 34, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('Informe de ingresos', PAGE_MARGIN, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(psychologistName, PAGE_MARGIN, 22);
  doc.setFontSize(8);
  doc.text(`Generado el ${generatedAt}`, PAGE_MARGIN, 28);
  doc.text('WiseLife', PAGE_WIDTH - PAGE_MARGIN, 15, { align: 'right' });
  doc.text(`Cobertura: ${coverage}`, PAGE_WIDTH - PAGE_MARGIN, 28, { align: 'right' });
  y = 42;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(COLORS.muted);
  const filtersText = filterLines.length ? `Filtros aplicados: ${filterLines.join('  |  ')}` : 'Filtros aplicados: ninguno (historial completo)';
  const wrappedFilters = doc.splitTextToSize(`${filtersText}  |  ${rows.length} movimientos`, CONTENT_WIDTH) as string[];
  doc.text(wrappedFilters, PAGE_MARGIN, y);
  y += wrappedFilters.length * 4 + 3;

  const kpi = (x: number, width: number, label: string, value: string, note: string, color: Rgb) => {
    setFill(COLORS.card);
    setDraw(COLORS.line);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, width, 20, 2, 2, 'FD');
    setFill(color);
    doc.rect(x, y + 2, 1.2, 16, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setText(COLORS.muted);
    doc.text(label, x + 4, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setText(color);
    doc.text(truncate(doc, value, width - 6), x + 4, y + 12.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setText(COLORS.muted);
    doc.text(note, x + 4, y + 17);
  };

  sectionTitle('Resumen general');
  const gap = 3;
  const w4 = (CONTENT_WIDTH - gap * 3) / 4;
  kpi(PAGE_MARGIN, w4, 'Cobrado', money(totals.paid), `${totals.paidCount} pagos`, COLORS.paid);
  kpi(PAGE_MARGIN + (w4 + gap), w4, 'Por verificar', money(totals.verify), `${totals.verifyCount} con soporte`, COLORS.verify);
  kpi(PAGE_MARGIN + (w4 + gap) * 2, w4, 'Sin pago', money(totals.unpaid), `${totals.unpaidCount} citas`, COLORS.unpaid);
  kpi(PAGE_MARGIN + (w4 + gap) * 3, w4, 'Neto estimado', money(totals.net), 'Cobrado menos comisión', COLORS.primary);
  y += 23;
  const w3 = (CONTENT_WIDTH - gap * 2) / 3;
  kpi(PAGE_MARGIN, w3, 'Comisión pagada', money(totals.commPaid), `${totals.commPaidCount} verificadas`, COLORS.paid);
  kpi(PAGE_MARGIN + (w3 + gap), w3, 'Comisión en revisión', money(totals.commReview), `${totals.commReviewCount} reportadas`, COLORS.verify);
  kpi(PAGE_MARGIN + (w3 + gap) * 2, w3, 'Comisión por pagar', money(totals.commPending), `${totals.commPendingCount} pendientes`, COLORS.commission);
  y += 28;

  const stackedBar = (title: string, segments: { label: string; value: number; color: Rgb }[]) => {
    ensureSpace(24);
    const total = segments.reduce((sum, s) => sum + s.value, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setText(COLORS.text);
    doc.text(title, PAGE_MARGIN, y);
    y += 3;
    setFill(COLORS.line);
    doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 5, 1.5, 1.5, 'F');
    if (total > 0) {
      let cursor = PAGE_MARGIN;
      segments.forEach((s) => {
        const width = (s.value / total) * CONTENT_WIDTH;
        if (width <= 0) return;
        setFill(s.color);
        doc.rect(cursor, y, width, 5, 'F');
        cursor += width;
      });
    }
    y += 10;
    const colWidth = CONTENT_WIDTH / segments.length;
    segments.forEach((s, i) => {
      const x = PAGE_MARGIN + colWidth * i;
      setFill(s.color);
      doc.rect(x, y - 2.4, 2.6, 2.6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setText(COLORS.text);
      doc.text(`${s.label}: ${money(s.value)} (${percent(s.value, total)})`, x + 4, y);
    });
    y += 8;
  };

  sectionTitle('Distribución de pagos y comisiones');
  stackedBar('Estado de los pagos de pacientes (por monto)', [
    { label: 'Cobrado', value: totals.paid, color: COLORS.paid },
    { label: 'Por verificar', value: totals.verify, color: COLORS.verify },
    { label: 'Sin pago', value: totals.unpaid, color: COLORS.unpaid },
  ]);
  stackedBar('Estado de las comisiones de la plataforma (por monto)', [
    { label: 'Pagada', value: totals.commPaid, color: COLORS.paid },
    { label: 'En revisión', value: totals.commReview, color: COLORS.verify },
    { label: 'Por pagar', value: totals.commPending, color: COLORS.commission },
  ]);

  const months = [...groups.meses].reverse().slice(-12);
  if (months.length > 0) {
    const chartHeight = 48;
    ensureSpace(chartHeight + 26);
    sectionTitle('Evolución mensual', 'Cobrado, por verificar y comisión pagada por mes (últimos 12 meses del periodo).');
    const axisWidth = 14;
    const plotX = PAGE_MARGIN + axisWidth;
    const plotWidth = CONTENT_WIDTH - axisWidth;
    const plotBottom = y + chartHeight;
    const maxValue = Math.max(...months.flatMap((g) => [g.totals.paid, g.totals.verify, g.totals.commPaid]), 1);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    for (let i = 0; i <= 4; i += 1) {
      const gy = plotBottom - (chartHeight / 4) * i;
      setDraw(COLORS.line);
      doc.setLineWidth(0.15);
      doc.line(plotX, gy, PAGE_WIDTH - PAGE_MARGIN, gy);
      setText(COLORS.muted);
      doc.text(compact((maxValue / 4) * i), plotX - 2, gy + 1, { align: 'right' });
    }

    const slot = plotWidth / months.length;
    const barWidth = Math.min(slot * 0.26, 6);
    months.forEach((g, i) => {
      const center = plotX + slot * i + slot / 2;
      const series: [number, Rgb][] = [
        [g.totals.paid, COLORS.paid],
        [g.totals.verify, COLORS.verify],
        [g.totals.commPaid, COLORS.commission],
      ];
      series.forEach(([value, color], idx) => {
        const h = (value / maxValue) * chartHeight;
        if (h <= 0) return;
        setFill(color);
        doc.rect(center - barWidth * 1.5 + barWidth * idx, plotBottom - h, barWidth, h, 'F');
      });
      setText(COLORS.muted);
      doc.setFontSize(6.5);
      doc.text(shortMonth(g.key), center, plotBottom + 4, { align: 'center' });
    });

    y = plotBottom + 9;
    const legend: [string, Rgb][] = [['Cobrado', COLORS.paid], ['Por verificar', COLORS.verify], ['Comisión pagada', COLORS.commission]];
    let lx = plotX;
    legend.forEach(([label, color]) => {
      setFill(color);
      doc.rect(lx, y - 2.3, 2.6, 2.6, 'F');
      setText(COLORS.text);
      doc.setFontSize(7.5);
      doc.text(label, lx + 4, y);
      lx += 34;
    });
    y += 8;
  }

  const topPatients = groups.pacientes.filter((g) => g.totals.paid > 0).slice(0, 8);
  if (topPatients.length > 0) {
    ensureSpace(topPatients.length * 7 + 18);
    sectionTitle('Pacientes con mayor aporte', 'Monto cobrado por paciente en el periodo.');
    const maxPaid = Math.max(...topPatients.map((g) => g.totals.paid), 1);
    const nameWidth = 52;
    const amountWidth = 30;
    const barMax = CONTENT_WIDTH - nameWidth - amountWidth - 4;
    topPatients.forEach((g) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setText(COLORS.text);
      doc.text(truncate(doc, patientNameOf(g.rows[0]), nameWidth - 2), PAGE_MARGIN, y + 3.4);
      setFill(COLORS.primarySoft);
      doc.roundedRect(PAGE_MARGIN + nameWidth, y, barMax, 4.6, 1, 1, 'F');
      setFill(COLORS.primary);
      doc.roundedRect(PAGE_MARGIN + nameWidth, y, Math.max((g.totals.paid / maxPaid) * barMax, 1.5), 4.6, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(money(g.totals.paid), PAGE_WIDTH - PAGE_MARGIN, y + 3.4, { align: 'right' });
      y += 7;
    });
    y += 3;
  }

  const lastY = () => (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;

  const tableDefaults = {
    theme: 'grid' as const,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 20 },
    styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 1.8, textColor: COLORS.text, lineColor: COLORS.line, lineWidth: 0.15, overflow: 'linebreak' as const },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255] as Rgb, fontStyle: 'bold' as const, halign: 'left' as const },
    alternateRowStyles: { fillColor: COLORS.card },
    foot: undefined,
  };

  const summaryTable = (title: string, hint: string, firstColumn: string, list: typeof groups.meses, labelOf: (g: (typeof groups.meses)[number]) => string) => {
    if (list.length === 0) return;
    ensureSpace(30);
    sectionTitle(title, hint);
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [[firstColumn, 'Citas', 'Cobrado', 'Por verificar', 'Sin pago', 'Com. pagada', 'Com. pendiente', 'Neto']],
      body: list.map((g) => [
        labelOf(g),
        String(g.totals.count),
        money(g.totals.paid),
        money(g.totals.verify),
        money(g.totals.unpaid),
        money(g.totals.commPaid),
        money(g.totals.commPending + g.totals.commReview),
        money(g.totals.net),
      ]),
      foot: [[
        'Total',
        String(totals.count),
        money(totals.paid),
        money(totals.verify),
        money(totals.unpaid),
        money(totals.commPaid),
        money(totals.commPending + totals.commReview),
        money(totals.net),
      ]],
      footStyles: { fillColor: COLORS.primarySoft, textColor: COLORS.primary, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 38 }, 1: { halign: 'right', cellWidth: 12 }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' } },
    });
    y = lastY() + 8;
  };

  summaryTable('Ingresos por mes', 'Totales mensuales de pagos y comisiones.', 'Mes', groups.meses, (g) => monthLabel(g.key));
  summaryTable('Ingresos por paciente', 'Ordenado por monto cobrado.', 'Paciente', groups.pacientes, (g) => patientNameOf(g.rows[0]));
  summaryTable('Ingresos por semana', 'Semanas de lunes a domingo, de la más reciente a la más antigua.', 'Semana', groups.semanas, (g) => cleanWeekLabel(g.key));

  const commissionRows = rows.filter((a) => a.commission_status !== 'no_aplica');
  if (commissionRows.length > 0) {
    const order: Record<string, number> = { verificada: 0, reportada: 1, pendiente: 2 };
    const sorted = [...commissionRows].sort(
      (x, z) => (order[x.commission_status] ?? 3) - (order[z.commission_status] ?? 3) || z.appointment_date.localeCompare(x.appointment_date),
    );
    ensureSpace(30);
    sectionTitle('Movimiento de comisiones', 'Comisiones pagadas, en revisión y por pagar a la plataforma.');
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Estado', 'Fecha', 'Paciente', 'Pago del paciente', 'Comisión', 'Referencia', 'Soporte']],
      body: sorted.map((a) => [
        COMMISSION_LABEL[a.commission_status] || a.commission_status,
        formatDate(a.appointment_date),
        patientNameOf(a),
        money(amountOf(a)),
        money(commissionOf(a)),
        a.commission_reference || '-',
        a.commission_proof_path ? 'Cargado' : 'Sin soporte',
      ]),
      columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.section !== 'body' || data.column.index !== 0) return;
        const status = sorted[data.row.index]?.commission_status;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = status === 'verificada' ? COLORS.paid : status === 'reportada' ? COLORS.verify : COLORS.commission;
      },
    });
    y = lastY() + 8;
  }

  if (rows.length > 0) {
    ensureSpace(30);
    sectionTitle('Detalle de movimientos', 'Cada cita con su estado de pago, comisión y soportes registrados.');
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Fecha', 'Paciente', 'Estado del pago', 'Método', 'Referencia', 'Monto', 'Comisión', 'Soporte pago', 'Soporte com.']],
      body: rows.map((a) => {
        const hasCommission = a.commission_status !== 'no_aplica';
        return [
          `${formatDate(a.appointment_date)} ${formatHour(a.start_time)}`,
          patientNameOf(a),
          PAYMENT_LABEL[paymentStateOf(a)],
          a.payment_method || '-',
          a.payment_reference || '-',
          money(amountOf(a)),
          hasCommission ? money(commissionOf(a)) : '-',
          a.payment_proof_path ? 'Cargado' : 'No',
          hasCommission ? (a.commission_proof_path ? 'Cargado' : 'No') : '-',
        ];
      }),
      styles: { ...tableDefaults.styles, fontSize: 6.8, cellPadding: 1.5 },
      columnStyles: { 5: { halign: 'right' }, 6: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.section !== 'body' || data.column.index !== 2) return;
        const state = paymentStateOf(rows[data.row.index]);
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = state === 'pagado' ? COLORS.paid : state === 'por_verificar' ? COLORS.verify : COLORS.muted;
      },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    setDraw(COLORS.line);
    doc.setLineWidth(0.2);
    doc.line(PAGE_MARGIN, PAGE_HEIGHT - 12, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setText(COLORS.muted);
    doc.text('WiseLife - Informe de ingresos', PAGE_MARGIN, PAGE_HEIGHT - 7.5);
    doc.text(`Página ${page} de ${pageCount}`, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 7.5, { align: 'right' });
  }

  doc.save(`informe-ingresos-${toKey(new Date())}.pdf`);
}

export const periodStartLabel = (key: string) => formatDate(toKey(parseKey(key)));
