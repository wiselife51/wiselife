import React, { useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  isUpcoming,
  setAppointmentsStatus,
  sortByDateAsc,
  sortByDateDesc,
  todayKey,
  formatDate,
  formatTime,
} from './adminData';
import type { AdminData } from './adminData';
import { AppointmentsList } from './AdminAppointments';
import { Avatar, ConfirmDialog, ErrorNote, FilterChips, SearchInput } from './AdminUi';

type Section = 'proximas' | 'historial' | 'bloqueos';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'proximas', label: 'Próximas' },
  { key: 'historial', label: 'Historial' },
  { key: 'bloqueos', label: 'Bloqueos' },
];

interface Props {
  data: AdminData;
  reload: () => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const AdminAgendas: React.FC<Props> = ({ data, reload, selectedId, onSelect }) => {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<Section>('proximas');
  const [confirmAll, setConfirmAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const today = todayKey();
  const selected = data.psychologists.find((p) => p.id === selectedId) ?? null;

  const upcomingCount = useMemo(() => {
    const counts = new Map<string, number>();
    data.appointments.forEach((a) => {
      if (isUpcoming(a, today)) counts.set(a.psychologist_id, (counts.get(a.psychologist_id) || 0) + 1);
    });
    return counts;
  }, [data.appointments, today]);

  const psychologists = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.psychologists.filter(
      (p) => !term || p.full_name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term),
    );
  }, [data.psychologists, query]);

  const own = useMemo(
    () => data.appointments.filter((a) => a.psychologist_id === selectedId),
    [data.appointments, selectedId],
  );
  const upcoming = useMemo(() => own.filter((a) => isUpcoming(a, today)).sort(sortByDateAsc), [own, today]);
  const history = useMemo(() => own.filter((a) => !isUpcoming(a, today)).sort(sortByDateDesc), [own, today]);
  const blocks = useMemo(() => data.blocks.filter((b) => b.psychologist_id === selectedId), [data.blocks, selectedId]);

  const cancelAll = async () => {
    setBusy(true);
    setError('');
    const message = await setAppointmentsStatus(
      upcoming.map((a) => a.id),
      'cancelada',
    );
    setBusy(false);
    setConfirmAll(false);
    if (message) {
      setError(message);
      return;
    }
    reload();
  };

  const removeBlock = async (id: string) => {
    setError('');
    const { error: deleteError } = await supabase.from('schedule_blocks').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    reload();
  };

  if (!selected) {
    return (
      <>
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar psicólogo para ver su agenda" />
        <div className="psy-patients-scroll">
          {psychologists.length === 0 ? (
            <div className="psy-dash-empty">
              <p>No se encontraron psicólogos.</p>
            </div>
          ) : (
            <div className="adm-list">
              {psychologists.map((p) => {
                const count = upcomingCount.get(p.id) || 0;
                return (
                  <button key={p.id} type="button" className="adm-card" onClick={() => onSelect(p.id)}>
                    <Avatar url={p.avatar_url} name={p.full_name} />
                    <span className="adm-card-text">
                      <strong>{p.full_name}</strong>
                      <small>{p.email}</small>
                    </span>
                    <span className="adm-count">{count} {count === 1 ? 'próxima' : 'próximas'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="adm-toolbar">
        <button type="button" className="psy-dash-btn-outline" onClick={() => onSelect(null)}>
          Volver
        </button>
        <div className="adm-toolbar-copy">
          <strong>{selected.full_name}</strong>
          <small>{upcoming.length} próximas · {blocks.length} bloqueos</small>
        </div>
        {upcoming.length > 0 && (
          <button type="button" className="adm-btn adm-btn--danger" onClick={() => setConfirmAll(true)}>
            Cancelar todas
          </button>
        )}
      </div>
      <FilterChips options={SECTIONS} value={section} onChange={setSection} label="Secciones de la agenda" />
      <ErrorNote message={error} />

      <div className="psy-patients-scroll">
        {section === 'proximas' && (
          <AppointmentsList
            data={data}
            rows={upcoming}
            reload={reload}
            showPsychologist={false}
            emptyText="Este psicólogo no tiene citas próximas."
          />
        )}
        {section === 'historial' && (
          <AppointmentsList
            data={data}
            rows={history}
            reload={reload}
            showPsychologist={false}
            emptyText="Este psicólogo no tiene historial de citas."
          />
        )}
        {section === 'bloqueos' &&
          (blocks.length === 0 ? (
            <div className="psy-dash-empty">
              <p>No hay bloqueos de agenda próximos.</p>
            </div>
          ) : (
            <div className="adm-list">
              {blocks.map((b) => (
                <div key={b.id} className="adm-card adm-card--static">
                  <span className="adm-card-text">
                    <strong>{formatDate(b.block_date)}</strong>
                    <small>
                      {b.start_time ? `${formatTime(b.start_time)} - ${formatTime(b.end_time)}` : 'Todo el día'}
                      {b.reason ? ` · ${b.reason}` : ''}
                    </small>
                  </span>
                  <button type="button" className="adm-btn adm-btn--ghost-danger" onClick={() => removeBlock(b.id)}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          ))}
      </div>

      {confirmAll && (
        <ConfirmDialog
          title="Cancelar agenda próxima"
          message={`Se cancelarán las ${upcoming.length} citas próximas de ${selected.full_name}. Los horarios volverán a quedar disponibles.`}
          confirmLabel="Cancelar todas"
          busy={busy}
          onConfirm={cancelAll}
          onCancel={() => setConfirmAll(false)}
        />
      )}
    </>
  );
};

export default AdminAgendas;
