-- Pago directo al psicologo con comprobante y comision del 5% a la plataforma.

alter table public.appointments
  add column if not exists payment_proof_path text,
  add column if not exists commission_amount numeric,
  add column if not exists commission_status text not null default 'no_aplica',
  add column if not exists commission_reference text;

alter table public.appointments drop constraint if exists appointments_commission_status_check;
alter table public.appointments
  add constraint appointments_commission_status_check
  check (commission_status in ('no_aplica', 'pendiente', 'reportada'));

create index if not exists appointments_commission_idx
  on public.appointments (psychologist_id, commission_status)
  where commission_status <> 'no_aplica';

-- Guard: el paciente no puede confirmar pagos ni tocar la comision; el
-- psicologo solo puede avanzar la comision (pendiente -> reportada).
create or replace function public.appointments_commission_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_is_psy boolean;
begin
  if tg_op = 'INSERT' then
    new.commission_amount := null;
    new.commission_status := 'no_aplica';
    new.commission_reference := null;
    new.payment_proof_path := null;
    return new;
  end if;

  v_is_psy := exists (
    select 1 from public.psychologists p
    where p.id = new.psychologist_id and p.user_id = v_uid
  );

  if v_uid is not null and not v_is_psy then
    new.commission_amount := old.commission_amount;
    new.commission_status := old.commission_status;
    new.commission_reference := old.commission_reference;
    if new.payment_status = 'pagado' and old.payment_status is distinct from 'pagado' then
      new.payment_status := old.payment_status;
    end if;
    return new;
  end if;

  if v_is_psy then
    if old.commission_status = 'no_aplica' then
      new.commission_status := 'no_aplica';
      new.commission_amount := old.commission_amount;
      new.commission_reference := old.commission_reference;
    else
      new.commission_amount := old.commission_amount;
      if not (old.commission_status = 'pendiente' and new.commission_status = 'reportada') then
        new.commission_status := old.commission_status;
      end if;
      if new.commission_status <> 'reportada' then
        new.commission_reference := old.commission_reference;
      end if;
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

drop trigger if exists appointments_commission_guard_trg on public.appointments;
create trigger appointments_commission_guard_trg
  before insert or update on public.appointments
  for each row execute function public.appointments_commission_guard();

-- Comision para citas ya pagadas o atendidas.
update public.appointments
set commission_status = 'pendiente',
    commission_amount = round(payment_amount * 0.05)
where commission_status = 'no_aplica'
  and coalesce(payment_amount, 0) > 0
  and status <> 'cancelada'
  and (payment_status = 'pagado' or attended_at is not null or status = 'completada');

-- El paciente registra el comprobante y la cita pasa a "procesando".
create or replace function public.submit_payment_proof(p_appointment_id uuid, p_path text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;
  if p_path is null or position(v_uid::text || '/' in p_path) <> 1 then
    raise exception 'Ruta de comprobante invalida';
  end if;

  update public.appointments
  set payment_proof_path = p_path,
      payment_method = 'nequi',
      payment_status = 'procesando',
      updated_at = now()
  where id = p_appointment_id
    and patient_id = v_uid
    and status = 'pendiente_pago';

  if not found then
    raise exception 'Cita no encontrada o no admite pago';
  end if;
end;
$$;

revoke all on function public.submit_payment_proof(uuid, text) from public, anon;
grant execute on function public.submit_payment_proof(uuid, text) to authenticated;

-- Bucket privado para comprobantes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "payment_proofs_insert_own" on storage.objects;
create policy "payment_proofs_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "payment_proofs_update_own" on storage.objects;
create policy "payment_proofs_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "payment_proofs_select" on storage.objects;
create policy "payment_proofs_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1
        from public.appointments a
        join public.psychologists p on p.id = a.psychologist_id
        where a.payment_proof_path = storage.objects.name
          and p.user_id = (select auth.uid())
      )
    )
  );
