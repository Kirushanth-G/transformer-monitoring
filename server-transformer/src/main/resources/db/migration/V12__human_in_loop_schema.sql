-- V12: Human-in-the-Loop Schema Changes
-- This migration adds support for human review and editing of AI-generated thermal analysis results

-- Step 1: Drop the unnecessary thermal_analysis_configs table
-- (Over-engineering for MVP - config params already stored in thermal_analyses)
DROP TABLE IF EXISTS thermal_analysis_configs CASCADE;

-- Step 2: Add image dimensions and review tracking to thermal_analyses
-- These fields enable the frontend to calculate relative coordinates and track review status
ALTER TABLE thermal_analyses
ADD COLUMN original_width INTEGER,            -- Original image width from FastAPI response
ADD COLUMN original_height INTEGER,           -- Original image height from FastAPI response
ADD COLUMN review_status VARCHAR(20) DEFAULT 'PENDING' CHECK (review_status IN ('PENDING', 'VERIFIED')),
ADD COLUMN reviewed_by VARCHAR(100),          -- User who verified the analysis
ADD COLUMN reviewed_at TIMESTAMP;             -- When the analysis was verified

-- Step 3: Add human-in-the-loop tracking to anomaly_detections
-- These fields distinguish AI vs Human detections and support soft deletes
ALTER TABLE anomaly_detections
ADD COLUMN detection_source VARCHAR(20) DEFAULT 'AI' CHECK (detection_source IN ('AI', 'HUMAN')),
ADD COLUMN is_false_positive BOOLEAN DEFAULT FALSE,  -- Soft delete: AI was wrong, don't delete row
ADD COLUMN modified_by VARCHAR(100),                 -- Who last edited this detection
ADD COLUMN modified_at TIMESTAMP;                     -- When this detection was last modified

-- Step 4: Create indexes for new query patterns
CREATE INDEX idx_thermal_analyses_review_status ON thermal_analyses(review_status);
CREATE INDEX idx_anomaly_detections_source ON anomaly_detections(detection_source);
CREATE INDEX idx_anomaly_detections_false_positive ON anomaly_detections(is_false_positive);

-- Step 5: Backfill existing data with defaults
-- Mark all existing analyses as AI-generated and pending review
UPDATE thermal_analyses
SET review_status = 'PENDING'
WHERE review_status IS NULL;

UPDATE anomaly_detections
SET detection_source = 'AI',
    is_false_positive = FALSE
WHERE detection_source IS NULL;

-- Step 6: Add comments for documentation
COMMENT ON COLUMN thermal_analyses.original_width IS 'Original image width - used by frontend for responsive bounding box calculations';
COMMENT ON COLUMN thermal_analyses.original_height IS 'Original image height - used by frontend for responsive bounding box calculations';
COMMENT ON COLUMN thermal_analyses.review_status IS 'Review workflow status: PENDING (awaiting human review) or VERIFIED (human approved)';
COMMENT ON COLUMN anomaly_detections.detection_source IS 'Origin of detection: AI (from model) or HUMAN (manually added)';
COMMENT ON COLUMN anomaly_detections.is_false_positive IS 'Soft delete flag: TRUE if human marked AI detection as incorrect (preserves data for retraining)';

