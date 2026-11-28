alter table public.shirts add column if not exists back_processed_url text;
notify pgrst, 'reload schema';
