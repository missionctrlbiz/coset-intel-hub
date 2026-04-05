create extension if not exists vector;

create table if not exists public.report_embeddings (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references public.reports (id) on delete cascade not null,
    content text not null,
    embedding vector(768) not null,
    created_at timestamptz not null default timezone('utc', now())
);

create index on public.report_embeddings using hnsw (embedding vector_cosine_ops);

alter table public.report_embeddings enable row level security;

create policy report_embeddings_public_read
on public.report_embeddings
for select
to anon, authenticated
using (
    exists (
        select 1 from public.reports
        where id = report_embeddings.report_id
        and status = 'published'
    )
);

create policy report_embeddings_team_read_all
on public.report_embeddings
for select
to authenticated
using (public.current_app_role() in ('editor', 'admin'));

create policy report_embeddings_team_insert
on public.report_embeddings
for insert
to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

create policy report_embeddings_team_delete
on public.report_embeddings
for delete
to authenticated
using (public.current_app_role() in ('editor', 'admin'));

create or replace function match_report_embeddings (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_report_id uuid
)
returns table (
  id uuid,
  report_id uuid,
  content text,
  similarity float
)
language plpgsql stable
as $$
begin
  return query
  select
    report_embeddings.id,
    report_embeddings.report_id,
    report_embeddings.content,
    1 - (report_embeddings.embedding <=> query_embedding) as similarity
  from report_embeddings
  where report_embeddings.report_id = filter_report_id
  and 1 - (report_embeddings.embedding <=> query_embedding) > match_threshold
  order by (report_embeddings.embedding <=> query_embedding) asc
  limit match_count;
end;
$$;
