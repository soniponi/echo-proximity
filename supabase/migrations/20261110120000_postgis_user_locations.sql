-- =====================================================================
-- Proximity con PostGIS + fix di sicurezza
--  * le posizioni passano da profiles (leggibile) a user_locations (privata)
--  * la ricerca usa auth.uid() e restituisce solo distanze arrotondate
--  * la visibilità scade lato server (TTL rinnovato dal client con heartbeat)
--  * rimossa la policy che permetteva a chiunque di creare match
-- =====================================================================

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Tabella posizioni (solo il proprietario può leggerla/scriverla)
-- ---------------------------------------------------------------------
create table if not exists public.user_locations (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  geog          extensions.geography(Point, 4326) not null,
  accuracy      real,
  updated_at    timestamptz not null default now(),
  visible_until timestamptz not null
);

create index if not exists user_locations_geog_idx
  on public.user_locations using gist (geog);
create index if not exists user_locations_visible_until_idx
  on public.user_locations (visible_until);

alter table public.user_locations enable row level security;

drop policy if exists "Users manage their own location" on public.user_locations;
create policy "Users manage their own location"
  on public.user_locations
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.user_locations from anon;

-- ---------------------------------------------------------------------
-- 2. Aggiornamento posizione (heartbeat). La visibilità dura 2 minuti:
--    se l'app crasha o va in background l'utente sparisce da solo.
-- ---------------------------------------------------------------------
create or replace function public.update_my_location(
  lat double precision,
  lng double precision,
  accuracy real default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if lat is null or lng is null
     or lat not between -90 and 90
     or lng not between -180 and 180 then
    raise exception 'Invalid coordinates';
  end if;

  insert into public.user_locations as ul (user_id, geog, accuracy, updated_at, visible_until)
  values (
    auth.uid(),
    st_setsrid(st_makepoint(lng, lat), 4326)::geography,
    update_my_location.accuracy,
    now(),
    now() + interval '2 minutes'
  )
  on conflict (user_id) do update
    set geog          = excluded.geog,
        accuracy      = excluded.accuracy,
        updated_at    = excluded.updated_at,
        visible_until = excluded.visible_until;
end;
$$;

create or replace function public.clear_my_location()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.user_locations where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- 3. Ricerca utenti vicini (sostituisce la vecchia versione che accettava
--    requesting_user_id dal client)
-- ---------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select oid::regprocedure as sig
    from pg_proc
    where proname = 'find_nearby_users'
      and pronamespace = 'public'::regnamespace
  loop
    execute 'drop function ' || r.sig;
  end loop;
end;
$$;

create function public.find_nearby_users(radius_meters integer default 100)
returns table (
  id              uuid,
  name            text,
  bio             text,
  photo           text,
  interests       text[],
  distance_meters integer,
  last_seen       timestamptz
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    p.id,
    p.name::text,
    coalesce(p.bio, '')::text,
    coalesce(p.photo, '')::text,
    coalesce(p.interests, '{}')::text[],
    (round(st_distance(other.geog, me.geog) / 10) * 10)::integer,  -- arrotondata a 10 m
    other.updated_at
  from public.user_locations me
  join public.user_locations other
    on other.user_id <> me.user_id
   and other.visible_until > now()
   and st_dwithin(other.geog, me.geog, least(greatest(radius_meters, 10), 500))
  join public.profiles p
    on p.id = other.user_id
  where me.user_id = auth.uid()
    and me.visible_until > now()   -- vedi gli altri solo se sei visibile anche tu
  order by 6
  limit 50;
$$;

-- ---------------------------------------------------------------------
-- 4. Permessi sulle funzioni: solo utenti autenticati
-- ---------------------------------------------------------------------
revoke all on function public.update_my_location(double precision, double precision, real) from public, anon;
revoke all on function public.clear_my_location() from public, anon;
revoke all on function public.find_nearby_users(integer) from public, anon;
grant execute on function public.update_my_location(double precision, double precision, real) to authenticated;
grant execute on function public.clear_my_location() to authenticated;
grant execute on function public.find_nearby_users(integer) to authenticated;

-- ---------------------------------------------------------------------
-- 5. Rimozione delle coordinate da profiles (erano leggibili da altri)
-- ---------------------------------------------------------------------
alter table public.profiles
  drop column if exists current_lat,
  drop column if exists current_lng,
  drop column if exists location_accuracy,
  drop column if exists location_updated_at;

-- ---------------------------------------------------------------------
-- 6. Fix sicurezza matches: i match si creano SOLO tramite handle_interest
--    (SECURITY DEFINER), mai con INSERT diretto dal client
-- ---------------------------------------------------------------------
drop policy if exists "System can create matches" on public.matches;

-- hardening: search_path fisso per la funzione SECURITY DEFINER esistente
alter function public.handle_interest(uuid) set search_path = public;
