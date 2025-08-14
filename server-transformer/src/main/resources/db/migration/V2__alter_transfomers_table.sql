ALTER TABLE transformers
ADD COLUMN type VARCHAR(20) NOT NULL CHECK (type IN ('Bulk', 'Distribution')),
ADD COLUMN pole_no VARCHAR(50);