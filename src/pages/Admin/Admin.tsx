import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { DOC_BUCKET } from '../../components/DocumentUpload/DocumentUpload';
import './Admin.css';

type VerificationStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

interface PsychologistRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  license_number: string | null;
  education: string | null;
  years_experience: number | null;
  city: string | null;
  specialties: string[] | null;
  verification_status: VerificationStatus;
  verification_submitted_at: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

interface DocumentRow {
  id: string;
  psychologist_id: string;
  doc_type: string;
  storage_path: string;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
}

const DOC_LABELS: Record<string, string> = {
  professional_license: 'Tarjeta profesional',
  id_document: 'Documento de identidad',
  diploma: 'Diploma / acta de grado',
  other: 'Otro documento',
};

const STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Sin documentos',
  submitted: 'En revision',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const FILTERS: { key: VerificationStatus | 'all'; label: string }[] = [
  { key: 'submitted', label: 'En revision' },
  { key: 'approved', label: 'Aprobados' },
  { key: 'rejected', label: 'Rechazados' },
  { key: 'pending', label: 'Sin documentos' },
  { key: 'all', label: 'Todos' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PSY_COLUMNS =
  'id, user_id, full_name, email, phone, license_number, education, years_experience, city, ' +
  'specialties, verification_status, verification_submitted_at, verified_at, rejection_reason, created_at';

/** Fuera del componente para no llamar a setState de forma sincrona en el efecto. */
async function fetchPsychologists(filter: VerificationStatus | 'all'): Promise<PsychologistRow[]> {
  let query = supabase
    .from('psychologists')
    .select(PSY_COLUMNS)
    .order('verification_submitted_at', { ascending: false, nullsFirst: false });

  if (filter !== 'all') query = query.eq('verification_status', filter);

  const { data } = await query;
  return (data as unknown as PsychologistRow[]) || [];
}

const Admin: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<PsychologistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VerificationStatus | 'all'>('all');
  const [reloadKey, setReloadKey] = useState(0);

  const [selected, setSelected] = useState<PsychologistRow | null>(null);
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState('');

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
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    (async () => {
      const rows = await fetchPsychologists(filter);
      if (!cancelled) {
        setRows(rows);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, filter, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const openDetail = async (row: PsychologistRow) => {
    setSelected(row);
    setRejectReason(row.rejection_reason || '');
    setActionError('');
    setDocsLoading(true);

    const { data } = await supabase
      .from('psychologist_documents')
      .select('*')
      .eq('psychologist_id', row.id)
      .order('uploaded_at', { ascending: true });

    setDocs((data as DocumentRow[]) || []);
    setDocsLoading(false);
  };

  // El bucket es privado: se genera una URL firmada de corta duracion por clic.
  const openDocument = async (doc: DocumentRow) => {
    const { data, error } = await supabase.storage
      .from(DOC_BUCKET)
      .createSignedUrl(doc.storage_path, 120);

    if (error || !data) {
      setActionError(`No se pudo abrir el documento: ${error?.message ?? 'sin URL'}`);
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  };

  const decide = async (status: 'approved' | 'rejected') => {
    if (!selected || !user) return;

    if (status === 'rejected' && !rejectReason.trim()) {
      setActionError('Indica el motivo del rechazo. El psicologo lo va a leer.');
      return;
    }

    setActing(true);
    setActionError('');

    const { error } = await supabase.rpc('admin_set_psychologist_verification', {
      p_psychologist_id: selected.id,
      p_status: status,
      p_notes: status === 'rejected' ? rejectReason.trim() : null,
    });

    if (error) {
      setActing(false);
      setActionError(error.message);
      return;
    }

    // El RPC valida al administrador y el trigger aplica el estado de verificacion.
    if (status === 'approved') {
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: selected.user_id, role_code: 'psychologist', granted_by: user.id },
          { onConflict: 'user_id,role_code' }
        );

      if (roleError) {
        setActing(false);
        setActionError(`Psicologo aprobado, pero no se pudo asignar el rol: ${roleError.message}`);
        return;
      }
    }

    setActing(false);
    setSelected(null);
    reload();
  };

  if (authLoading || isAdmin === null) return null;

  if (!isAdmin) {
    return (
      <DashboardLayout pageTitle="Verificacion de psicologos">
        <div className="admin-denied">
          <h1>Acceso restringido</h1>
          <p>Esta seccion es solo para administradores de la plataforma.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Verificacion de psicologos">
      <div className="admin">
        <header className="admin__header">
          <div>
            <h1 className="admin__title">Verificacion de psicologos</h1>
            <p className="admin__subtitle">
              Revisa los documentos antes de habilitar a un profesional. Un psicologo aprobado
              puede abrir historias clinicas.
            </p>
          </div>
        </header>

        <div className="admin__filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`admin__filter ${filter === f.key ? 'admin__filter--active' : ''}`}
              onClick={() => {
                setLoading(true);
                setFilter(f.key);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="admin__empty">Cargando...</p>
        ) : rows.length === 0 ? (
          <p className="admin__empty">No hay solicitudes en este estado.</p>
        ) : (
          <div className="admin__list">
            {rows.map((row) => (
              <button key={row.id} type="button" className="admin-card" onClick={() => openDetail(row)}>
                <div className="admin-card__main">
                  <p className="admin-card__name">{row.full_name}</p>
                  <p className="admin-card__meta">
                    {row.license_number || 'Sin licencia'} · {row.city || 'Sin ciudad'}
                  </p>
                  <p className="admin-card__meta admin-card__meta--dim">
                    Enviado {formatDate(row.verification_submitted_at)}
                  </p>
                </div>
                <span className={`admin-badge admin-badge--${row.verification_status}`}>
                  {STATUS_LABELS[row.verification_status]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal__backdrop" onClick={() => setSelected(null)} />
          <div className="admin-modal__panel">
            <header className="admin-modal__head">
              <div>
                <h2>{selected.full_name}</h2>
                <p>{selected.email}</p>
              </div>
              <button type="button" className="admin-modal__close" onClick={() => setSelected(null)} aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <dl className="admin-modal__facts">
              <div><dt>Tarjeta profesional</dt><dd>{selected.license_number || '—'}</dd></div>
              <div><dt>Formacion</dt><dd>{selected.education || '—'}</dd></div>
              <div><dt>Experiencia</dt><dd>{selected.years_experience ?? 0} anos</dd></div>
              <div><dt>Telefono</dt><dd>{selected.phone || '—'}</dd></div>
              <div><dt>Ciudad</dt><dd>{selected.city || '—'}</dd></div>
              <div><dt>Estado</dt><dd>{STATUS_LABELS[selected.verification_status]}</dd></div>
            </dl>

            <section className="admin-modal__docs">
              <h3>Documentos</h3>
              {docsLoading ? (
                <p className="admin__empty">Cargando documentos...</p>
              ) : docs.length === 0 ? (
                <p className="admin__empty">Este profesional no ha cargado documentos. Puedes aprobarlo solo si es una cuenta de prueba o si verificaste sus datos por otro medio.</p>
              ) : (
                docs.map((d) => (
                  <button key={d.id} type="button" className="admin-doc" onClick={() => openDocument(d)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="admin-doc__label">{DOC_LABELS[d.doc_type] || d.doc_type}</span>
                    <span className="admin-doc__name">{d.original_name}</span>
                    <span className="admin-doc__open">Abrir</span>
                  </button>
                ))
              )}
            </section>

            <section className="admin-modal__decision">
              <label htmlFor="reject-reason">Motivo (obligatorio para rechazar)</label>
              <textarea
                id="reject-reason"
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: la tarjeta profesional no es legible"
              />

              {actionError && <p className="admin-modal__error">{actionError}</p>}

              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--reject"
                  disabled={acting}
                  onClick={() => decide('rejected')}
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--approve"
                  disabled={acting}
                  onClick={() => decide('approved')}
                >
                  {acting ? 'Guardando...' : 'Aprobar y habilitar'}
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Admin;
