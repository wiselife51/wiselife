create table if not exists public.psychologist_reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  psychologist_id uuid not null references public.psychologists(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  patient_display_name text not null default 'Paciente',
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 600),
  created_at timestamptz not null default now()
);

create index if not exists psychologist_reviews_psy_idx on public.psychologist_reviews (psychologist_id, created_at desc);
create index if not exists psychologist_reviews_patient_idx on public.psychologist_reviews (patient_id);

alter table public.psychologist_reviews enable row level security;

create policy "reviews_select_authenticated" on public.psychologist_reviews
  for select to authenticated using (true);

create policy "reviews_insert_own_attended" on public.psychologist_reviews
  for insert to authenticated
  with check (
    patient_id = (select auth.uid())
    and exists (
      select 1 from public.appointments a
      where a.id = appointment_id
        and a.patient_id = (select auth.uid())
        and a.psychologist_id = psychologist_reviews.psychologist_id
        and (a.status = 'completada' or a.attended_at is not null)
    )
  );

create view public.psychologist_rating_summary
with (security_invoker = on) as
  select psychologist_id,
         round(avg(rating)::numeric, 1) as rating_avg,
         count(*)::int as rating_count
  from public.psychologist_reviews
  group by psychologist_id;

grant select on public.psychologist_rating_summary to authenticated;
