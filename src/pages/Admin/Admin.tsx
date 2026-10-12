import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { DashboardModuleHeader } from '../PsychologistDashboard/components/DashboardModuleHeader';
import '../PsychologistDashboard/PsychologistDashboard.css';
import './Admin.css';
import { isUpcoming, todayKey, useAdminData } from './adminData';
import AdminCitas from './AdminCitas';
import AdminAgendas from './AdminAgendas';
import AdminPsychologists from './AdminPsychologists';
import AdminPatients from './AdminPatients';
import CommissionReviews from './CommissionReviews';
import AdminSummary from './AdminSummary';

export type AdminTab = 'resumen' | 'citas' | 'agendas' | 'psicologos' | 'pacientes' | 'comisiones';

const TAB_COPY: Record<AdminTab, { title: string; subtitle: string }> = {
  resumen: { title: 'Resumen', subtitle: 'Vista general de la plataforma.' },
  citas: { title: 'Citas', subtitle: 'Consulta, confirma, cancela o elimina cualquier cita.' },
  agendas: { title: 'Agendas', subtitle: 'Revisa y gestiona la agenda de cualquier psicólogo.' },
  psicologos: { title: 'Psicólogos', subtitle: 'Verifica documentos y administra las cuentas.' },
  pacientes: { title: 'Pacientes', subtitle: 'Consulta pacientes y sus citas.' },
  comisiones: { title: 'Comisiones', subtitle: 'Revisa los comprobantes enviados por los psicólogos.' },
};

const NAV_ICONS: Record<AdminTab, React.ReactNode> = {
  resumen: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
  citas: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  agendas: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  psicologos: <><circle cx="12" cy="8" r="3" /><path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" /></>,
  pacientes: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="10" r="2" /><path d="M3 20c.7-3.2 2.7-5 6-5s5.3 1.8 6 5M14 16c2.5-.2 4.5 1.2 5 4" /></>,
  comisiones: <><path d="M3 6h18v12H3z" /><path d="M3 10h18M7 14h3" /></>,
};

const NAV_ORDER: AdminTab[] = ['resumen', 'citas', 'agendas', 'psicologos', 'pacientes', 'comisiones'];

const Admin: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('resumen');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [agendaPsychologistId, setAgendaPsychologistId] = useState<string | null>(null);

  const { data, loading, error, reload } = useAdminData(isAdmin === true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  // El acceso real lo impone la RLS; esto solo evita mostrar una pantalla vacia.
  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_roles')
      .select('role_code')
      .eq('user_id', user.id)
      .eq('role_code', 'admin')
      .maybeSingle()
      .then(({ data: row }) => setIsAdmin(Boolean(row)));
  }, [user]);

  const badges = useMemo(() => {
    const today = todayKey();
    return {
      citas: data.appointments.filter((a) => isUpcoming(a, today)).length,
      psicologos: data.psychologists.filter((p) => p.verification_status === 'submitted').length,
      comisiones: data.appointments.filter((a) => a.commission_status === 'reportada').length,
    } as Partial<Record<AdminTab, number>>;
  }, [data]);

  const goTo = (tab: AdminTab) => {
    setActiveTab(tab);
    if (tab !== 'agendas') setAgendaPsychologistId(null);
    setShowMobileMenu(false);
  };

  const viewAgenda = (psychologistId: string) => {
    setAgendaPsychologistId(psychologistId);
    setActiveTab('agendas');
    setShowMobileMenu(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || isAdmin === null) return null;

  if (!isAdmin) {
    return (
      <div className="adm-denied">
        <h1>Acceso restringido</h1>
        <p>Esta sección es solo para administradores de la plataforma.</p>
        <button type="button" className="psy-dash-btn-primary" onClick={handleSignOut}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  const adminName = data.profiles.find((p) => p.id === user?.id)?.full_name || 'Administrador';
  const copy = TAB_COPY[activeTab];

  return (
    <div className="psy-dash">
      <video className="psy-dash-video" autoPlay loop muted playsInline aria-hidden="true">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="psy-dash-video-overlay" aria-hidden="true" />

      <aside
        className={`psy-dash-sidebar ${showMobileMenu ? 'psy-dash-sidebar--open' : ''}`}
        style={showMobileMenu ? { position: 'fixed', inset: '0 auto 0 0', zIndex: 1000, transform: 'translate3d(0, 0, 0)' } : undefined}
      >
        <div className="psy-dash-sidebar-header">
          <div className="psy-dash-brand">
            <div className="psy-dash-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true">
                <defs>
                  <linearGradient id="admin-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4dd0e1" />
                    <stop offset="50%" stopColor="#42a5f5" />
                    <stop offset="100%" stopColor="#7e57c2" />
                  </linearGradient>
                </defs>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#admin-logo-grad)" />
              </svg>
              <span>Vida Sabia</span>
            </div>
            <div className="psy-dash-badge">Administrador</div>
          </div>
        </div>

        <div className="psy-dash-profile">
          <div className="psy-dash-avatar">
            <span>{adminName.charAt(0)}</span>
          </div>
          <h3 className="psy-dash-name">{adminName}</h3>
          <p className="psy-dash-email">{user?.email}</p>
        </div>

        <nav className="psy-dash-nav">
          {NAV_ORDER.map((tab) => {
            const badge = badges[tab];
            return (
              <button
                key={tab}
                type="button"
                className={`psy-dash-nav-item ${activeTab === tab ? 'psy-dash-nav-item--active' : ''}`}
                onClick={() => goTo(tab)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  {NAV_ICONS[tab]}
                </svg>
                <span>{TAB_COPY[tab].title}</span>
                {badge ? (
                  <span className={`psy-dash-nav-badge ${tab === 'psicologos' || tab === 'comisiones' ? 'psy-dash-nav-badge--warning' : ''}`}>
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <button type="button" className="psy-dash-signout" onClick={handleSignOut}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar sesion</span>
        </button>
      </aside>

      {showMobileMenu && (
        <button type="button" className="psy-mobile-menu-backdrop" aria-label="Cerrar menú" onClick={() => setShowMobileMenu(false)} />
      )}

      <main className="psy-dash-main psy-dash-main--flush">
        <section className="psy-alert-page adm-page">
          <DashboardModuleHeader
            title={copy.title}
            subtitle={copy.subtitle}
            onMenu={() => setShowMobileMenu(!showMobileMenu)}
            menuOpen={showMobileMenu}
          />

          {error && <p className="adm-error" role="alert">{error}</p>}

          {loading ? (
            <p className="adm-muted">Cargando...</p>
          ) : (
            <>
              {activeTab === 'resumen' && <AdminSummary data={data} onNavigate={goTo} />}
              {activeTab === 'citas' && <AdminCitas data={data} reload={reload} />}
              {activeTab === 'agendas' && (
                <AdminAgendas data={data} reload={reload} selectedId={agendaPsychologistId} onSelect={setAgendaPsychologistId} />
              )}
              {activeTab === 'psicologos' && (
                <AdminPsychologists data={data} reload={reload} adminUserId={user?.id ?? ''} onViewAgenda={viewAgenda} />
              )}
              {activeTab === 'pacientes' && <AdminPatients data={data} reload={reload} />}
              {activeTab === 'comisiones' && <CommissionReviews onReviewed={reload} />}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Admin;
