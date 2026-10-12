import React, { useMemo, useState } from 'react';
import {
  isUpcoming,
  sortByDateAsc,
  sortByDateDesc,
  todayKey,
} from './adminData';
import type { AdminData, AppointmentStatus } from './adminData';
import { AppointmentsList } from './AdminAppointments';
import { FilterChips, SearchInput } from './AdminUi';

type Filter = 'proximas' | 'todas' | AppointmentStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'proximas', label: 'Próximas' },
  { key: 'pendiente_pago', label: 'Pendientes de pago' },
  { key: 'confirmada', label: 'Confirmadas' },
  { key: 'completada', label: 'Completadas' },
  { key: 'cancelada', label: 'Canceladas' },
  { key: 'no_asistio', label: 'No asistió' },
  { key: 'todas', label: 'Todas' },
];

interface Props {
  data: AdminData;
  reload: () => void;
}

const AdminCitas: React.FC<Props> = ({ data, reload }) => {
  const [filter, setFilter] = useState<Filter>('proximas');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const today = todayKey();
    const patientName = new Map(data.profiles.map((p) => [p.id, (p.full_name || '').toLowerCase()]));
    const psyName = new Map(data.psychologists.map((p) => [p.id, p.full_name.toLowerCase()]));
    const term = query.trim().toLowerCase();

    const filtered = data.appointments.filter((a) => {
      if (filter === 'proximas' && !isUpcoming(a, today)) return false;
      if (filter !== 'proximas' && filter !== 'todas' && a.status !== filter) return false;
      if (!term) return true;
      return (
        (patientName.get(a.patient_id) || '').includes(term) ||
        (psyName.get(a.psychologist_id) || '').includes(term)
      );
    });

    return filtered.sort(filter === 'proximas' ? sortByDateAsc : sortByDateDesc);
  }, [data, filter, query]);

  return (
    <>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar por paciente o psicólogo" />
      <FilterChips options={FILTERS} value={filter} onChange={setFilter} label="Filtrar citas" />
      <div className="psy-patients-scroll">
        <AppointmentsList data={data} rows={rows} reload={reload} emptyText="No hay citas con este filtro." />
      </div>
    </>
  );
};

export default AdminCitas;
