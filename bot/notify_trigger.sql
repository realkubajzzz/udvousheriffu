-- Trigger to notify listeners when site_status changes
create or replace function public.notify_site_status_change() returns trigger as $$
begin
  perform pg_notify('status_changes', json_build_object('id', NEW.id, 'is_open', NEW.is_open)::text);
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_notify_site_status on public.site_status;
create trigger trg_notify_site_status
  after update on public.site_status
  for each row execute procedure public.notify_site_status_change();
