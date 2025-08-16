-- Drop the existing unique constraint on inspection_no
ALTER TABLE inspections DROP CONSTRAINT IF EXISTS inspections_inspection_no_key;

-- Add a new unique constraint for (inspection_no, transformer_id)
ALTER TABLE inspections
    ADD CONSTRAINT unique_inspection_no_per_transformer
    UNIQUE (inspection_no, transformer_id);