-- ============================================================================
-- Comision de plataforma (5%) sobre pagos por Nequi.
--
-- Cada pago se divide en dos transferencias Nequi:
--   * 95% al psicologo   (psychologists.phone)
--   * 5%  a Vida Sabia   (+573184726151)
--
-- El monto, la comision y el telefono del psicologo se calculan en el servidor
-- a partir de la cita; el cliente solo aporta las referencias de las dos
-- transferencias. payment_transactions sigue siendo de solo escritura para
-- service_role / funciones security definer.
-- ============================================================================

alter table public.payment_transactions
  add column if not exists platform_fee numeric(12, 2),
  add column if not exists psychologist_amount numeric(12, 2),
  add column if not exists platform_phone varchar(20),
  add column if not exists commission_reference varchar(100),
  add column if not exists commission_status varchar(20) not null default 'pending';

comment on column public.payment_transactions.platform_fee is 'Comision de Vida Sabia (5% del monto de la cita).';
comment on column public.payment_transactions.psychologist_amount is 'Monto que recibe el psicologo (95%).';
comment on column public.payment_transactions.commission_reference is 'Referencia Nequi de la transferencia de la comision.';

create or replace function public.register_nequi_payment(
  p_appointment_id uuid,
  p_psychologist_reference text,
  p_commission_reference text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_appt record;
  v_phone text;
  v_fee numeric(12, 2);
  v_tx_id uuid;
  c_rate constant numeric := 0.05;
  c_platform_phone constant text := '573184726151';
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  if coalesce(trim(p_psychologist_reference), '') = '' or coalesce(trim(p_commission_reference), '') = '' then
    raise exception 'Debes ingresar las dos referencias de pago';
  end if;

  select a.id, a.patient_id, a.psychologist_id, a.payment_amount, a.status
    into v_appt
    from public.appointments a
   where a.id = p_appointment_id
     and a.patient_id = v_uid
     for update;

  if not found then
    raise exception 'Cita no encontrada';
  end if;

  if v_appt.status <> 'pendiente_pago' then
    raise exception 'La cita ya no esta pendiente de pago';
  end if;

  if coalesce(v_appt.payment_amount, 0) <= 0 then
    raise exception 'La cita no tiene un monto valido';
  end if;

  select regexp_replace(coalesce(ps.phone, ''), '\D', '', 'g')
    into v_phone
    from public.psychologists ps
   where ps.id = v_appt.psychologist_id;

  if coalesce(v_phone, '') = '' then
    raise exception 'El psicologo no tiene un numero Nequi configurado';
  end if;

  v_fee := round(v_appt.payment_amount * c_rate);

  insert into public.payment_transactions (
    appointment_id, patient_id, psychologist_id, amount, currency,
    nequi_transaction_id, nequi_phone_number, status, payment_method,
    platform_fee, psychologist_amount, platform_phone, commission_reference
  ) values (
    v_appt.id, v_uid, v_appt.psychologist_id, v_appt.payment_amount, 'COP',
    trim(p_psychologist_reference), v_phone, 'processing', 'nequi',
    v_fee, v_appt.payment_amount - v_fee, c_platform_phone, trim(p_commission_reference)
  )
  returning id into v_tx_id;

  update public.appointments
     set payment_method = 'nequi',
         payment_reference = trim(p_psychologist_reference),
         payment_status = 'procesando',
         status = 'confirmada',
         updated_at = now()
   where id = v_appt.id;

  return v_tx_id;
end;
$$;

revoke all on function public.register_nequi_payment(uuid, text, text) from public, anon;
grant execute on function public.register_nequi_payment(uuid, text, text) to authenticated;
