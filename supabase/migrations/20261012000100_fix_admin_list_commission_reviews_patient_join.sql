-- La función admin_list_commission_reviews consultaba public.patients, que no existe.
-- appointments.patient_id referencia auth.users(id), igual que profiles.id, así que
-- el nombre del paciente se obtiene desde public.profiles.
create or replace function public.admin_list_commission_reviews()
returns table(
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
set search_path to ''
as $function$
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
    left join public.profiles pa on pa.id = a.patient_id
    where a.commission_status in ('reportada', 'verificada')
    order by (a.commission_status = 'reportada') desc, a.appointment_date desc;
end;
$function$;
