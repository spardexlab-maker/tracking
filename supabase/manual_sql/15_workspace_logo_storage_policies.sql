-- Create storage policies for the workspace-logos bucket
-- This ensures that only owners and admins can upload, update, or delete logo files.

-- 1. Enable public read access for workspace logos (allowing anyone to view the logo)
create policy "anyone read workspace logos"
on storage.objects for select
to public
using (bucket_id = 'workspace-logos');

-- 2. Allow workspace owners and admins to upload (insert) logo files
create policy "workspace leaders upload logos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'workspace-logos'
  and public.has_workspace_role(
    public.safe_path_uuid(name, 1),
    array['owner', 'admin']::public.workspace_role[]
  )
);

-- 3. Allow workspace owners and admins to update logo files
create policy "workspace leaders update logos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'workspace-logos'
  and public.has_workspace_role(
    public.safe_path_uuid(name, 1),
    array['owner', 'admin']::public.workspace_role[]
  )
);

-- 4. Allow workspace owners and admins to delete logo files
create policy "workspace leaders delete logos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'workspace-logos'
  and public.has_workspace_role(
    public.safe_path_uuid(name, 1),
    array['owner', 'admin']::public.workspace_role[]
  )
);
