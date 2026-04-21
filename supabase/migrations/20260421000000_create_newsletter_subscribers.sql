create table if not exists public.newsletter_subscribers (
	id uuid primary key default gen_random_uuid(),
	email text not null unique,
	source text not null default 'public-modal',
	is_active boolean not null default true,
	resend_contact_id text,
	last_synced_at timestamptz,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	constraint newsletter_subscribers_email_nonempty check (char_length(trim(email)) > 0)
);

create index if not exists newsletter_subscribers_created_at_idx
	on public.newsletter_subscribers (created_at desc);

create index if not exists newsletter_subscribers_is_active_idx
	on public.newsletter_subscribers (is_active, created_at desc);

drop trigger if exists set_newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger set_newsletter_subscribers_updated_at
before update on public.newsletter_subscribers
for each row
execute function public.set_updated_at();

alter table public.newsletter_subscribers enable row level security;

drop policy if exists newsletter_subscribers_admin_read on public.newsletter_subscribers;
create policy newsletter_subscribers_admin_read
on public.newsletter_subscribers
for select
to authenticated
using (public.current_app_role() in ('editor', 'admin'));

drop policy if exists newsletter_subscribers_admin_update on public.newsletter_subscribers;
create policy newsletter_subscribers_admin_update
on public.newsletter_subscribers
for update
to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

drop policy if exists newsletter_subscribers_admin_delete on public.newsletter_subscribers;
create policy newsletter_subscribers_admin_delete
on public.newsletter_subscribers
for delete
to authenticated
using (public.current_app_role() in ('editor', 'admin'));