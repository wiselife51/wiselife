-- ============================================================================
-- Verificacion de licencia profesional antes de otorgar el rol de psicologo.
--
-- Problema: PsychologistOnboarding.tsx hace un upsert directo a `psychologists`
-- con `license_number` de texto libre. Cualquier usuario autenticado se
-- auto-declara psicologo y queda dentro del predicado
-- `select id from psychologists where user_id = auth.uid()`, que es el que usan
-- todas las policies de historia clinica. Es decir: registrarse basta para
-- obtener permisos clinicos.
--
-- Solucion: estado de verificacion controlado por administrador, documentos
-- soporte en Storage privado, y un trigger que impide que el propio psicologo
-- se apruebe. El gate sobre la historia clinica se aplica en la migracion
-- 20260807210100.
--
-- Reutiliza `private.has_app_role('admin')` y `public.user_roles` de
-- 20260807000100_wiselife_data_architecture.sql.
-- Idempotente.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Estado de verificacion en psychologists
-- ----------------------------------------------------------------------------

alter table public.psychologists
  add column if not exists verification_status text not null default 'pending',
  add column if not exists verification_submitted_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references auth.users(id) on delete set null,
  add column if not exists rejection_reason text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'psychologists_verification_status_ck'
  ) then
    alter table public.psychologists
      add constraint psychologists_verification_status_ck
      check (verification_status in ('pending', 'submitted', 'approved', 'rejected'));
  end if;
end $$;

comment on column public.psychologists.verification_status is
  'pending: sin documentos | submitted: documentos cargados, en revision | approved: habilitado para atender | rejected: rechazado';

create index if not exists psychologists_verification_status_idx
  on public.psychologists (verification_status);

-- Los psicologos que ya existian en produccion quedan aprobados. Sin esto, el
-- gate de la migracion siguiente les cortaria el acceso a sus propias
-- historias clinicas de inmediato.
update public.psychologists
   set verification_status = 'approved',
       verified_at = coalesce(verified_at, now())
 where verification_status = 'pending'
   and created_at < now();

-- ----------------------------------------------------------------------------
-- 2. Documentos soporte
-- ----------------------------------------------------------------------------

create table if not exists public.psychologist_documents (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.psychologists(id) on delete cascade,
  doc_type text not null,
  storage_path text not null unique,
  original_name text,
  mime_type text,
  size_bytes integer,
  uploaded_at timestamptz not null default now(),
  constraint psychologist_documents_type_ck
    check (doc_type in ('professional_license', 'id_document', 'diploma', 'other'))
);

create index if not exists psychologist_documents_psychologist_idx
  on public.psychologist_documents (psychologist_id, uploaded_at desc);

comment on table public.psychologist_documents is
  'Documentos que sustentan la verificacion profesional. El archivo vive en el bucket privado psychologist-documents; aqui solo la referencia.';

alter table public.psychologist_documents enable row level security;

drop policy if exists psychologist_documents_own_read on public.psychologist_documents;
create policy psychologist_documents_own_read on public.psychologist_documents
  for select to authenticated
  using (
    private.has_app_role('admin')
    or psychologist_id in (select id from public.psychologists where user_id = (select auth.uid()))
  );

drop policy if exists psychologist_documents_own_insert on public.psychologist_documents;
create policy psychologist_documents_own_insert on public.psychologist_documents
  for insert to authenticated
  with check (
    psychologist_id in (select id from public.psychologists where user_id = (select auth.uid()))
  );

-- Se permite borrar solo mientras la solicitud no este aprobada, para poder
-- corregir un documento mal subido.
drop policy if exists psychologist_documents_own_delete on public.psychologist_documents;
create policy psychologist_documents_own_delete on public.psychologist_documents
  for delete to authenticated
  using (
    private.has_app_role('admin')
    or psychologist_id in (
      select id from public.psychologists
      where user_id = (select auth.uid())
        and verification_status in ('pending', 'submitted', 'rejected')
    )
  );

-- ----------------------------------------------------------------------------
-- 3. Nadie se aprueba a si mismo
--
-- Las policies de `psychologists` no estan versionadas en el repo, asi que no
-- se pueden reescribir con seguridad. Un trigger protege las columnas de
-- verificacion sea cual sea la policy vigente.
-- ----------------------------------------------------------------------------

create or replace function private.guard_psychologist_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    -- Un alta nueva siempre nace pendiente, salvo que la haga un admin.
    if not private.has_app_role('admin') then
      new.verification_status := 'pending';
      new.verified_at := null;
      new.verified_by := null;
      new.rejection_reason := null;
    end if;
    return new;
  end if;

  if new.verification_status is distinct from old.verification_status
     or new.verified_at is distinct from old.verified_at
     or new.verified_by is distinct from old.verified_by
     or new.rejection_reason is distinct from old.rejection_reason
  then
    -- Excepcion acotada: el propio psicologo puede pasar de pending/rejected a
    -- submitted al terminar de cargar documentos. Nada mas.
    if private.has_app_role('admin') then
      return new;
    end if;

    if new.verification_status = 'submitted'
       and old.verification_status in ('pending', 'rejected')
       and new.verified_at is not distinct from old.verified_at
       and new.verified_by is not distinct from old.verified_by
    then
      return new;
    end if;

    raise exception 'Solo un administrador puede modificar el estado de verificacion profesional';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_psychologist_verification() from public;

drop trigger if exists trg_guard_psychologist_verification on public.psychologists;
create trigger trg_guard_psychologist_verification
  before insert or update on public.psychologists
  for each row execute function private.guard_psychologist_verification();

-- ----------------------------------------------------------------------------
-- 4. Bucket privado para los documentos
--
-- Convencion de ruta: <auth.uid()>/<doc_type>-<epoch>.<ext>
-- La primera carpeta es el uid, para que la policy pueda comprobar pertenencia.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('psychologist-documents', 'psychologist-documents', false)
on conflict (id) do nothing;

drop policy if exists psychologist_docs_own_insert on storage.objects;
create policy psychologist_docs_own_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'psychologist-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists psychologist_docs_own_read on storage.objects;
create policy psychologist_docs_own_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'psychologist-documents'
    and (
      private.has_app_role('admin')
      or (storage.foldername(name))[1] = (select auth.uid())::text
    )
  );

drop policy if exists psychologist_docs_own_delete on storage.objects;
create policy psychologist_docs_own_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'psychologist-documents'
    and (
      private.has_app_role('admin')
      or (storage.foldername(name))[1] = (select auth.uid())::text
    )
  );

-- ----------------------------------------------------------------------------
-- 5. Rol admin
--
-- No hace falta crearlo: 20260807000100 ya siembra 'admin' en public.app_roles.
-- Para habilitar al primer administrador, con service_role:
--
--   insert into public.user_roles (user_id, role_code)
--   values ('<uuid del usuario>', 'admin');
-- ----------------------------------------------------------------------------
