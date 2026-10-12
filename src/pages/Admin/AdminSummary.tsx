import React, { useMemo } from 'react';
import type { AdminTab } from './Admin';
import { AdminData, isUpcoming, todayKey } from './adminData';

interface Props {
  data: AdminData;
  onNavigate: (tab: AdminTab) => void;
}

const AdminSummary: React.FC<Props> = ({ data, onNavigate }) => {
  const stats = useMemo(() => {
    const today = todayKey();
    const excluded = new Set([...data.psychologists.map((p) => p.user_id), ...data.adminIds]);
    return [
      { tab: 'pacientes' as AdminTab, label: 'Pacientes', value: data.profiles.filter((p) => !excluded.has(p.id)).length },
      {
        tab: 'psicologos' as AdminTab,
        label: 'Psicólogos aprobados',
        value: data.psychologists.filter((p) => p.verification_status === 'approved').length,
      },
      { tab: 'citas' as AdminTab, label: 'Citas próximas', value: data.appointments.filter((a) => isUpcoming(a, today)).length },
      {
        tab: 'psicologos' as AdminTab,
        label: 'Verificaciones pendientes',
        value: data.psychologists.filter((p) => p.verification_status === 'submitted').length,
      },
      {
        tab: 'comisiones' as AdminTab,
        label: 'Comisiones por revisar',
        value: data.appointments.filter((a) => a.commission_status === 'reportada').length,
      },
      { tab: 'citas' as AdminTab, label: 'Citas totales', value: data.appointments.length },
    ];
  }, [data]);

  return (
    <div className="psy-patients-scroll">
      <div className="adm-stats">
        {stats.map((s) => (
          <button key={s.label} type="button" className="adm-stat" onClick={() => onNavigate(s.tab)}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminSummary;
