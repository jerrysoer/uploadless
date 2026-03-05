-- Fire-and-forget analytics events
create table if not exists st_analytics_events (
  id bigint generated always as identity primary key,
  event text not null,
  properties jsonb,
  session_ip text,  -- hashed
  created_at timestamptz not null default now()
);

create index idx_st_analytics_event on st_analytics_events(event);
create index idx_st_analytics_created on st_analytics_events(created_at);

-- RLS: no public access (service-role only)
alter table st_analytics_events enable row level security;
