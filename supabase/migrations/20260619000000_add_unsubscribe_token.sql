-- Adds token-based unsubscribe support to newsletter_subscribers.
--
-- unsubscribe_token : opaque per-subscriber token embedded in notification
--                     emails, used by /unsubscribe and /api/unsubscribe so we
--                     don't have to put the raw email address in URLs.
-- unsubscribed_at   : audit timestamp set when the user actually unsubscribes
--                     (distinct from updated_at which fires on any change).

alter table public.newsletter_subscribers
    add column if not exists unsubscribe_token uuid
        unique default gen_random_uuid();

alter table public.newsletter_subscribers
    add column if not exists unsubscribed_at timestamptz;

create index if not exists newsletter_subscribers_unsubscribe_token_idx
    on public.newsletter_subscribers (unsubscribe_token)
    where unsubscribe_token is not null;

-- Backfill: existing rows created before this migration need a token so
-- previously-issued welcome emails can be retroactively honoured if the
-- subscriber ever clicks their (non-existent) link. The default above only
-- fires for new INSERTs.
update public.newsletter_subscribers
    set unsubscribe_token = gen_random_uuid()
    where unsubscribe_token is null;
