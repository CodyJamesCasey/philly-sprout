-- Policies for tree-spots bucket (bucket created separately).
-- Run this in Supabase Dashboard > SQL Editor if uploads fail with 400.

drop policy if exists "Authenticated users can upload tree spots" on storage.objects;
create policy "Authenticated users can upload tree spots"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'tree-spots');

drop policy if exists "Public read access for tree spots" on storage.objects;
create policy "Public read access for tree spots"
  on storage.objects for select
  to public
  using (bucket_id = 'tree-spots');
