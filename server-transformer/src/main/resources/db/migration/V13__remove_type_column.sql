-- Remove the type column from user_annotations table
-- The label is now stored inside the bb JSONB field

ALTER TABLE user_annotations DROP COLUMN IF EXISTS type CASCADE;
