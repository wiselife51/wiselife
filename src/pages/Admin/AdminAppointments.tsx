import React, { useMemo, useState } from 'react';
import {
  AdminAppointment,
  AdminData,
  AppointmentStatus,
  STATUS_META,
  deleteAppointment,
  formatCurrency,
  formatDate,
  formatTime,
  setAppointmentsStatus,
} from './adminData';
import { Avatar, ConfirmDialog, ErrorNote, Modal } from './AdminUi';

interface ListProps {
  data: AdminData;
  rows: AdminAppointment[];
  reload: () => void;
  emptyText: string;
  showPsychologist?: boolean;
  showPatient?: boolean;
}

const STATUS_ACTIONS: { status: AppointmentStatus; label: string }[] = [
  { status: 'confirmada', label: 'Confirmar' },
  { status: 'completada', label: 'Completada' },
  { status: 'no_asistio', label: 'No asistió' },
];

export const AppointmentsList: React.FC<ListProps> = ({
  data,
  rows,
  reload,
  emptyText,
  showPsychologist = true,
  showPatient = true,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<'cancel' | 'delete' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const psychologistById = useMemo(() => new Map(data.psychologists.map((p) => [p.id, p])), [data.psychologists]);
  const profileById = useMemo(() => new Map(data.profiles.map((p) => [p.id, p])), [data.profiles]);

  const selected = rows.find((a) => a.id === selectedId) ?? null;
  const selectedPsy = selected ? psychologistById.get(selected.psychologist_id) : undefined;
  const selectedPatient = selected ? profileById.get(selected.patient_id) : undefined;

  const close = () => {
    setSelectedId(null);
    setConfirming(null);
    setError('');
  };

  const changeStatus = async (status: AppointmentStatus) => {
    if (!selected) return;
    setBusy(true);
    setError('');
    const message = await setAppointmentsStatus([selected.id], status);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    setConfirming(null);
    reload();
  };

  const remove = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    const message = await deleteAppointment(selected.id);
    setBusy(false);
    if (message) {
      setError(message);
      setConfirming(null);
      return;
    }
    close();
    reload();
  };

  if (rows.length === 0) {
    return (
      <div className="psy-dash-empty">
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <>
      <div className="adm-list">
        {rows.map((a) => {
          const psy = psychologistById.get(a.psychologist_id);
          const patient = profileById.get(a.patient_id);
          const meta = STATUS_META[a.status];
          const primary = showPatient ? patient?.full_name || 'Paciente' : psy?.full_name || 'Psicólogo';
          const secondary = [
            showPatient && showPsychologist ? `con ${psy?.full_name || 'Psicólogo'}` : '',
            `${formatDate(a.appointment_date)} · ${formatTime(a.start_time)}`,
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <button key={a.id} type="button" className="adm-card" onClick={() => setSelectedId(a.id)}>
              <Avatar
                url={showPatient ? patient?.avatar_url : psy?.avatar_url}
                name={primary}
              />
              <span className="adm-card-text">
                <strong>{primary}</strong>
                <small>{secondary}</small>
              </span>
              <span className={`psy-dash-mini-status psy-dash-mini-status--${meta.badge}`}>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {selected && !confirming && (
        <Modal
          title={selectedPatient?.full_name || 'Cita'}
          subtitle={`${formatDate(selected.appointment_date)} · ${formatTime(selected.start_time)} - ${formatTime(selected.end_time)}`}
          onClose={close}
        >
          <dl className="adm-facts">
            <div><dt>Estado</dt><dd>{STATUS_META[selected.status].label}</dd></div>
            <div><dt>Paciente</dt><dd>{selectedPatient?.full_name || '—'}</dd></div>
            <div><dt>Correo paciente</dt><dd>{selectedPatient?.email || '—'}</dd></div>
            <div><dt>Psicólogo</dt><dd>{selectedPsy?.full_name || '—'}</dd></div>
            <div><dt>Modalidad</dt><dd>{selected.modality || '—'}</dd></div>
            <div><dt>Tipo de paciente</dt><dd>{selected.patient_type?.replace('_', ' ') || '—'}</dd></div>
            <div><dt>Pago</dt><dd>{selected.payment_status || '—'} · {formatCurrency(selected.payment_amount)}</dd></div>
            <div><dt>Método de pago</dt><dd>{selected.payment_method || '—'}</dd></div>
          </dl>
          {selected.notes && <p className="adm-note">{selected.notes}</p>}
          <ErrorNote message={error} />

          <div className="adm-actions adm-actions--wrap">
            {STATUS_ACTIONS.filter((s) => s.status !== selected.status).map((s) => (
              <button key={s.status} type="button" className="psy-dash-btn-outline" disabled={busy} onClick={() => changeStatus(s.status)}>
                {s.label}
              </button>
            ))}
            {selected.status !== 'cancelada' && (
              <button type="button" className="adm-btn adm-btn--danger" disabled={busy} onClick={() => setConfirming('cancel')}>
                Cancelar cita
              </button>
            )}
            <button type="button" className="adm-btn adm-btn--ghost-danger" disabled={busy} onClick={() => setConfirming('delete')}>
              Eliminar
            </button>
          </div>
        </Modal>
      )}

      {selected && confirming === 'cancel' && (
        <ConfirmDialog
          title="Cancelar cita"
          message={`Se cancelará la cita de ${selectedPatient?.full_name || 'el paciente'} del ${formatDate(selected.appointment_date)} a las ${formatTime(selected.start_time)}. El horario volverá a quedar disponible.`}
          confirmLabel="Sí, cancelar"
          busy={busy}
          onConfirm={() => changeStatus('cancelada')}
          onCancel={() => setConfirming(null)}
        />
      )}

      {selected && confirming === 'delete' && (
        <ConfirmDialog
          title="Eliminar cita"
          message="La cita se eliminará de forma permanente y no se podrá recuperar."
          confirmLabel="Eliminar definitivamente"
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirming(null)}
        />
      )}
    </>
  );
};
