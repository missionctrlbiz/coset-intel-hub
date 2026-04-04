create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
	if not exists (select 1 from pg_type where typname = 'content_status') then
		create type public.content_status as enum ('draft', 'scheduled', 'published', 'archived');
	end if;

	if not exists (select 1 from pg_type where typname = 'report_source_type') then
		create type public.report_source_type as enum ('upload', 'link');
	end if;

	if not exists (select 1 from pg_type where typname = 'ingestion_status') then
		create type public.ingestion_status as enum ('uploaded', 'extracting', 'drafted', 'failed', 'completed');
	end if;

	if not exists (select 1 from pg_type where typname = 'app_role') then
		create type public.app_role as enum ('viewer', 'editor', 'admin');
	end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = timezone('utc', now());
	return new;
end;
$$;

create or replace function public.reports_search_vector_update()
returns trigger
language plpgsql
as $$
begin
	new.search_vector := to_tsvector(
		'english',
		coalesce(new.title, '') || ' ' ||
		coalesce(new.description, '') || ' ' ||
		coalesce(new.author, '') || ' ' ||
		array_to_string(coalesce(new.category, '{}'::text[]), ' ') || ' ' ||
		array_to_string(coalesce(new.tags, '{}'::text[]), ' ')
	);
	return new;
end;
$$;

create or replace function public.blog_posts_search_vector_update()
returns trigger
language plpgsql
as $$
begin
	new.search_vector := to_tsvector(
		'english',
		coalesce(new.title, '') || ' ' ||
		coalesce(new.excerpt, '') || ' ' ||
		coalesce(new.author, '') || ' ' ||
		coalesce(new.category, '')
	);
	return new;
end;
$$;

create table if not exists public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	email text unique,
	full_name text,
	role public.app_role not null default 'viewer',
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, email, full_name)
	values (
		new.id,
		new.email,
		coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
	)
	on conflict (id) do update
	set email = excluded.email,
		full_name = coalesce(excluded.full_name, public.profiles.full_name);

	return new;
end;
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
	select coalesce(
		(select role from public.profiles where id = auth.uid()),
		'viewer'::public.app_role
	);
$$;

create table if not exists public.reports (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique,
	title text not null,
	description text not null default '',
	category text[] not null default '{}'::text[],
	tags text[] not null default '{}'::text[],
	read_time_minutes integer,
	published_at timestamptz,
	author text not null default '',
	views integer not null default 0,
	downloads integer not null default 0,
	image_path text,
	cover_image_path text,
	highlight text[] not null default '{}'::text[],
	quote text,
	metrics jsonb not null default '[]'::jsonb,
	search_vector tsvector not null default ''::tsvector,
	html_content text,
	source_url text,
	source_type public.report_source_type not null default 'upload',
	status public.content_status not null default 'draft',
	featured boolean not null default false,
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	constraint reports_slug_format check (slug = lower(slug) and slug !~ '\\s'),
	constraint reports_category_limit check (coalesce(array_length(category, 1), 0) <= 3),
	constraint reports_views_nonnegative check (views >= 0),
	constraint reports_downloads_nonnegative check (downloads >= 0),
	constraint reports_metrics_is_array check (jsonb_typeof(metrics) = 'array')
);

create table if not exists public.blog_posts (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique,
	title text not null,
	excerpt text not null default '',
	category text not null default '',
	author text not null default '',
	image_path text,
	search_vector tsvector not null default ''::tsvector,
	html_content text,
	status public.content_status not null default 'draft',
	featured boolean not null default false,
	published_at timestamptz,
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	constraint blog_posts_slug_format check (slug = lower(slug) and slug !~ '\\s')
);

create table if not exists public.report_ingestions (
	id uuid primary key default gen_random_uuid(),
	report_id uuid references public.reports (id) on delete set null,
	file_name text not null,
	mime_type text,
	file_size bigint not null default 0,
	storage_path text,
	extracted_text text,
	ai_draft jsonb not null default '{}'::jsonb,
	status public.ingestion_status not null default 'uploaded',
	error_message text,
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	constraint report_ingestions_file_size_nonnegative check (file_size >= 0),
	constraint report_ingestions_ai_draft_is_object check (jsonb_typeof(ai_draft) = 'object')
);

create index if not exists reports_status_published_at_idx
	on public.reports (status, published_at desc nulls last);

create index if not exists reports_category_gin_idx
	on public.reports using gin (category);

create index if not exists reports_tags_gin_idx
	on public.reports using gin (tags);

create index if not exists reports_search_gin_idx
	on public.reports using gin (search_vector);

create index if not exists blog_posts_status_published_at_idx
	on public.blog_posts (status, published_at desc nulls last);

create index if not exists blog_posts_search_gin_idx
	on public.blog_posts using gin (search_vector);

create index if not exists report_ingestions_status_created_at_idx
	on public.report_ingestions (status, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

drop trigger if exists reports_search_vector_trigger on public.reports;
create trigger reports_search_vector_trigger
before insert or update on public.reports
for each row
execute function public.reports_search_vector_update();

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_updated_at();

drop trigger if exists blog_posts_search_vector_trigger on public.blog_posts;
create trigger blog_posts_search_vector_trigger
before insert or update on public.blog_posts
for each row
execute function public.blog_posts_search_vector_update();

drop trigger if exists set_report_ingestions_updated_at on public.report_ingestions;
create trigger set_report_ingestions_updated_at
before update on public.report_ingestions
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.blog_posts enable row level security;
alter table public.report_ingestions enable row level security;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists reports_public_read_published on public.reports;
create policy reports_public_read_published
on public.reports
for select
to anon, authenticated
using (status = 'published');

drop policy if exists reports_team_read_all on public.reports;
create policy reports_team_read_all
on public.reports
for select
to authenticated
using (public.current_app_role() in ('editor', 'admin'));

drop policy if exists reports_team_insert on public.reports;
create policy reports_team_insert
on public.reports
for insert
to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

drop policy if exists reports_team_update on public.reports;
create policy reports_team_update
on public.reports
for update
to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

drop policy if exists reports_team_delete on public.reports;
create policy reports_team_delete
on public.reports
for delete
to authenticated
using (public.current_app_role() in ('editor', 'admin'));

drop policy if exists blog_posts_public_read_published on public.blog_posts;
create policy blog_posts_public_read_published
on public.blog_posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists blog_posts_team_read_all on public.blog_posts;
create policy blog_posts_team_read_all
on public.blog_posts
for select
to authenticated
using (public.current_app_role() in ('editor', 'admin'));

drop policy if exists blog_posts_team_insert on public.blog_posts;
create policy blog_posts_team_insert
on public.blog_posts
for insert
to authenticated
with check (public.current_app_role() in ('editor', 'admin'));

drop policy if exists blog_posts_team_update on public.blog_posts;
create policy blog_posts_team_update
on public.blog_posts
for update
to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

drop policy if exists blog_posts_team_delete on public.blog_posts;
create policy blog_posts_team_delete
on public.blog_posts
for delete
to authenticated
using (public.current_app_role() in ('editor', 'admin'));

drop policy if exists report_ingestions_team_access on public.report_ingestions;
create policy report_ingestions_team_access
on public.report_ingestions
for all
to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
	(
		'report-images',
		'report-images',
		true,
		5242880,
		array['image/png', 'image/jpeg', 'image/webp']
	),
	(
		'report-uploads',
		'report-uploads',
		false,
		52428800,
		array[
			'application/pdf',
			'text/csv',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'text/plain'
		]
	)
on conflict (id) do update
set public = excluded.public,
	file_size_limit = excluded.file_size_limit,
	allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists report_images_public_read on storage.objects;
create policy report_images_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'report-images');

drop policy if exists report_images_team_manage on storage.objects;
create policy report_images_team_manage
on storage.objects
for all
to authenticated
using (
	bucket_id = 'report-images'
	and public.current_app_role() in ('editor', 'admin')
)
with check (
	bucket_id = 'report-images'
	and public.current_app_role() in ('editor', 'admin')
);

drop policy if exists report_uploads_team_manage on storage.objects;
create policy report_uploads_team_manage
on storage.objects
for all
to authenticated
using (
	bucket_id = 'report-uploads'
	and public.current_app_role() in ('editor', 'admin')
)
with check (
	bucket_id = 'report-uploads'
	and public.current_app_role() in ('editor', 'admin')
);
