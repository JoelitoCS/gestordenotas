-- ============================================================
-- Migración: añadir priority y context a notes
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Añade columna priority con valor por defecto 'normal'
alter table public.notes
  add column if not exists priority text not null default 'normal'
  check (priority in ('normal', 'important', 'urgent'));

-- Añade columna context (texto libre, puede ser null)
alter table public.notes
  add column if not exists context text;

-- Índices para filtrar rápido
create index if not exists notes_priority_idx on public.notes(priority);
create index if not exists notes_context_idx on public.notes(context);
