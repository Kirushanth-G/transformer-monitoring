-- For transformers table
ALTER TABLE transformers
    ALTER COLUMN id TYPE BIGINT,
    ALTER COLUMN id SET NOT NULL;

-- For images table
ALTER TABLE images
    ALTER COLUMN id TYPE BIGINT,
    ALTER COLUMN id SET NOT NULL;