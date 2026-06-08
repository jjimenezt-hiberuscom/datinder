-- ============================================================
-- Datinder — Script de migración Supabase
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================

create extension if not exists "pgcrypto";

-- 1. Sesiones
create table if not exists sesiones (
  id uuid primary key default gen_random_uuid(),
  nombre_evento text not null,
  codigo_acceso text unique not null,
  estado text not null default 'espera',
  -- 'espera' | 'jugando' | 'finalizado'
  pregunta_actual_id uuid,
  pausada boolean default false,
  created_at timestamptz default now()
);

-- 2. Preguntas
create table if not exists preguntas (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid references sesiones(id) on delete cascade,
  enunciado text not null,
  opcion_a text not null,
  opcion_b text not null,
  orden int not null,
  peso int not null default 1
);

-- 3. Usuarios
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid references sesiones(id) on delete cascade,
  nombre text not null,
  apellidos text,
  empresa text,
  cargo text,
  foto_url text,
  tipo text not null default 'invitado',
  -- 'linkedin' | 'invitado'
  expulsado boolean default false,
  created_at timestamptz default now()
);

-- 4. Respuestas
create table if not exists respuestas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id) on delete cascade,
  pregunta_id uuid references preguntas(id) on delete cascade,
  eleccion text not null,
  -- 'A' | 'B'
  created_at timestamptz default now(),
  unique (usuario_id, pregunta_id)
);

-- 5. Habilitar Realtime
alter publication supabase_realtime add table sesiones;
alter publication supabase_realtime add table usuarios;
alter publication supabase_realtime add table respuestas;
alter publication supabase_realtime add table preguntas;

-- 6. RLS básico (ajustar según necesidades de seguridad)
alter table sesiones enable row level security;
alter table preguntas enable row level security;
alter table usuarios enable row level security;
alter table respuestas enable row level security;

create policy "Allow all" on sesiones for all using (true);
create policy "Allow all" on preguntas for all using (true);
create policy "Allow all" on usuarios for all using (true);
create policy "Allow all" on respuestas for all using (true);
