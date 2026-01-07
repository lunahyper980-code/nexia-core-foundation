-- 1. First, clean up duplicate workspaces (keep the oldest one per user)
DELETE FROM workspaces w1
WHERE w1.id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM workspaces
  ORDER BY user_id, created_at ASC
);

-- 2. Add unique constraint to prevent future duplicates
ALTER TABLE workspaces
ADD CONSTRAINT workspaces_user_id_unique UNIQUE (user_id);