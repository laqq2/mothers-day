-- Letter Through Time — run this in the Neon SQL Editor (one branch, e.g. production).
-- Matches PRD §5.2 (gen_random_uuid() is built into Postgres 13+)

create table if not exists timelines (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  dedicated_to text not null,
  creator_name text,
  creator_email text,
  hero_image_url text,
  final_message text not null,
  theme text default 'warm',
  ending_effect text default 'petals',
  password_hash text,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Idempotent migration for existing deployments that pre-date creator_email.
alter table timelines add column if not exists creator_email text;

create table if not exists memory_cards (
  id uuid default gen_random_uuid() primary key,
  timeline_id uuid references timelines(id) on delete cascade,
  position integer not null,
  year integer not null,
  caption text not null,
  emotion_tag text,
  image_url text not null,
  created_at timestamptz default now()
);

create index if not exists timelines_slug_idx on timelines (slug);
create index if not exists timelines_creator_email_idx on timelines (creator_email);
create index if not exists timelines_created_at_idx on timelines (created_at desc);
create index if not exists memory_cards_timeline_position_idx on memory_cards (timeline_id, position);
