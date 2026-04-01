-- Ana Alexandre Atelier — Security Policies Update
-- Run this in the Supabase SQL Editor to enforce strict admin-only access

-- 1. Restrict 'obras' table
drop policy if exists "obras_auth_write" on obras;
create policy "obras_admin_all" on obras 
  for all using (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

-- 2. Restrict 'contactos' table read/update
drop policy if exists "contactos_auth_read" on contactos;
drop policy if exists "contactos_auth_update" on contactos;
create policy "contactos_admin_select" on contactos
  for select using (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');
create policy "contactos_admin_update" on contactos
  for update using (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

-- 3. Restrict 'newsletter' table read
drop policy if exists "newsletter_auth_read" on newsletter;
create policy "newsletter_admin_select" on newsletter
  for select using (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

-- 4. Restrict 'config_site' table write
drop policy if exists "config_auth_write" on config_site;
create policy "config_admin_all" on config_site
  for all using (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

-- 5. Restrict Storage 'obras' bucket
drop policy if exists "obras_images_auth_insert" on storage.objects;
drop policy if exists "obras_images_auth_delete" on storage.objects;

create policy "obras_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'obras' and auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

create policy "obras_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'obras' and auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');
