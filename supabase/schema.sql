-- Ana Alexandre Atelier — Supabase Schema (idempotente — pode correr múltiplas vezes)
-- Run this in the Supabase SQL Editor

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Obras ─────────────────────────────────────────────────────────────────────
create table if not exists obras (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  titulo       text not null,
  tecnica      text not null,
  dimensoes    text,
  ano          integer,
  preco        numeric(10, 2),
  estado       text not null default 'disponivel'
               check (estado in ('disponivel', 'reservado', 'vendido')),
  descricao    text,
  imagem_url   text,
  slug         text unique,
  destaque     boolean not null default false,
  ordem        integer not null default 0
);

alter table obras enable row level security;
drop policy if exists "obras_public_read" on obras;
drop policy if exists "obras_auth_write" on obras;
create policy "obras_public_read" on obras for select using (true);
create policy "obras_auth_write" on obras for all using (auth.role() = 'authenticated');

-- ── Contactos ─────────────────────────────────────────────────────────────────
create table if not exists contactos (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  nome         text not null,
  email        text not null,
  telefone     text,
  assunto      text,
  mensagem     text not null,
  lido         boolean not null default false
);

alter table contactos enable row level security;
drop policy if exists "contactos_public_insert" on contactos;
drop policy if exists "contactos_auth_read" on contactos;
drop policy if exists "contactos_auth_update" on contactos;
create policy "contactos_public_insert" on contactos for insert with check (true);
create policy "contactos_auth_read" on contactos for select using (auth.role() = 'authenticated');
create policy "contactos_auth_update" on contactos for update using (auth.role() = 'authenticated');

-- ── Newsletter ────────────────────────────────────────────────────────────────
create table if not exists newsletter (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  email        text not null unique,
  ativo        boolean not null default true
);

alter table newsletter enable row level security;
drop policy if exists "newsletter_public_insert" on newsletter;
drop policy if exists "newsletter_public_update" on newsletter;
drop policy if exists "newsletter_auth_read" on newsletter;
create policy "newsletter_public_insert" on newsletter for insert with check (true);
create policy "newsletter_public_update" on newsletter for update using (true);
create policy "newsletter_auth_read" on newsletter for select using (auth.role() = 'authenticated');

-- ── Config Site ───────────────────────────────────────────────────────────────
create table if not exists config_site (
  id           uuid primary key default uuid_generate_v4(),
  chave        text not null unique,
  valor        text not null,
  updated_at   timestamptz not null default now()
);

alter table config_site enable row level security;
drop policy if exists "config_public_read" on config_site;
drop policy if exists "config_auth_write" on config_site;
create policy "config_public_read" on config_site for select using (true);
create policy "config_auth_write" on config_site for all using (auth.role() = 'authenticated');

-- ── Seed config defaults ──────────────────────────────────────────────────────
insert into config_site (chave, valor) values
  ('mentoria_preco_individual', '120'),
  ('mentoria_preco_grupo', '60'),
  ('mentoria_preco_online', '80'),
  ('email_contacto', 'atelier.anaalexandre@gmail.com')
on conflict (chave) do nothing;

-- ── Storage: bucket "obras" ───────────────────────────────────────────────────
-- (Criar bucket manualmente no Supabase Dashboard > Storage > New bucket > "obras")
-- Policies para permitir upload público (ou restrito a authenticated users)

-- Policy: qualquer pessoa pode ver imagens
drop policy if exists "obras_images_public_read" on storage.objects;
create policy "obras_images_public_read" on storage.objects
  for select using (bucket_id = 'obras');

-- Policy: utilizadores autenticados podem fazer upload
drop policy if exists "obras_images_auth_insert" on storage.objects;
create policy "obras_images_auth_insert" on storage.objects
  for insert with check (bucket_id = 'obras' and auth.role() = 'authenticated');

-- Policy: utilizadores autenticados podem eliminar
drop policy if exists "obras_images_auth_delete" on storage.objects;
create policy "obras_images_auth_delete" on storage.objects
  for delete using (bucket_id = 'obras' and auth.role() = 'authenticated');

-- ── Vendas (Encomendas) ───────────────────────────────────────────────────────
create table if not exists vendas (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  cliente_nome text not null,
  cliente_email text not null,
  cliente_tel  text,
  total        numeric(10, 2) not null,
  items        jsonb not null, -- Array de obras compradas {id, titulo, preco}
  morada       text,
  estado       text not null default 'pendente'
               check (estado in ('pendente', 'pago', 'enviado', 'cancelado')),
  stripe_id    text
);

alter table vendas enable row level security;
drop policy if exists "vendas_insert_public" on vendas;
drop policy if exists "vendas_read_auth" on vendas;
create policy "vendas_insert_public" on vendas for insert with check (true);
create policy "vendas_read_auth" on vendas for select using (auth.role() = 'authenticated');

-- ── Final Seed ────────────────────────────────────────────────────────────────
insert into config_site (chave, valor) values
  ('galeria_titulo', 'Galeria de Obras Originais'),
  ('hero_titulo', 'Onde a Natureza e a Arte se Encontram'),
  ('hero_subtitulo', 'Peças únicas que contam histórias através da terra e da luz.'),
  ('sobre_titulo', 'Ana Alexandre'),
  ('sobre_texto', 'Artista plástica, investigadora e docente na área das Belas Artes.'),
  ('mentoria_titulo', 'Mentoria Artística'),
  ('mentoria_desc', 'Programas de mentoria artística com Ana Alexandre.')
on conflict (chave) do nothing;
