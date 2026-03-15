-- Add submission_status column with a default of 'submitted'
alter table tree_candidates
  add column if not exists submission_status text not null default 'submitted';

-- Backfill existing rows
update tree_candidates set submission_status = 'submitted' where submission_status is null;
