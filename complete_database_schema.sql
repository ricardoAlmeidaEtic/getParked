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

-- Remover triggers existentes
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;

-- Remover funções existentes
drop function if exists public.handle_new_user();
drop function if exists public.handle_user_update();

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

-- Habilitar RLS para profiles
alter table profiles enable row level security;

-- Políticas de segurança para profiles
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

-- Função para criar perfil automaticamente (FIXED: includes admin role)
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
  return new;
end;
$$;

-- Trigger para criar perfil automaticamente
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Função para atualizar perfil quando usuário é atualizado
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

-- Trigger para atualizar perfil quando usuário é atualizado
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();

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

-- Índices para public_spot_markers
create index idx_public_spot_markers_user_id on public_spot_markers(user_id);
create index idx_public_spot_markers_status on public_spot_markers(status);
create index idx_public_spot_markers_expires_at on public_spot_markers(expires_at);

-- Trigger function para atualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar updated_at automaticamente
create trigger update_public_spot_markers_updated_at
  before update on public_spot_markers
  for each row
  execute function update_updated_at_column();

-- Trigger para atualizar updated_at automaticamente
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- Trigger function para dar créditos ao criador quando a vaga for validada
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

-- Trigger
create trigger trg_reward_creator
after update on public_spots
for each row
when (NEW.is_validated = true and OLD.is_validated = false)
execute procedure reward_creator_on_validation();

-- Políticas de segurança RLS para public_spots
alter table public_spots enable row level security;

create policy "Creator can read their own public spots"
on public_spots
for select
using (auth.uid() = creator_id);

create policy "Users can create public spots"
on public_spots
for insert
with check (auth.uid() = creator_id);

create policy "Another user can validate public spots"
on public_spots
for update
using (auth.uid() != creator_id)
with check (is_validated = true and validator_id = auth.uid());

-- Políticas de segurança RLS para public_spot_markers
alter table public_spot_markers enable row level security;

create policy "Usuários podem ver todas as vagas públicas não expiradas"
on public_spot_markers for select
using (expires_at > timezone('utc'::text, now()));

create policy "Usuários autenticados podem criar vagas públicas"
on public_spot_markers for insert
with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias vagas"
on public_spot_markers for update
using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias vagas"
on public_spot_markers for delete
using (auth.uid() = user_id);

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

-- Inserindo os planos
insert into plans (name, price, search_limit, vehicle_limit, allow_reservations, realtime_navigation, priority_support)
values
  ('Gratuito', 0, 3, 1, false, false, false),
  ('Premium', 12.99, 50, 3, true, true, true);

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

-- Função para atualizar o status das vagas expiradas
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

-- Política para permitir que a função seja executada por qualquer usuário autenticado
grant execute on function update_expired_spot_markers() to authenticated;

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

-- Índices para private_parking_markers
create index idx_private_parking_markers_parking_id on private_parking_markers(parking_id);
create index idx_private_parking_markers_parking_name on private_parking_markers(parking_name);

-- Políticas de segurança RLS para private_parking_markers
alter table private_parking_markers enable row level security;

create policy "Users can view all private parking markers"
on private_parking_markers for select
using (true);

create policy "Authenticated users can create private parking markers"
on private_parking_markers for insert
with check (auth.role() = 'authenticated');

create policy "Parking owners can update their markers"
on private_parking_markers for update
using (parking_id in (
  select id from parkings where owner_id = auth.uid()
));

create policy "Parking owners can delete their markers"
on private_parking_markers for delete
using (parking_id in (
  select id from parkings where owner_id = auth.uid()
)); 