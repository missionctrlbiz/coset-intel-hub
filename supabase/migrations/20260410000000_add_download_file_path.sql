-- Add a downloadable attachment path to reports
-- Stores the storage path of a file that visitors can download from the report page.
alter table public.reports
    add column if not exists download_file_path text;
