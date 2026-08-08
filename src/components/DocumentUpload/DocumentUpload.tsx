import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './DocumentUpload.css';

export const DOC_BUCKET = 'psychologist-documents';

export type DocType = 'professional_license' | 'id_document' | 'diploma';

export interface UploadedDoc {
  docType: DocType;
  storagePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

interface Slot {
  type: DocType;
  label: string;
  hint: string;
  required: boolean;
}

const SLOTS: Slot[] = [
  {
    type: 'professional_license',
    label: 'Tarjeta profesional',
    hint: 'Foto o PDF de ambas caras. Debe verse el numero y tu nombre.',
    required: true,
  },
  {
    type: 'id_document',
    label: 'Documento de identidad',
    hint: 'Cedula por ambas caras. Sirve para cotejar el nombre con la tarjeta.',
    required: true,
  },
  {
    type: 'diploma',
    label: 'Diploma o acta de grado',
    hint: 'Titulo de psicologia expedido por la universidad.',
    required: true,
  },
];

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

interface DocumentUploadProps {
  /** auth.uid(): primera carpeta de la ruta, es lo que valida la policy de Storage. */
  userId: string;
  docs: UploadedDoc[];
  onChange: (docs: UploadedDoc[]) => void;
}

function extensionOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i === -1 ? 'bin' : name.slice(i + 1).toLowerCase();
}

/**
 * Ruta en el bucket. Vive fuera del componente porque usa Date.now(), que es
 * impura y no debe invocarse desde el cuerpo de un componente.
 */
function buildStoragePath(userId: string, type: DocType, fileName: string): string {
  return `${userId}/${type}-${Date.now()}.${extensionOf(fileName)}`;
}

function humanSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ userId, docs, onChange }) => {
  const [busy, setBusy] = useState<DocType | null>(null);
  const [errors, setErrors] = useState<Partial<Record<DocType, string>>>({});

  const setError = (type: DocType, msg: string | undefined) =>
    setErrors((prev) => ({ ...prev, [type]: msg }));

  const handleFile = async (type: DocType, file: File | undefined) => {
    if (!file) return;
    setError(type, undefined);

    if (!ACCEPTED.includes(file.type)) {
      setError(type, 'Formato no admitido. Usa JPG, PNG, WEBP o PDF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(type, `El archivo pesa ${humanSize(file.size)}. El maximo es 8 MB.`);
      return;
    }

    setBusy(type);

    // La ruta empieza por el uid porque la policy de Storage comprueba
    // (storage.foldername(name))[1] = auth.uid().
    const path = buildStoragePath(userId, type, file.name);

    const { error } = await supabase.storage
      .from(DOC_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    setBusy(null);

    if (error) {
      setError(type, `No se pudo subir: ${error.message}`);
      return;
    }

    // Si ya habia un archivo para este tipo, se borra el anterior del bucket.
    const previous = docs.find((d) => d.docType === type);
    if (previous) {
      await supabase.storage.from(DOC_BUCKET).remove([previous.storagePath]);
    }

    onChange([
      ...docs.filter((d) => d.docType !== type),
      {
        docType: type,
        storagePath: path,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    ]);
  };

  const handleRemove = async (type: DocType) => {
    const doc = docs.find((d) => d.docType === type);
    if (!doc) return;
    setBusy(type);
    await supabase.storage.from(DOC_BUCKET).remove([doc.storagePath]);
    setBusy(null);
    onChange(docs.filter((d) => d.docType !== type));
  };

  return (
    <div className="doc-upload">
      <p className="doc-upload__lead">
        Un equipo de Vida Sabia revisa estos documentos antes de habilitar tu perfil. Hasta
        entonces no apareceras en el buscador ni podras abrir historias clinicas.
      </p>

      {SLOTS.map((slot) => {
        const doc = docs.find((d) => d.docType === slot.type);
        const isBusy = busy === slot.type;
        const err = errors[slot.type];

        return (
          <div key={slot.type} className={`doc-slot ${doc ? 'doc-slot--done' : ''}`}>
            <div className="doc-slot__info">
              <p className="doc-slot__label">
                {slot.label}
                {slot.required && <span className="doc-slot__req"> *</span>}
              </p>
              <p className="doc-slot__hint">{slot.hint}</p>

              {doc && (
                <p className="doc-slot__file">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {doc.originalName} · {humanSize(doc.sizeBytes)}
                </p>
              )}

              {err && <p className="doc-slot__error">{err}</p>}
            </div>

            <div className="doc-slot__actions">
              <label className="doc-slot__btn">
                {isBusy ? 'Subiendo...' : doc ? 'Reemplazar' : 'Seleccionar'}
                <input
                  type="file"
                  accept={ACCEPTED.join(',')}
                  disabled={isBusy}
                  onChange={(e) => {
                    handleFile(slot.type, e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
              {doc && !isBusy && (
                <button
                  type="button"
                  className="doc-slot__remove"
                  onClick={() => handleRemove(slot.type)}
                  aria-label={`Quitar ${slot.label}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const REQUIRED_DOC_TYPES: DocType[] = SLOTS.filter((s) => s.required).map((s) => s.type);

export default DocumentUpload;
