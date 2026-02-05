-- =============================================
-- VIDA SABIA - Database Schema
-- =============================================

-- 1. PROFILES TABLE (extends auth.users)
-- =============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  role text default 'patient' check (role in ('patient', 'psychologist', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);
create policy "profiles_select_public" on public.profiles for select using (role = 'psychologist');

-- 2. PSYCHOLOGISTS TABLE (extended profile for psychologists)
-- =============================================
create table if not exists public.psychologists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique,
  specialty text[] not null default '{}',
  license_number text not null,
  bio text,
  years_experience integer default 0,
  consultation_price decimal(10,2) not null default 150000,
  rating decimal(2,1) default 5.0,
  total_reviews integer default 0,
  languages text[] default array['Espanol'],
  available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.psychologists enable row level security;

create policy "psychologists_select_all" on public.psychologists for select to authenticated using (true);
create policy "psychologists_insert_own" on public.psychologists for insert with check (auth.uid() = user_id);
create policy "psychologists_update_own" on public.psychologists for update using (auth.uid() = user_id);

-- 3. AVAILABILITY TABLE (psychologist schedules)
-- =============================================
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid references public.psychologists(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday, 6=Saturday
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.availability enable row level security;

create policy "availability_select_all" on public.availability for select to authenticated using (true);
create policy "availability_manage_own" on public.availability for all using (
  psychologist_id in (select id from public.psychologists where user_id = auth.uid())
);

-- 4. APPOINTMENTS TABLE
-- =============================================
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.profiles(id) on delete cascade not null,
  psychologist_id uuid references public.psychologists(id) on delete cascade not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  session_type text default 'online' check (session_type in ('online', 'in_person')),
  notes text,
  price decimal(10,2) not null,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  meeting_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;

-- Patients can see their own appointments
create policy "appointments_select_patient" on public.appointments for select using (auth.uid() = patient_id);
-- Psychologists can see appointments assigned to them
create policy "appointments_select_psychologist" on public.appointments for select using (
  psychologist_id in (select id from public.psychologists where user_id = auth.uid())
);
-- Patients can create appointments
create policy "appointments_insert_patient" on public.appointments for insert with check (auth.uid() = patient_id);
-- Both can update their appointments
create policy "appointments_update_patient" on public.appointments for update using (auth.uid() = patient_id);
create policy "appointments_update_psychologist" on public.appointments for update using (
  psychologist_id in (select id from public.psychologists where user_id = auth.uid())
);

-- 5. REVIEWS TABLE
-- =============================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade unique not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  psychologist_id uuid references public.psychologists(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_anonymous boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

create policy "reviews_select_all" on public.reviews for select to authenticated using (true);
create policy "reviews_insert_patient" on public.reviews for insert with check (auth.uid() = patient_id);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = patient_id);

-- 6. TRIGGER: Auto-create profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'patient')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 7. TRIGGER: Update psychologist rating on new review
-- =============================================
create or replace function public.update_psychologist_rating()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.psychologists
  set 
    rating = (select avg(rating)::decimal(2,1) from public.reviews where psychologist_id = new.psychologist_id),
    total_reviews = (select count(*) from public.reviews where psychologist_id = new.psychologist_id),
    updated_at = now()
  where id = new.psychologist_id;
  
  return new;
end;
$$;

drop trigger if exists on_review_created on public.reviews;

create trigger on_review_created
  after insert on public.reviews
  for each row
  execute function public.update_psychologist_rating();

-- 8. INDEXES for performance
-- =============================================
create index if not exists idx_appointments_patient on public.appointments(patient_id);
create index if not exists idx_appointments_psychologist on public.appointments(psychologist_id);
create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_psychologists_specialty on public.psychologists using gin(specialty);
create index if not exists idx_availability_psychologist on public.availability(psychologist_id);
