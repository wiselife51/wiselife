-- ============================================================================
-- Comprobacion posterior a aplicar las migraciones.
--
-- Ejecutar en el SQL Editor de Supabase DESPUES de:
--   20260807000100_wiselife_data_architecture.sql
--   20260807210000_psychologist_verification.sql
--   20260807210100_clinical_history_write_authorization.sql
--
-- Todas las filas deben salir con estado OK. No modifica nada.
-- ============================================================================

with checks as (

  -- Tablas que deben existir tras 20260807000100
  select 'tabla app_roles' as item,
         (to_regclass('public.app_roles') is not null) as ok
  union all select 'tabla user_roles',
         to_regclass('public.user_roles') is not null
  union all select 'tabla consent_events',
         to_regclass('public.consent_events') is not null
  union all select 'esquema private',
         exists (select 1 from information_schema.schemata where schema_name = 'private')
  union all select 'funcion private.has_app_role',
         exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname = 'private' and p.proname = 'has_app_role')

  -- Tras 20260807210000
  union all select 'columna psychologists.verification_status',
         exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'psychologists'
                   and column_name = 'verification_status')
  union all select 'tabla psychologist_documents',
         to_regclass('public.psychologist_documents') is not null
  union all select 'trigger anti auto-aprobacion',
         exists (select 1 from pg_trigger
                 where tgname = 'trg_guard_psychologist_verification' and not tgisinternal)
  union all select 'bucket psychologist-documents',
         exists (select 1 from storage.buckets where id = 'psychologist-documents')
  union all select 'bucket es privado',
         exists (select 1 from storage.buckets
                 where id = 'psychologist-documents' and public = false)
  union all select 'psicologos existentes aprobados',
         not exists (select 1 from public.psychologists where verification_status <> 'approved')

  -- Tras 20260807210100
  union all select 'funcion current_verified_psychologist_ids',
         exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname = 'private' and p.proname = 'current_verified_psychologist_ids')
  union all select 'policy insert de clinical_records con WITH CHECK',
         exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'clinical_records'
                   and policyname = 'clinical_records_insert_own'
                   and with_check is not null)
  union all select 'policy insert de session_notes con WITH CHECK',
         exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'session_notes'
                   and policyname = 'session_notes_insert_own'
                   and with_check is not null)
  union all select 'policy FOR ALL antigua eliminada (clinical_records)',
         not exists (select 1 from pg_policies
                     where schemaname = 'public' and tablename = 'clinical_records'
                       and policyname = 'Psychologists access own clinical records')
  union all select 'policy FOR ALL antigua eliminada (session_notes)',
         not exists (select 1 from pg_policies
                     where schemaname = 'public' and tablename = 'session_notes'
                       and policyname = 'Psychologists access own session notes')

  -- Hallazgo critico de la auditoria: policies de pagos abiertas a anon.
  -- No lo corrige ninguna migracion todavia; se reporta para no olvidarlo.
  union all select 'AVISO: policies abiertas en payment_transactions',
         not exists (select 1 from pg_policies
                     where schemaname = 'public' and tablename = 'payment_transactions'
                       and (qual = 'true' or with_check = 'true')
                       and (roles = '{public}' or roles = '{anon,authenticated}'))
)
select item,
       case when ok then 'OK' else 'REVISAR' end as estado
  from checks
 order by ok, item;

-- Recordatorio: para habilitar al primer administrador,
--   insert into public.user_roles (user_id, role_code)
--   values ('<uuid del usuario>', 'admin');
-- El uuid se obtiene de: select id, email from auth.users order by created_at desc;
