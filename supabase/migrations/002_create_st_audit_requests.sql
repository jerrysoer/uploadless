-- User-submitted audit requests (for tracking demand)
create table if not exists st_audit_requests (
  id bigint generated always as identity primary key,
  domain text not null,
  requested_by_ip text,  -- hashed IP for privacy
  requested_at timestamptz not null default now()
);

create index idx_st_audit_requests_domain on st_audit_requests(domain);

-- RLS: public insert, no public read (privacy)
alter table st_audit_requests enable row level security;

create policy "Anyone can submit audit requests"
  on st_audit_requests for insert
  with check (true);
