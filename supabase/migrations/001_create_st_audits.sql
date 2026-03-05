-- Cached audit scan results with 24h TTL
create table if not exists st_audits (
  id text primary key,
  domain text not null,
  display_url text not null,
  grade text not null check (grade in ('A', 'B', 'C', 'D', 'F')),
  scores jsonb not null,
  scan jsonb not null,
  cached_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index idx_st_audits_domain on st_audits(domain);
create index idx_st_audits_expires on st_audits(expires_at);

-- RLS: public read, service-role write
alter table st_audits enable row level security;

create policy "Anyone can read audits"
  on st_audits for select
  using (true);
