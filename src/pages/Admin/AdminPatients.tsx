import React, { useMemo, useState } from 'react';
import {
  formatDate,
  sortByDateDesc,
} from './adminData';
import type { AdminData } from './adminData';
import { AppointmentsList } from './AdminAppointments';
import { Avatar, Modal, SearchInput } from './AdminUi';

interface Props {
  data: AdminData;
  reload: () => void;
}

const AdminPatients: React.FC<Props> = ({ data, reload }) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const patients = useMemo(() => {
    const excluded = new Set([...data.psychologists.map((p) => p.user_id), ...data.adminIds]);
    const term = query.trim().toLowerCase();
    return data.profiles.filter(
      (p) =>
        !excluded.has(p.id) &&
        (!term || (p.full_name || '').toLowerCase().includes(term) || (p.email || '').toLowerCase().includes(term)),
    );
  }, [data, query]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    data.appointments.forEach((a) => map.set(a.patient_id, (map.get(a.patient_id) || 0) + 1));
    return map;
  }, [data.appointments]);

  const selected = data.profiles.find((p) => p.id === selectedId) ?? null;
  const selectedAppointments = useMemo(
    () => data.appointments.filter((a) => a.patient_id === selectedId).sort(sortByDateDesc),
    [data.appointments, selectedId],
  );

  return (
    <>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar paciente por nombre o correo" />
      <div className="psy-patients-scroll">
        {patients.length === 0 ? (
          <div className="psy-dash-empty">
            <p>No se encontraron pacientes.</p>
          </div>
        ) : (
          <div className="adm-list">
            {patients.map((p) => {
              const count = counts.get(p.id) || 0;
              return (
                <button key={p.id} type="button" className="adm-card" onClick={() => setSelectedId(p.id)}>
                  <Avatar url={p.avatar_url} name={p.full_name || p.email} />
                  <span className="adm-card-text">
                    <strong>{p.full_name || 'Sin nombre'}</strong>
                    <small>{p.email || '—'}</small>
                  </span>
                  <span className="adm-count">{count} {count === 1 ? 'cita' : 'citas'}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <Modal title={selected.full_name || 'Paciente'} subtitle={selected.email || undefined} onClose={() => setSelectedId(null)}>
          <dl className="adm-facts">
            <div><dt>Teléfono</dt><dd>{selected.phone || '—'}</dd></div>
            <div><dt>Nacimiento</dt><dd>{formatDate(selected.date_of_birth)}</dd></div>
            <div><dt>Género</dt><dd>{selected.gender || '—'}</dd></div>
            <div><dt>Registro</dt><dd>{formatDate(selected.created_at)}</dd></div>
          </dl>
          <h4 className="adm-subtitle">Citas del paciente</h4>
          <div className="adm-modal-scroll">
            <AppointmentsList
              data={data}
              rows={selectedAppointments}
              reload={reload}
              showPatient={false}
              emptyText="Este paciente aún no tiene citas."
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default AdminPatients;
