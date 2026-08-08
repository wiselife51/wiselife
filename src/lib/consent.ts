import { supabase } from './supabase';

/**
 * Autorizacion de tratamiento de datos personales (Ley 1581/2012).
 *
 * Cada aceptacion se guarda como un evento en `consent_events`, que es
 * append-only: nunca se actualiza ni se borra un consentimiento, se anade uno
 * nuevo. Eso permite demostrar que autorizo el titular y cuando, que es lo que
 * exige la norma.
 *
 * Al cambiar el texto legal hay que subir CONSENT_VERSION. Los eventos viejos
 * conservan la version que el usuario acepto de verdad.
 */
export const CONSENT_VERSION = '2026-08-v1';

export type ConsentType = 'data_treatment' | 'informed_consent';

export const DATA_TREATMENT_SUMMARY =
  'Autorizo a Vida Sabia a recolectar, almacenar y tratar mis datos personales, ' +
  'incluidos datos sensibles de salud, con la finalidad de prestarme servicios de ' +
  'atencion psicologica, gestionar mis citas y cumplir las obligaciones legales ' +
  'aplicables. Conozco que puedo consultar, actualizar, rectificar y suprimir mis ' +
  'datos, y revocar esta autorizacion, escribiendo a Vida Sabia.';

export const DATA_TREATMENT_POINTS = [
  'Tus datos de salud son sensibles y solo los trata el psicologo que te atiende.',
  'Los usamos para agendar y prestar la atencion, y para lo que exija la ley.',
  'No los compartimos con terceros para fines comerciales.',
  'Puedes consultarlos, corregirlos o pedir que los eliminemos cuando quieras.',
  'Puedes revocar esta autorizacion, salvo cuando la ley obligue a conservarlos.',
];

interface RecordConsentArgs {
  /** id del titular: coincide con auth.uid() y con profiles.id */
  userId: string;
  type?: ConsentType;
  accepted: boolean;
  /** contexto libre: en que pantalla se acepto, user agent, etc. */
  metadata?: Record<string, unknown>;
}

/**
 * Registra el consentimiento. Devuelve un mensaje de error o null.
 *
 * No lanza: el llamador decide si un fallo aqui debe bloquear el registro.
 * La policy `consent_events_patient_insert` exige patient_id = actor_id =
 * auth.uid(), asi que solo el propio titular puede registrar el suyo.
 */
export async function recordConsent({
  userId,
  type = 'data_treatment',
  accepted,
  metadata = {},
}: RecordConsentArgs): Promise<string | null> {
  const { error } = await supabase.from('consent_events').insert({
    patient_id: userId,
    actor_id: userId,
    consent_type: type,
    version: CONSENT_VERSION,
    accepted,
    source: 'web',
    metadata: {
      ...metadata,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    },
  });

  return error ? error.message : null;
}

/** Indica si el usuario ya acepto la version vigente del tratamiento de datos. */
export async function hasCurrentConsent(userId: string, type: ConsentType = 'data_treatment') {
  const { data } = await supabase
    .from('consent_events')
    .select('id')
    .eq('patient_id', userId)
    .eq('consent_type', type)
    .eq('version', CONSENT_VERSION)
    .eq('accepted', true)
    .limit(1);

  return Boolean(data && data.length > 0);
}
