import React, { useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DOC_BUCKET } from '../../components/DocumentUpload/DocumentUpload';
import {
  VERIFICATION_LABELS,
  formatDate,
} from './adminData';
import type { AdminData, AdminPsychologist, VerificationStatus } from './adminData';
import { Avatar, ErrorNote, FilterChips, Modal, SearchInput } from './AdminUi';

interface DocumentRow {
  id: string;
  doc_type: string;
  original_name: string | null;
}

interface DocumentFull extends DocumentRow {
  storage_path: string;
}

const DOC_LABELS: Record<string, string> = {
  professional_license: 'Tarjeta profesional',
  id_document: 'Documento de identidad',
  diploma: 'Diploma / acta de grado',
  other: 'Otro documento',
};

type Filter = VerificationStatus | 'all';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'submitted', label: 'En revisión' },
  { key: 'approved', label: 'Aprobados' },
  { key: 'rejected', label: 'Rechazados' },
  { key: 'pending', label: 'Sin documentos' },
  { key: 'all', label: 'Todos' },
];

const BADGE: Record<VerificationStatus, string> = {
  pending: 'pending',
  submitted: 'verify',
  approved: 'confirmed',
  rejected: 'cancelled',
};

interface Props {
  data: AdminData;
  reload: () => void;
  adminUserId: string;
  onViewAgenda: (psychologistId: string) => void;
}

const AdminPsychologists: React.FC<Props> = ({ data, reload, adminUserId, onViewAgenda }) => {
  const [filter, setFilter] = useState<Filter>('submitted');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminPsychologist | null>(null);
  const [docs, setDocs] = useState<DocumentFull[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.psychologists.filter(
      (p) =>
        (filter === 'all' || p.verification_status === filter) &&
        (!term || p.full_name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term)),
    );
  }, [data.psychologists, filter, query]);

  const open = async (p: AdminPsychologist) => {
    setSelected(p);
    setReason(p.rejection_reason || '');
    setError('');
    setDocsLoading(true);
    const { data: docRows } = await supabase
      .from('psychologist_documents')
      .select('*')
      .eq('psychologist_id', p.id)
      .order('uploaded_at', { ascending: true });
    setDocs((docRows as DocumentFull[]) || []);
    setDocsLoading(false);
  };

  const openDocument = async (doc: DocumentFull) => {
    const { data: signed, error: urlError } = await supabase.storage
      .from(DOC_BUCKET)
      .createSignedUrl(doc.storage_path, 120);
    if (urlError || !signed) {
      setError(`No se pudo abrir el documento: ${urlError?.message ?? 'sin URL'}`);
      return;
    }
    window.open(signed.signedUrl, '_blank', 'noopener');
  };

  const decide = async (status: 'approved' | 'rejected') => {
    if (!selected) return;
    if (status === 'rejected' && !reason.trim()) {
      setError('Indica el motivo del rechazo. El psicólogo lo va a leer.');
      return;
    }
    setBusy(true);
    setError('');

    const { error: rpcError } = await supabase.rpc('admin_set_psychologist_verification', {
      p_psychologist_id: selected.id,
      p_status: status,
      p_notes: status === 'rejected' ? reason.trim() : null,
    });
    if (rpcError) {
      setBusy(false);
      setError(rpcError.message);
      return;
    }

    if (status === 'approved') {
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: selected.user_id, role_code: 'psychologist', granted_by: adminUserId },
          { onConflict: 'user_id,role_code' },
        );
      if (roleError) {
        setBusy(false);
        setError(`Psicólogo aprobado, pero no se pudo asignar el rol: ${roleError.message}`);
        return;
      }
    }

    setBusy(false);
    setSelected(null);
    reload();
  };

  const toggleActive = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    const next = !(selected.is_active ?? false);
    const { error: updateError } = await supabase
      .from('psychologists')
      .update({ is_active: next })
      .eq('id', selected.id);
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSelected({ ...selected, is_active: next });
    reload();
  };

  return (
    <>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar psicólogo por nombre o correo" />
      <FilterChips options={FILTERS} value={filter} onChange={setFilter} label="Filtrar psicólogos" />
      <div className="psy-patients-scroll">
        {rows.length === 0 ? (
          <div className="psy-dash-empty">
            <p>No hay psicólogos en este estado.</p>
          </div>
        ) : (
          <div className="adm-list">
            {rows.map((p) => (
              <button key={p.id} type="button" className="adm-card" onClick={() => open(p)}>
                <Avatar url={p.avatar_url} name={p.full_name} />
                <span className="adm-card-text">
                  <strong>{p.full_name}</strong>
                  <small>{p.license_number || 'Sin licencia'} · {p.city || 'Sin ciudad'}</small>
                </span>
                <span className={`psy-dash-mini-status psy-dash-mini-status--${BADGE[p.verification_status]}`}>
                  {VERIFICATION_LABELS[p.verification_status]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <Modal title={selected.full_name} subtitle={selected.email} onClose={() => setSelected(null)}>
          <dl className="adm-facts">
            <div><dt>Tarjeta profesional</dt><dd>{selected.license_number || '—'}</dd></div>
            <div><dt>Formación</dt><dd>{selected.education || '—'}</dd></div>
            <div><dt>Experiencia</dt><dd>{selected.years_experience ?? 0} años</dd></div>
            <div><dt>Teléfono</dt><dd>{selected.phone || '—'}</dd></div>
            <div><dt>Ciudad</dt><dd>{selected.city || '—'}</dd></div>
            <div><dt>Estado</dt><dd>{VERIFICATION_LABELS[selected.verification_status]}</dd></div>
            <div><dt>Enviado</dt><dd>{formatDate(selected.verification_submitted_at)}</dd></div>
            <div><dt>Cuenta</dt><dd>{selected.is_active ? 'Activa' : 'Inactiva'}</dd></div>
          </dl>

          <h4 className="adm-subtitle">Documentos</h4>
          {docsLoading ? (
            <p className="adm-muted">Cargando documentos...</p>
          ) : docs.length === 0 ? (
            <p className="adm-muted">Este profesional no ha cargado documentos.</p>
          ) : (
            <div className="adm-list">
              {docs.map((d) => (
                <button key={d.id} type="button" className="adm-card adm-card--doc" onClick={() => openDocument(d)}>
                  <span className="adm-card-text">
                    <strong>{DOC_LABELS[d.doc_type] || d.doc_type}</strong>
                    <small>{d.original_name}</small>
                  </span>
                  <span className="adm-count">Abrir</span>
                </button>
              ))}
            </div>
          )}

          <label className="adm-label" htmlFor="adm-reject-reason">Motivo (obligatorio para rechazar)</label>
          <textarea
            id="adm-reject-reason"
            className="adm-textarea"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: la tarjeta profesional no es legible"
          />
          <ErrorNote message={error} />

          <div className="adm-actions adm-actions--wrap">
            <button type="button" className="psy-dash-btn-outline" onClick={() => { onViewAgenda(selected.id); setSelected(null); }}>
              Ver agenda
            </button>
            <button type="button" className="psy-dash-btn-outline" disabled={busy} onClick={toggleActive}>
              {selected.is_active ? 'Desactivar' : 'Activar'}
            </button>
            <button type="button" className="adm-btn adm-btn--danger" disabled={busy} onClick={() => decide('rejected')}>
              Rechazar
            </button>
            <button type="button" className="psy-dash-btn-primary" disabled={busy} onClick={() => decide('approved')}>
              {busy ? 'Guardando...' : 'Aprobar y habilitar'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AdminPsychologists;
