-- VIDA SABIA - Database Schema

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  role text default 'patient' check (role in ('patient', 'psychologist', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- 2. PSYCHOLOGISTS TABLE
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
  available boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.psychologists enable row level security;

create policy "psychologists_select_all" on public.psychologists for select to authenticated using (true);
create policy "psychologists_insert_own" on public.psychologists for insert with check (auth.uid() = user_id);
create policy "psychologists_update_own" on public.psychologists for update using (auth.uid() = user_id);

-- 3. APPOINTMENTS TABLE
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.profiles(id) on delete cascade not null,
  psychologist_id uuid references public.psychologists(id) on delete cascade not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  session_type text default 'online' check (session_type in ('online', 'in_person')),
  notes text,
  price decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

alter table public.appointments enable row level security;

create policy "appointments_select_own" on public.appointments for select using (auth.uid() = patient_id);
create policy "appointments_insert_own" on public.appointments for insert with check (auth.uid() = patient_id);
create policy "appointments_update_own" on public.appointments for update using (auth.uid() = patient_id);

-- 4. REVIEWS TABLE
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.profiles(id) on delete cascade not null,
  psychologist_id uuid references public.psychologists(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;

create policy "reviews_select_all" on public.reviews for select to authenticated using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = patient_id);

-- 5. Auto-create profile trigger
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
