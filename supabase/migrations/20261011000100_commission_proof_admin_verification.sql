-- Comprobante de la comision de la plataforma: el psicologo adjunta la foto de
-- la transferencia y la comision queda "reportada" (en verificacion) hasta que
-- un administrador la verifique o la rechace.

alter table public.appointments
  add column if not exists commission_proof_path text,
  add column if not exists commission_review_note text;

alter table public.appointments drop constraint if exists appointments_commission_status_check;
alter table public.appointments
  add constraint appointments_commission_status_check
  check (commission_status in ('no_aplica', 'pendiente', 'reportada', 'verificada'));

-- Bucket privado para los comprobantes de comision (carpeta = auth.uid() del psicologo).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('commission-proofs', 'commission-proofs', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists commission_proofs_insert_own on storage.objects;
create policy commission_proofs_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'commission-proofs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists commission_proofs_select on storage.objects;
create policy commission_proofs_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'commission-proofs'
    and (
      private.has_app_role('admin')
      or (storage.foldername(name))[1] = (select auth.uid())::text
    )
  );

create or replace function public.appointments_commission_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_is_psy boolean;
  v_is_admin boolean;
begin
  if tg_op = 'INSERT' then
    new.commission_amount := null;
    new.commission_status := 'no_aplica';
    new.commission_reference := null;
    new.payment_proof_path := null;
    new.commission_proof_path := null;
    new.commission_review_note := null;
    return new;
  end if;

  v_is_psy := exists (
    select 1 from public.psychologists p
    where p.id = new.psychologist_id and p.user_id = v_uid
  );

  v_is_admin := v_uid is not null and exists (
    select 1 from public.user_roles r
    where r.user_id = v_uid and r.role_code = 'admin'
  );

  if v_uid is not null and not v_is_psy then
    new.commission_amount := old.commission_amount;
    new.commission_reference := old.commission_reference;
    new.commission_proof_path := old.commission_proof_path;

    -- Solo el administrador revisa: reportada -> verificada | pendiente (rechazada).
    if v_is_admin
       and old.commission_status = 'reportada'
       and new.commission_status in ('verificada', 'pendiente') then
      if new.commission_status = 'pendiente' then
        new.commission_proof_path := null;
        new.commission_reference := null;
      end if;
    else
      new.commission_status := old.commission_status;
      new.commission_review_note := old.commission_review_note;
    end if;

    if new.payment_status = 'pagado' and old.payment_status is distinct from 'pagado' then
      new.payment_status := old.payment_status;
    end if;
    return new;
  end if;

  if v_is_psy then
    new.commission_amount := old.commission_amount;
    new.commission_review_note := old.commission_review_note;

    if old.commission_status = 'no_aplica' then
      new.commission_status := 'no_aplica';
      new.commission_reference := old.commission_reference;
      new.commission_proof_path := old.commission_proof_path;
    elsif old.commission_status = 'pendiente' and new.commission_status = 'reportada' then
      if new.commission_proof_path is null or length(trim(new.commission_proof_path)) = 0 then
        raise exception 'Debes adjuntar la foto del comprobante de la comision';
      end if;
      new.commission_review_note := null;
    else
      new.commission_status := old.commission_status;
      new.commission_reference := old.commission_reference;
      new.commission_proof_path := old.commission_proof_path;
    end if;
  end if;

  if new.commission_status = 'no_aplica'
     and coalesce(new.payment_amount, 0) > 0
     and new.status <> 'cancelada'
     and (
       (new.payment_status = 'pagado' and old.payment_status is distinct from 'pagado')
       or (new.attended_at is not null and old.attended_at is null)
       or (new.status = 'completada' and old.status is distinct from 'completada')
     ) then
    new.commission_status := 'pendiente';
    new.commission_amount := round(new.payment_amount * 0.05);
  end if;

  return new;
end;
$$;

-- Lista para el panel admin (el admin no tiene RLS sobre citas ajenas).
create or replace function public.admin_list_commission_reviews()
returns table (
  id uuid,
  appointment_date text,
  payment_amount numeric,
  commission_amount numeric,
  commission_status text,
  commission_reference text,
  commission_proof_path text,
  commission_review_note text,
  psychologist_name text,
  patient_name text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_app_role('admin') then
    raise exception 'Solo administradores';
  end if;

  return query
    select a.id,
           a.appointment_date::text,
           a.payment_amount,
           a.commission_amount,
           a.commission_status,
           a.commission_reference,
           a.commission_proof_path,
           a.commission_review_note,
           ps.full_name::text,
           pa.full_name::text
    from public.appointments a
    left join public.psychologists ps on ps.id = a.psychologist_id
    left join public.patients pa on pa.id = a.patient_id
    where a.commission_status in ('reportada', 'verificada')
    order by (a.commission_status = 'reportada') desc, a.appointment_date desc;
end;
$$;

create or replace function public.admin_review_commission(
  p_appointment_id uuid,
  p_approve boolean,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_app_role('admin') then
    raise exception 'Solo administradores';
  end if;

  if not p_approve and (p_note is null or length(trim(p_note)) = 0) then
    raise exception 'Indica el motivo del rechazo';
  end if;

  update public.appointments
     set commission_status = case when p_approve then 'verificada' else 'pendiente' end,
         commission_review_note = case when p_approve then null else trim(p_note) end
   where id = p_appointment_id
     and commission_status = 'reportada';

  if not found then
    raise exception 'La comision no esta en verificacion';
  end if;
end;
$$;

revoke all on function public.admin_list_commission_reviews() from public, anon;
revoke all on function public.admin_review_commission(uuid, boolean, text) from public, anon;
grant execute on function public.admin_list_commission_reviews() to authenticated;
grant execute on function public.admin_review_commission(uuid, boolean, text) to authenticated;
