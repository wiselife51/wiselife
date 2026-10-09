import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import StarRating from '../../components/StarRating/StarRating';
import { shortPatientName } from '../../lib/reviews';
import './Pendientes.css';

interface PendingAppointment {
  id: string;
  psychologist_id: string;
  appointment_date: string;
  start_time: string;
  psychologist: { full_name: string; avatar_url: string | null; specialties: string[] } | null;
}

const MAX_COMMENT = 600;

const formatDate = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'long' });

const Pendientes: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    const [apptRes, reviewRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('id, psychologist_id, appointment_date, start_time, status, attended_at')
        .eq('patient_id', user.id)
        .or('status.eq.completada,attended_at.not.is.null')
        .neq('status', 'cancelada')
        .neq('status', 'no_asistio')
        .order('appointment_date', { ascending: false }),
      supabase.from('psychologist_reviews').select('appointment_id').eq('patient_id', user.id),
    ]);

    const reviewed = new Set((reviewRes.data || []).map((r: { appointment_id: string }) => r.appointment_id));
    const pending = (apptRes.data || []).filter((a: { id: string }) => !reviewed.has(a.id));

    const psyIds = Array.from(new Set(pending.map((a: { psychologist_id: string }) => a.psychologist_id)));
    const psyMap: Record<string, PendingAppointment['psychologist']> = {};
    if (psyIds.length > 0) {
      const { data: psyData } = await supabase
        .from('psychologists')
        .select('id, full_name, avatar_url, specialties')
        .in('id', psyIds);
      for (const p of psyData || []) {
        psyMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url, specialties: p.specialties || [] };
      }
    }

    setItems(
      pending.map((a: { id: string; psychologist_id: string; appointment_date: string; start_time: string }) => ({
        id: a.id,
        psychologist_id: a.psychologist_id,
        appointment_date: a.appointment_date,
        start_time: a.start_time,
        psychologist: psyMap[a.psychologist_id] || null,
      })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (id: string) => {
    setActiveId(id);
    setRating(0);
    setComment('');
    setError('');
  };

  const submit = async (item: PendingAppointment) => {
    if (!user || rating === 0) {
      setError('Selecciona una calificación de 1 a 5 estrellas.');
      return;
    }
    setSaving(true);
    setError('');

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
    const displayName = shortPatientName(
      profile?.full_name || user.user_metadata?.full_name || 'Paciente',
    );

    const { error: insertError } = await supabase.from('psychologist_reviews').insert({
      appointment_id: item.id,
      psychologist_id: item.psychologist_id,
      patient_id: user.id,
      patient_display_name: displayName,
      rating,
      comment: comment.trim() || null,
    });

    setSaving(false);
    if (insertError) {
      setError('No pudimos guardar tu calificación. Inténtalo de nuevo.');
      return;
    }
    setActiveId(null);
    setItems((current) => current.filter((i) => i.id !== item.id));
  };

  if (authLoading) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-loading-spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <DashboardLayout pageTitle="Pendientes" subtitle="Califica a tus especialistas después de cada sesión atendida">
      <div className="pd-page">
        {loading ? (
          <div className="pd-state"><div className="dash-loading-spinner" /></div>
        ) : items.length === 0 ? (
          <div className="pd-state pd-empty">
            <strong>Estás al día</strong>
            <p>Cuando tu especialista marque una sesión como atendida, aparecerá aquí para que la califiques.</p>
          </div>
        ) : (
          <ul className="pd-list">
            {items.map((item) => {
              const open = activeId === item.id;
              const name = item.psychologist?.full_name || 'Especialista';
              return (
                <li key={item.id} className="pd-card">
                  <div className="pd-card-top">
                    <span className="pd-avatar">
                      {item.psychologist?.avatar_url ? (
                        <img src={item.psychologist.avatar_url} alt="" crossOrigin="anonymous" />
                      ) : (
                        <span>{name.charAt(0).toUpperCase()}</span>
                      )}
                    </span>
                    <div className="pd-info">
                      <strong>{name}</strong>
                      <span>
                        {formatDate(item.appointment_date)} · {item.start_time.slice(0, 5)}
                      </span>
                    </div>
                    <span className="pd-badge">Por calificar</span>
                  </div>

                  {!open ? (
                    <button type="button" className="pd-btn pd-btn--primary" onClick={() => openForm(item.id)}>
                      Calificar sesión
                    </button>
                  ) : (
                    <form
                      className="pd-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        submit(item);
                      }}
                    >
                      <p className="pd-form-label">¿Cómo fue tu experiencia?</p>
                      <div className="pd-stars">
                        <StarRating value={rating} onChange={setRating} label={`Calificación para ${name}`} />
                      </div>
                      <label className="pd-form-label" htmlFor={`comment-${item.id}`}>
                        Comentario (opcional)
                      </label>
                      <textarea
                        id={`comment-${item.id}`}
                        className="pd-textarea"
                        rows={3}
                        maxLength={MAX_COMMENT}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Cuéntanos cómo te sentiste en la sesión..."
                      />
                      <span className="pd-counter">{comment.length}/{MAX_COMMENT}</span>
                      {error && <p className="pd-error" role="alert">{error}</p>}
                      <div className="pd-form-actions">
                        <button type="button" className="pd-btn pd-btn--ghost" onClick={() => setActiveId(null)} disabled={saving}>
                          Cancelar
                        </button>
                        <button type="submit" className="pd-btn pd-btn--primary" disabled={saving}>
                          {saving ? 'Enviando...' : 'Enviar'}
                        </button>
                      </div>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Pendientes;
