create table if not exists public.hub_feedback (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	email text not null,
	topic text not null default 'General Inquiry',
	message text not null,
	is_read boolean not null default false,
	read_at timestamptz,
	admin_reply text,
	replied_at timestamptz,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	constraint hub_feedback_name_nonempty check (char_length(trim(name)) > 0),
	constraint hub_feedback_email_nonempty check (char_length(trim(email)) > 0),
	constraint hub_feedback_message_nonempty check (char_length(trim(message)) > 0)
);

create index if not exists hub_feedback_created_at_idx
	on public.hub_feedback (created_at desc);

create index if not exists hub_feedback_is_read_idx
	on public.hub_feedback (is_read, created_at desc);

drop trigger if exists set_hub_feedback_updated_at on public.hub_feedback;
create trigger set_hub_feedback_updated_at
before update on public.hub_feedback
for each row
execute function public.set_updated_at();

alter table public.hub_feedback enable row level security;

drop policy if exists hub_feedback_admin_read on public.hub_feedback;
create policy hub_feedback_admin_read
on public.hub_feedback
for select
to authenticated
using (public.current_app_role() in ('editor', 'admin'));

drop policy if exists hub_feedback_admin_update on public.hub_feedback;
create policy hub_feedback_admin_update
on public.hub_feedback
for update
to authenticated
using (public.current_app_role() in ('editor', 'admin'))
with check (public.current_app_role() in ('editor', 'admin'));

drop policy if exists hub_feedback_admin_delete on public.hub_feedback;
create policy hub_feedback_admin_delete
on public.hub_feedback
for delete
to authenticated
using (public.current_app_role() in ('editor', 'admin'));
