import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { ClinicalRecord, SessionNote } from '../../types/clinicalHistory';
import './ClinicalHistoryView.css';

interface ClinicalHistoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  psychologistId: string;
  patientName: string;
}

interface EnrichedSessionNote extends SessionNote {
  appointment_date?: string;
}

const ClinicalHistoryView: React.FC<ClinicalHistoryViewProps> = ({
  isOpen,
  onClose,
  patientId,
  psychologistId,
  patientName,
}) => {
  const [clinicalRecord, setClinicalRecord] = useState<ClinicalRecord | null>(null);
  const [sessionNotes, setSessionNotes] = useState<EnrichedSessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<EnrichedSessionNote | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClinicalHistory();
    }
  }, [isOpen, patientId, psychologistId]);

  const fetchClinicalHistory = async () => {
    setLoading(true);

    try {
      // Fetch clinical record
      const { data: crData, error: crError } = await supabase
        .from('clinical_records')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', psychologistId)
        .single();

      if (crError) throw crError;

      setClinicalRecord(crData as ClinicalRecord);

      // Fetch all session notes (no borradores)
      const { data: notesData, error: notesError } = await supabase
        .from('session_notes')
        .select('*')
        .eq('clinical_record_id', crData.id)
        .eq('is_draft', false)
        .order('session_date', { ascending: true });

      if (notesError) throw notesError;

      // Enrich with appointment dates
      const enrichedNotes = await Promise.all(
        (notesData || []).map(async (note) => {
          const { data: apptData } = await supabase
            .from('appointments')
            .select('appointment_date')
            .eq('id', note.appointment_id)
            .single();

          return {
            ...note,
            appointment_date: apptData?.appointment_date,
          } as EnrichedSessionNote;
        })
      );

      setSessionNotes(enrichedNotes);
    } catch (err) {
      console.error('Error fetching clinical history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);

    try {
      // Fetch psychologist info
      const { data: psychData } = await supabase
        .from('psychologists')
        .select('full_name, email, phone')
        .eq('id', psychologistId)
        .single();

      // Fetch patient profile
      const { data: patientData } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', patientId)
        .single();

      // Generate PDF content
      const pdfContent = generateOfficialReport(
        clinicalRecord!,
        sessionNotes,
        psychData,
        patientData
      );

      // Create and download PDF
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HC_${patientData?.full_name}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Error al exportar el informe. Por favor intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const generateOfficialReport = (
    record: ClinicalRecord,
    notes: EnrichedSessionNote[],
    psychologist: any,
    patient: any
  ): string => {
    const today = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Historia Clínica - ${patient?.full_name}</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #7e57c2; padding-bottom: 1rem; margin-bottom: 2rem; }
    .header h1 { color: #7e57c2; margin: 0; font-size: 24px; }
    .header p { margin: 0.25rem 0; color: #666; font-size: 12px; }
    .section { margin-bottom: 2rem; page-break-inside: avoid; }
    .section-title { background: #7e57c2; color: white; padding: 0.5rem 1rem; margin-bottom: 1rem; font-size: 16px; font-weight: bold; }
    .field { margin-bottom: 0.75rem; }
    .field-label { font-weight: bold; color: #555; font-size: 13px; }
    .field-value { margin-left: 1rem; color: #333; font-size: 13px; }
    .session-card { border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; background: #f9f9f9; page-break-inside: avoid; }
    .session-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; }
    .session-number { font-weight: bold; color: #7e57c2; font-size: 14px; }
    .session-date { color: #666; font-size: 12px; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ccc; text-align: center; font-size: 11px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    table th { background: #f0f0f0; padding: 0.5rem; text-align: left; font-size: 12px; }
    table td { padding: 0.5rem; border-bottom: 1px solid #eee; font-size: 12px; }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <h1>HISTORIA CLÍNICA PSICOLÓGICA</h1>
    <p>Conforme a Resolución 1995/1999 y Ley 1090/2006</p>
    <p>Fecha de emisión: ${today}</p>
  </div>

  <!-- INFORMACIÓN DEL PACIENTE -->
  <div class="section">
    <div class="section-title">1. INFORMACIÓN DEL PACIENTE</div>
    <div class="field">
      <span class="field-label">Nombre completo:</span>
      <span class="field-value">${patient?.full_name || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Identificación:</span>
      <span class="field-value">${record.identification_type} ${record.identification_number}</span>
    </div>
    <div class="field">
      <span class="field-label">Lugar de nacimiento:</span>
      <span class="field-value">${record.birth_place || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Dirección:</span>
      <span class="field-value">${record.residence_address || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Ciudad:</span>
      <span class="field-value">${record.city || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Ocupación:</span>
      <span class="field-value">${record.occupation || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Nivel educativo:</span>
      <span class="field-value">${record.education_level || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Estado civil:</span>
      <span class="field-value">${record.marital_status || 'N/A'}</span>
    </div>
  </div>

  <!-- CONTACTO DE EMERGENCIA -->
  <div class="section">
    <div class="section-title">2. CONTACTO DE EMERGENCIA</div>
    <div class="field">
      <span class="field-label">Nombre:</span>
      <span class="field-value">${record.emergency_contact_name || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Parentesco:</span>
      <span class="field-value">${record.emergency_contact_relationship || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Teléfono:</span>
      <span class="field-value">${record.emergency_contact_phone || 'N/A'}</span>
    </div>
  </div>

  <!-- MOTIVO DE CONSULTA -->
  <div class="section">
    <div class="section-title">3. MOTIVO DE CONSULTA</div>
    <div class="field">
      <span class="field-label">Fecha de consulta:</span>
      <span class="field-value">${new Date(record.consultation_date).toLocaleDateString('es-CO')}</span>
    </div>
    <div class="field">
      <span class="field-label">Motivo:</span>
      <div class="field-value">${record.consultation_reason}</div>
    </div>
    <div class="field">
      <span class="field-label">Historia de la enfermedad actual:</span>
      <div class="field-value">${record.current_illness_history || 'N/A'}</div>
    </div>
  </div>

  <!-- ANTECEDENTES -->
  <div class="section">
    <div class="section-title">4. ANTECEDENTES</div>
    <div class="field">
      <span class="field-label">Antecedentes médicos personales:</span>
      <div class="field-value">${record.personal_medical_history || 'Ninguno reportado'}</div>
    </div>
    <div class="field">
      <span class="field-label">Antecedentes psiquiátricos personales:</span>
      <div class="field-value">${record.personal_psychiatric_history || 'Ninguno reportado'}</div>
    </div>
    <div class="field">
      <span class="field-label">Medicamentos actuales:</span>
      <div class="field-value">${record.current_medications || 'Ninguno'}</div>
    </div>
    <div class="field">
      <span class="field-label">Alergias:</span>
      <div class="field-value">${record.allergies || 'Ninguna conocida'}</div>
    </div>
    <div class="field">
      <span class="field-label">Uso de sustancias:</span>
      <div class="field-value">${record.substance_use || 'Ninguno reportado'}</div>
    </div>
    <div class="field">
      <span class="field-label">Antecedentes psiquiátricos familiares:</span>
      <div class="field-value">${record.family_psychiatric_history || 'Ninguno reportado'}</div>
    </div>
  </div>

  <!-- EVALUACIÓN INICIAL -->
  <div class="section">
    <div class="section-title">5. EVALUACIÓN INICIAL</div>
    <div class="field">
      <span class="field-label">Examen del estado mental:</span>
      <div class="field-value">${record.mental_status_exam || 'N/A'}</div>
    </div>
    <div class="field">
      <span class="field-label">Evaluación de riesgo:</span>
      <div class="field-value">${record.risk_assessment || 'N/A'}</div>
    </div>
    <div class="field">
      <span class="field-label">Fortalezas y recursos:</span>
      <div class="field-value">${record.strengths_resources || 'N/A'}</div>
    </div>
  </div>

  <!-- PLAN DE TRATAMIENTO INICIAL -->
  <div class="section">
    <div class="section-title">6. PLAN DE TRATAMIENTO INICIAL</div>
    <div class="field">
      <span class="field-label">Objetivos terapéuticos:</span>
      <div class="field-value">${record.initial_treatment_goals || 'N/A'}</div>
    </div>
    <div class="field">
      <span class="field-label">Enfoque terapéutico:</span>
      <span class="field-value">${record.initial_therapeutic_approach || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="field-label">Número estimado de sesiones:</span>
      <span class="field-value">${record.estimated_sessions || 'No definido'}</span>
    </div>
    <div class="field">
      <span class="field-label">Frecuencia:</span>
      <span class="field-value">${record.session_frequency || 'N/A'}</span>
    </div>
  </div>

  <!-- EVOLUCIÓN CLÍNICA -->
  <div class="section">
    <div class="section-title">7. EVOLUCIÓN CLÍNICA Y NOTAS DE SESIÓN</div>
    <p style="font-size: 13px; color: #666; margin-bottom: 1rem;">Total de sesiones: ${notes.length}</p>

    ${notes
      .map(
        (note) => `
    <div class="session-card">
      <div class="session-header">
        <span class="session-number">Sesión #${note.session_number}</span>
        <span class="session-date">${new Date(note.session_date).toLocaleDateString('es-CO')} - ${note.session_duration_minutes} min - ${note.session_modality}</span>
      </div>

      <div class="field">
        <span class="field-label">Diagnóstico principal:</span>
        <span class="field-value">${note.primary_diagnosis_code} - ${note.primary_diagnosis_description}</span>
      </div>

      ${
        note.secondary_diagnoses && note.secondary_diagnoses.length > 0
          ? `
      <div class="field">
        <span class="field-label">Diagnósticos secundarios:</span>
        <div class="field-value">
          ${note.secondary_diagnoses.map((d: any) => `${d.code} - ${d.description}`).join('<br>')}
        </div>
      </div>
      `
          : ''
      }

      <div class="field">
        <span class="field-label">Subjetivo (Relato del paciente):</span>
        <div class="field-value">${note.subjective_data}</div>
      </div>

      <div class="field">
        <span class="field-label">Objetivo (Observaciones):</span>
        <div class="field-value">${note.objective_observations}</div>
      </div>

      <div class="field">
        <span class="field-label">Intervención:</span>
        <div class="field-value">${note.intervention_description}</div>
      </div>

      ${
        note.patient_response
          ? `
      <div class="field">
        <span class="field-label">Respuesta del paciente:</span>
        <div class="field-value">${note.patient_response}</div>
      </div>
      `
          : ''
      }

      <div class="field">
        <span class="field-label">Progreso:</span>
        <span class="field-value">${note.treatment_progress || 'N/A'}</span>
      </div>

      ${
        note.suicide_risk_level && note.suicide_risk_level !== 'Ninguno'
          ? `
      <div class="field" style="background: #fff3cd; padding: 0.5rem; border-radius: 4px; border-left: 3px solid #ffc107;">
        <span class="field-label">⚠️ Riesgo suicida:</span>
        <span class="field-value" style="color: #856404; font-weight: bold;">${note.suicide_risk_level}</span>
        ${note.alert_notes ? `<div class="field-value" style="margin-top: 0.5rem;">${note.alert_notes}</div>` : ''}
      </div>
      `
          : ''
      }
    </div>
    `
      )
      .join('')}
  </div>

  <!-- RESUMEN ESTADÍSTICO -->
  <div class="section">
    <div class="section-title">8. RESUMEN ESTADÍSTICO</div>
    <table>
      <tr>
        <th>Métrica</th>
        <th>Valor</th>
      </tr>
      <tr>
        <td>Total de sesiones completadas</td>
        <td>${notes.length}</td>
      </tr>
      <tr>
        <td>Duración promedio por sesión</td>
        <td>${Math.round(notes.reduce((acc, n) => acc + (n.session_duration_minutes || 0), 0) / notes.length)} minutos</td>
      </tr>
      <tr>
        <td>Fecha de primera sesión</td>
        <td>${notes.length > 0 ? new Date(notes[0].session_date).toLocaleDateString('es-CO') : 'N/A'}</td>
      </tr>
      <tr>
        <td>Fecha de última sesión</td>
        <td>${notes.length > 0 ? new Date(notes[notes.length - 1].session_date).toLocaleDateString('es-CO') : 'N/A'}</td>
      </tr>
      <tr>
        <td>Modalidad predominante</td>
        <td>${notes.filter((n) => n.session_modality === 'Virtual').length > notes.length / 2 ? 'Virtual' : 'Presencial'}</td>
      </tr>
    </table>
  </div>

  <!-- PIE DE PÁGINA -->
  <div class="footer">
    <p><strong>Psicólogo/a tratante:</strong> ${psychologist?.full_name || 'N/A'}</p>
    <p><strong>Contacto:</strong> ${psychologist?.email || 'N/A'} | ${psychologist?.phone || 'N/A'}</p>
    <p style="margin-top: 1rem; font-size: 10px;">
      Este documento contiene información confidencial protegida por la Ley 1090 de 2006 (Código Deontológico y Bioético del Psicólogo)
      y la Ley 1581 de 2012 (Protección de Datos Personales). Su divulgación no autorizada está prohibida.
    </p>
    <p style="font-size: 10px;">Generado por Vida Sabia - ${today}</p>
  </div>
</body>
</html>
    `;
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="chv-modal-backdrop">
        <div className="chv-modal">
          <div className="chv-loading">
            <div className="chv-spinner" />
            <p>Cargando historia clínica...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clinicalRecord) {
    return (
      <div className="chv-modal-backdrop" onClick={onClose}>
        <div className="chv-modal" onClick={(e) => e.stopPropagation()}>
          <div className="chv-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>No se encontró historia clínica</h3>
            <p>Este paciente no tiene una historia clínica registrada.</p>
            <button onClick={onClose} className="chv-btn-primary">Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chv-modal-backdrop" onClick={onClose}>
      <div className="chv-modal chv-modal--large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chv-header">
          <div>
            <h2>Historia Clínica de {patientName}</h2>
            <p className="chv-subtitle">
              Apertura: {new Date(clinicalRecord.created_at).toLocaleDateString('es-CO')} •{' '}
              {sessionNotes.length} sesiones completadas
            </p>
          </div>
          <div className="chv-header-actions">
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="chv-btn-export"
              title="Exportar informe oficial"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exporting ? 'Generando...' : 'Exportar informe'}
            </button>
            <button onClick={onClose} className="chv-close" aria-label="Cerrar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="chv-content">
          {/* Summary Cards */}
          <div className="chv-summary-grid">
            <div className="chv-summary-card">
              <div className="chv-summary-icon chv-summary-icon--purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="chv-summary-label">Total sesiones</p>
                <p className="chv-summary-value">{sessionNotes.length}</p>
              </div>
            </div>

            <div className="chv-summary-card">
              <div className="chv-summary-icon chv-summary-icon--blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="chv-summary-label">Duración promedio</p>
                <p className="chv-summary-value">
                  {sessionNotes.length > 0
                    ? Math.round(
                        sessionNotes.reduce((acc, n) => acc + (n.session_duration_minutes || 0), 0) /
                          sessionNotes.length
                      )
                    : 0}{' '}
                  min
                </p>
              </div>
            </div>

            <div className="chv-summary-card">
              <div className="chv-summary-icon chv-summary-icon--green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <p className="chv-summary-label">Progreso general</p>
                <p className="chv-summary-value">
                  {sessionNotes.length > 0 ? sessionNotes[sessionNotes.length - 1].treatment_progress || 'N/A' : 'N/A'}
                </p>
              </div>
            </div>

            <div className="chv-summary-card">
              <div className="chv-summary-icon chv-summary-icon--yellow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <p className="chv-summary-label">Última sesión</p>
                <p className="chv-summary-value">
                  {sessionNotes.length > 0
                    ? new Date(sessionNotes[sessionNotes.length - 1].session_date)
                        .toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Session Timeline */}
          <div className="chv-section">
            <h3 className="chv-section-title">Línea de tiempo de sesiones</h3>

            {sessionNotes.length === 0 ? (
              <div className="chv-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>No hay sesiones registradas aún</p>
              </div>
            ) : (
              <div className="chv-timeline">
                {sessionNotes.map((note, index) => (
                  <div key={note.id} className="chv-timeline-item">
                    <div className="chv-timeline-marker">
                      <div className="chv-timeline-dot" />
                      {index < sessionNotes.length - 1 && <div className="chv-timeline-line" />}
                    </div>

                    <div className="chv-timeline-card">
                      <div className="chv-timeline-header">
                        <div>
                          <h4>Sesión #{note.session_number}</h4>
                          <p className="chv-timeline-date">
                            {new Date(note.session_date).toLocaleDateString('es-CO', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}{' '}
                            • {note.session_duration_minutes} min • {note.session_modality}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedSession(note)}
                          className="chv-btn-details"
                        >
                          Ver detalles
                        </button>
                      </div>

                      <div className="chv-timeline-content">
                        <div className="chv-diagnosis-badge">
                          <strong>{note.primary_diagnosis_code}</strong>
                          <span>{note.primary_diagnosis_description}</span>
                        </div>

                        {note.treatment_progress && (
                          <div className={`chv-progress-badge chv-progress-badge--${note.treatment_progress.toLowerCase()}`}>
                            {note.treatment_progress}
                          </div>
                        )}

                        {note.suicide_risk_level && note.suicide_risk_level !== 'Ninguno' && (
                          <div className="chv-risk-alert">
                            ⚠️ Riesgo suicida: <strong>{note.suicide_risk_level}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Session Detail Modal */}
        {selectedSession && (
          <div className="chv-detail-backdrop" onClick={() => setSelectedSession(null)}>
            <div className="chv-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="chv-detail-header">
                <h3>Sesión #{selectedSession.session_number}</h3>
                <button onClick={() => setSelectedSession(null)} className="chv-close-sm">×</button>
              </div>

              <div className="chv-detail-content">
                <div className="chv-detail-section">
                  <h4>Diagnóstico</h4>
                  <p><strong>{selectedSession.primary_diagnosis_code}</strong> - {selectedSession.primary_diagnosis_description}</p>
                  {selectedSession.diagnostic_impression && (
                    <p className="chv-detail-text">{selectedSession.diagnostic_impression}</p>
                  )}
                </div>

                <div className="chv-detail-section">
                  <h4>Subjetivo (Relato del paciente)</h4>
                  <p className="chv-detail-text">{selectedSession.subjective_data}</p>
                </div>

                <div className="chv-detail-section">
                  <h4>Objetivo (Observaciones)</h4>
                  <p className="chv-detail-text">{selectedSession.objective_observations}</p>
                </div>

                <div className="chv-detail-section">
                  <h4>Intervención</h4>
                  <p className="chv-detail-text">{selectedSession.intervention_description}</p>
                </div>

                {selectedSession.patient_response && (
                  <div className="chv-detail-section">
                    <h4>Respuesta del paciente</h4>
                    <p className="chv-detail-text">{selectedSession.patient_response}</p>
                  </div>
                )}

                {selectedSession.therapeutic_techniques_used && selectedSession.therapeutic_techniques_used.length > 0 && (
                  <div className="chv-detail-section">
                    <h4>Técnicas utilizadas</h4>
                    <div className="chv-techniques-list">
                      {selectedSession.therapeutic_techniques_used.map((tech, i) => (
                        <span key={i} className="chv-technique-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSession.homework_assigned && (
                  <div className="chv-detail-section">
                    <h4>Tareas asignadas</h4>
                    <p className="chv-detail-text">{selectedSession.homework_assigned}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalHistoryView;
