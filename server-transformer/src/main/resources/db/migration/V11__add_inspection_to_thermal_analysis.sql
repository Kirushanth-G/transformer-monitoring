-- Add inspection relationship to thermal_analyses table
ALTER TABLE thermal_analyses
ADD COLUMN inspection_id BIGINT,
ADD CONSTRAINT fk_thermal_inspection FOREIGN KEY (inspection_id) REFERENCES inspections(id);

-- Create index for inspection-based queries
CREATE INDEX idx_thermal_analyses_inspection ON thermal_analyses(inspection_id);

-- Update existing analyses to link them to inspections based on maintenance image
UPDATE thermal_analyses
SET inspection_id = (
    SELECT ii.inspection_id
    FROM inspection_images ii
    WHERE ii.id = thermal_analyses.maintenance_image_id
)
WHERE inspection_id IS NULL;
