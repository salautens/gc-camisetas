alter table public.shirts add column if not exists back_original_url text;
notify pgrst, 'reload schema';
