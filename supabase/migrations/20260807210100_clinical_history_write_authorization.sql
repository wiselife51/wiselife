-- ============================================================================
-- Autorizacion de escritura sobre la historia clinica.
--
-- Problema: las policies de `clinical_records` y `session_notes` definidas en
-- database/sprint1_clinical_history_schema.sql son `FOR ALL` con solo `USING`
-- y sin `TO`. Cuando una policy ALL no declara `WITH CHECK`, Postgres reutiliza
-- la expresion de `USING` para validar la fila escrita, y esa expresion solo
-- comprueba `psychologist_id`, nunca `patient_id`.
--
-- Consecuencia: un psicologo podia INSERTar o UPDATEar una historia clinica
-- (diagnostico CIE-10, nivel de riesgo suicida, consentimientos) contra
-- cualquier `patient_id` del sistema, sin haberlo atendido jamas.
--
-- Solucion: policies explicitas por operacion, `TO authenticated`, con
-- `WITH CHECK` que exige tres cosas para escribir:
--   1. que el psicologo sea el usuario actual,
--   2. que este verificado (20260807210000),
--   3. que exista relacion asistencial real con ese paciente.
--
-- Requiere 20260807210000_psychologist_verification.sql. Idempotente.
-- ============================================================================

-- Psicologo del usuario actual, ya verificado. Centraliza el gate para que
-- anadir una tabla clinica nueva no implique repetir la condicion.
create or replace function private.current_verified_psychologist_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
    from public.psychologists
   where user_id = (select auth.uid())
     and verification_status = 'approved';
$$;

revoke all on function private.current_verified_psychologist_ids() from public;
grant execute on function private.current_verified_psychologist_ids() to authenticated;

-- ----------------------------------------------------------------------------
-- clinical_records
-- ----------------------------------------------------------------------------

alter table public.clinical_records enable row level security;

drop policy if exists "Psychologists access own clinical records" on public.clinical_records;
drop policy if exists clinical_records_select_own on public.clinical_records;
drop policy if exists clinical_records_insert_own on public.clinical_records;
drop policy if exists clinical_records_update_own on public.clinical_records;
drop policy if exists clinical_records_delete_own on public.clinical_records;

-- La lectura no exige verificacion vigente: si a un psicologo se le revoca la
-- aprobacion, debe seguir pudiendo consultar lo que ya escribio, pero no anadir
-- nada nuevo.
create policy clinical_records_select_own on public.clinical_records
  for select to authenticated
  using (
    psychologist_id in (select id from public.psychologists where user_id = (select auth.uid()))
  );

create policy clinical_records_insert_own on public.clinical_records
  for insert to authenticated
  with check (
    psychologist_id in (select private.current_verified_psychologist_ids())
    and exists (
      select 1
        from public.appointments a
       where a.psychologist_id = clinical_records.psychologist_id
         and a.patient_id = clinical_records.patient_id
    )
  );

create policy clinical_records_update_own on public.clinical_records
  for update to authenticated
  using (
    psychologist_id in (select private.current_verified_psychologist_ids())
  )
  with check (
    psychologist_id in (select private.current_verified_psychologist_ids())
    and exists (
      select 1
        from public.appointments a
       where a.psychologist_id = clinical_records.psychologist_id
         and a.patient_id = clinical_records.patient_id
    )
  );

-- Se conserva DELETE para no alterar el comportamiento actual mas alla del
-- alcance pedido. PENDIENTE DE DECISION: la Resolucion 1995/1999 exige
-- conservacion de la historia clinica, asi que esta policy probablemente deba
-- eliminarse y sustituirse por un borrado logico.
create policy clinical_records_delete_own on public.clinical_records
  for delete to authenticated
  using (
    psychologist_id in (select private.current_verified_psychologist_ids())
  );

-- ----------------------------------------------------------------------------
-- session_notes
--
-- Vinculo mas fuerte: la nota referencia `appointment_id NOT NULL`, asi que se
-- exige que esa cita concreta pertenezca al par (paciente, psicologo) de la
-- fila, y que la historia clinica de la que cuelga sea del mismo par. Impide
-- colgar una nota de la cita o del expediente de otro.
-- ----------------------------------------------------------------------------

alter table public.session_notes enable row level security;

drop policy if exists "Psychologists access own session notes" on public.session_notes;
drop policy if exists session_notes_select_own on public.session_notes;
drop policy if exists session_notes_insert_own on public.session_notes;
drop policy if exists session_notes_update_own on public.session_notes;
drop policy if exists session_notes_delete_own on public.session_notes;

create policy session_notes_select_own on public.session_notes
  for select to authenticated
  using (
    psychologist_id in (select id from public.psychologists where user_id = (select auth.uid()))
  );

create policy session_notes_insert_own on public.session_notes
  for insert to authenticated
  with check (
    psychologist_id in (select private.current_verified_psychologist_ids())
    and exists (
      select 1
        from public.appointments a
       where a.id = session_notes.appointment_id
         and a.psychologist_id = session_notes.psychologist_id
         and a.patient_id = session_notes.patient_id
    )
    and exists (
      select 1
        from public.clinical_records cr
       where cr.id = session_notes.clinical_record_id
         and cr.psychologist_id = session_notes.psychologist_id
         and cr.patient_id = session_notes.patient_id
    )
  );

create policy session_notes_update_own on public.session_notes
  for update to authenticated
  using (
    psychologist_id in (select private.current_verified_psychologist_ids())
  )
  with check (
    psychologist_id in (select private.current_verified_psychologist_ids())
    and exists (
      select 1
        from public.appointments a
       where a.id = session_notes.appointment_id
         and a.psychologist_id = session_notes.psychologist_id
         and a.patient_id = session_notes.patient_id
    )
  );

create policy session_notes_delete_own on public.session_notes
  for delete to authenticated
  using (
    psychologist_id in (select private.current_verified_psychologist_ids())
  );

-- ----------------------------------------------------------------------------
-- cie10_codes: el catalogo tampoco deberia estar abierto a cualquiera que se
-- auto-declare psicologo. Se mantiene la lectura, pero exigiendo verificacion.
-- ----------------------------------------------------------------------------

drop policy if exists "Psychologists can read CIE-10 codes" on public.cie10_codes;
drop policy if exists cie10_codes_read_verified on public.cie10_codes;
create policy cie10_codes_read_verified on public.cie10_codes
  for select to authenticated
  using (exists (select 1 from private.current_verified_psychologist_ids()));
