-- Apaga todas as tabelas na ordem correta para evitar conflitos de chave estrangeira
drop table if exists daily_searches cascade;
drop table if exists vehicles cascade;
drop table if exists user_subscriptions cascade;
drop table if exists plans cascade;
drop table if exists public_spots cascade;
drop table if exists reservations cascade;
drop table if exists spots cascade;
drop table if exists parkings cascade;
drop table if exists profiles cascade;
drop table if exists public_spot_markers cascade;
drop table if exists private_parking_markers cascade;

-- Remover triggers existentes do auth.users primeiro
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;

-- Remover funções existentes
drop function if exists public.handle_new_user();
drop function if exists public.handle_user_update();
drop function if exists public.reward_creator_on_validation();
drop function if exists public.update_expired_spot_markers();
drop function if exists public.update_available_spots_on_reservation();
drop function if exists public.update_updated_at_column();

-- Set timezone to Europe/Lisbon
ALTER DATABASE postgres SET timezone TO 'Europe/Lisbon';
SET TIME ZONE 'Europe/Lisbon';

-- Criar todas as tabelas primeiro
-- Tabela profiles (FIXED: includes admin role)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('client', 'owner', 'admin')) not null default 'client',
  full_name text not null,
  email text,
  credits integer default 0,
  plan text default 'Gratuito',
  profile_image text,
  join_date timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela parkings
create table parkings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  hourly_rate numeric,
  is_public boolean default false,
  created_at timestamp default now()
);

-- Tabela spots
create table spots (
  id uuid primary key default gen_random_uuid(),
  parking_id uuid references parkings(id) on delete cascade,
  number text,
  is_available boolean default true,
  is_reserved boolean default false,
  created_at timestamp default now()
);

-- Tabela reservations
create table reservations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id) on delete cascade,
  spot_id uuid references spots(id) on delete cascade,
  start_time timestamp not null,
  end_time timestamp not null,
  total_price numeric,
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  created_at timestamp default now()
);

-- Tabela public_spots
create table public_spots (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles(id) on delete cascade,
  validator_id uuid references profiles(id),
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  is_validated boolean default false,
  validated_at timestamp,
  created_at timestamp default now()
);

-- Tabela public_spot_markers
create table public_spot_markers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  type text not null default 'public',
  total_spots integer not null default 1,
  available_spots integer not null default 1,
  status text not null default 'active',
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '5 minutes') not null
);

-- Tabela de planos (gratuito e premium)
create table plans (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  price numeric not null,
  search_limit integer not null,
  vehicle_limit integer not null,
  allow_reservations boolean default false,
  realtime_navigation boolean default false,
  priority_support boolean default false
);

-- Tabela de assinaturas
create table user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan_id uuid references plans(id) on delete set null,
  subscribed_at timestamp default now(),
  renewed_at timestamp,
  expires_at timestamp
);

-- Tabela de veículos
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  plate text not null,
  model text,
  color text,
  created_at timestamp default now()
);

-- Tabela de buscas diárias
create table daily_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  searched_at timestamp default now()
);

-- Tabela private_parking_markers
create table private_parking_markers (
  id uuid primary key default gen_random_uuid(),
  parking_id uuid references parkings(id) on delete cascade,
  parking_name text,
  latitude double precision not null,
  longitude double precision not null,
  available_spots integer,
  opening_time time,
  closing_time time,
  phone text,
  created_at timestamp with time zone default now()
);

-- Criar índices após a criação das tabelas
create index idx_reservations_client_id on reservations(client_id);
create index idx_reservations_spot_id on reservations(spot_id);
create index idx_reservations_status on reservations(status);
create index idx_reservations_start_time on reservations(start_time);
create index idx_reservations_end_time on reservations(end_time);

create index idx_private_parking_markers_parking_id on private_parking_markers(parking_id);
create index idx_private_parking_markers_parking_name on private_parking_markers(parking_name);

create index idx_public_spot_markers_user_id on public_spot_markers(user_id);
create index idx_public_spot_markers_status on public_spot_markers(status);
create index idx_public_spot_markers_expires_at on public_spot_markers(expires_at);

-- Criar funções após a criação das tabelas
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create or replace function reward_creator_on_validation()
returns trigger as $$
begin
  if NEW.is_validated = true and OLD.is_validated = false then
    update profiles
    set credits = credits + 1
    where id = NEW.creator_id;
  end if;
  return NEW;
end;
$$ language plpgsql;

create or replace function update_expired_spot_markers()
returns void
language plpgsql
security definer
as $$
begin
  update public_spot_markers
  set 
    status = 'inactive',
    updated_at = timezone('utc'::text, now())
  where status = 'active'
  and expires_at <= timezone('utc'::text, now());
end;
$$;

create or replace function update_available_spots_on_reservation()
returns trigger as $$
begin
  update private_parking_markers
  set available_spots = available_spots - 1
  where parking_id = (
    select parking_id 
    from spots 
    where id = NEW.spot_id
  );
  return NEW;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  user_role text;
begin
  -- Obtém a role dos metadados ou usa 'client' como padrão
  user_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  
  -- Verifica se a role é válida (FIXED: includes admin)
  if user_role not in ('client', 'owner', 'admin') then
    user_role := 'client';
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    credits,
    plan,
    join_date,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    user_role,
    0,
    'Gratuito',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  -- Se for admin, atualiza o plano para Premium
  if user_role = 'admin' then
    update public.profiles
    set plan = 'Premium'
    where id = new.id;
  end if;

  return new;
end;
$$;

create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.profiles
  set 
    full_name = coalesce(new.raw_user_meta_data->>'full_name', full_name),
    email = coalesce(new.email, email),
    updated_at = timezone('utc'::text, now())
  where id = new.id;
  return new;
end;
$$;

-- Criar triggers após a criação das funções
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();

create trigger trg_reward_creator
  after update on public_spots
  for each row
  when (NEW.is_validated = true and OLD.is_validated = false)
  execute procedure reward_creator_on_validation();

create trigger update_public_spot_markers_updated_at
  before update on public_spot_markers
  for each row
  execute function update_updated_at_column();

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger trg_update_available_spots
  after insert on reservations
  for each row
  execute function update_available_spots_on_reservation();

-- Configurar RLS após a criação das tabelas
alter table profiles enable row level security;
alter table reservations enable row level security;
alter table public_spots enable row level security;
alter table public_spot_markers enable row level security;
alter table private_parking_markers enable row level security;
alter table spots enable row level security;

-- Disable RLS for admin dashboard tables
alter table parkings disable row level security;
alter table vehicles disable row level security;
alter table daily_searches disable row level security;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all public spot markers" ON public_spot_markers;
DROP POLICY IF EXISTS "Users can create public spot markers" ON public_spot_markers;
DROP POLICY IF EXISTS "Users can update their public spot markers" ON public_spot_markers;
DROP POLICY IF EXISTS "Users can delete their public spot markers" ON public_spot_markers;

DROP POLICY IF EXISTS "Users can view all private parking markers" ON private_parking_markers;
DROP POLICY IF EXISTS "Users can create private parking markers" ON private_parking_markers;
DROP POLICY IF EXISTS "Users can update their private parking markers" ON private_parking_markers;
DROP POLICY IF EXISTS "Users can delete their private parking markers" ON private_parking_markers;

-- Create policies for public_spot_markers
CREATE POLICY "Users can view all public spot markers"
  ON public_spot_markers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create public spot markers"
  ON public_spot_markers FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their public spot markers"
  ON public_spot_markers FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete their public spot markers"
  ON public_spot_markers FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    auth.uid() = user_id
  );

-- Create policies for private_parking_markers
CREATE POLICY "Users can view all private parking markers"
  ON private_parking_markers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create private parking markers"
  ON private_parking_markers FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM parkings
      WHERE id = parking_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their private parking markers"
  ON private_parking_markers FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM parkings
      WHERE id = parking_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their private parking markers"
  ON private_parking_markers FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM parkings
      WHERE id = parking_id
      AND owner_id = auth.uid()
    )
  );

-- Criar políticas RLS após habilitar RLS
create policy "Usuários podem ver seus próprios perfis"
  on profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seus próprios perfis"
  on profiles for update
  using (auth.uid() = id);

create policy "Usuários podem inserir seus próprios perfis"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Serviço pode criar perfis"
  on profiles for insert
  with check (true);

create policy "Parking owners can read profiles of clients with reservations"
  on profiles for select
  using (
    exists (
      select 1 from reservations r
      join spots s on s.id = r.spot_id
      join parkings p on p.id = s.parking_id
      where r.client_id = profiles.id
      and p.owner_id = auth.uid()
    )
  );

-- Drop existing policies for spots and reservations
DROP POLICY IF EXISTS "Users can view all spots" ON spots;
DROP POLICY IF EXISTS "Users can create spots" ON spots;
DROP POLICY IF EXISTS "Users can update spots" ON spots;
DROP POLICY IF EXISTS "Users can delete spots" ON spots;
DROP POLICY IF EXISTS "Usuários premium podem criar reservas" ON reservations;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias reservas" ON reservations;
DROP POLICY IF EXISTS "Admins podem ver todas as reservas" ON reservations;
DROP POLICY IF EXISTS "Parking owners can view reservations for their spots" ON reservations;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias reservas" ON reservations;
DROP POLICY IF EXISTS "Usuários podem cancelar suas próprias reservas" ON reservations;

-- Create simplified policies for spots
CREATE POLICY "Users can view all spots"
  ON spots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create spots"
  ON spots FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND plan = 'Premium'
    )
  );

CREATE POLICY "Users can update spots"
  ON spots FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND plan = 'Premium'
    )
  );

CREATE POLICY "Users can delete spots"
  ON spots FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND plan = 'Premium'
    )
  );

-- Drop existing policies for reservations
DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;

-- Create new policies for reservations
CREATE POLICY "Users can view their own reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Parking owners can view their spots' reservations"
  ON reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spots s
      JOIN parkings p ON s.parking_id = p.id
      WHERE s.id = reservations.spot_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own reservations"
  ON reservations FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Users can delete their own reservations"
  ON reservations FOR DELETE
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Inserir dados iniciais após criar todas as tabelas e políticas
insert into plans (name, price, search_limit, vehicle_limit, allow_reservations, realtime_navigation, priority_support)
values
  ('Gratuito', 0, 3, 1, false, false, false),
  ('Premium', 12.99, 50, 3, true, true, true);

-- Conceder permissões após criar todas as funções
grant execute on function update_expired_spot_markers() to authenticated; 