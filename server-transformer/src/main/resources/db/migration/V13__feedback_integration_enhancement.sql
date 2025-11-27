-- V13: Feedback Integration Enhancement (FR3.3 Requirements)
-- This migration enhances anomaly_detections to preserve original AI predictions for model retraining

-- Step 1: Add original_ai_prediction JSONB column
-- Stores the AI's original box coordinates before human edits: {"x": 10, "y": 10, "width": 50, "height": 50}
-- This satisfies FR3.3: "Maintain a feedback log that includes Original AI-generated detections"
ALTER TABLE anomaly_detections
ADD COLUMN original_ai_prediction JSONB;

-- Step 2: Add annotation_status column to track user actions
-- This replaces the simplistic is_false_positive boolean with rich status tracking
-- Satisfies FR3.1: "Annotation type (e.g., added / edited / deleted)"
ALTER TABLE anomaly_detections
ADD COLUMN annotation_status VARCHAR(20) DEFAULT 'UNVERIFIED'
CHECK (annotation_status IN ('UNVERIFIED', 'CONFIRMED', 'ADDED', 'EDITED', 'DELETED'));

-- Step 3: Add user_comments column for feedback
-- Satisfies FR3.1: Allow users to provide context for their decisions
ALTER TABLE anomaly_detections
ADD COLUMN user_comments TEXT;

-- Step 4: Migrate existing data from is_false_positive to annotation_status
-- This preserves existing data semantics while upgrading to richer tracking

-- Migrate false positives to DELETED status
UPDATE anomaly_detections
SET annotation_status = 'DELETED'
WHERE is_false_positive = TRUE;

-- Migrate human-added detections to ADDED status
UPDATE anomaly_detections
SET annotation_status = 'ADDED'
WHERE detection_source = 'HUMAN' AND is_false_positive = FALSE;

-- Migrate edited AI detections to EDITED status
UPDATE anomaly_detections
SET annotation_status = 'EDITED'
WHERE detection_source = 'AI'
  AND is_false_positive = FALSE
  AND modified_by IS NOT NULL;

-- All remaining AI detections stay as UNVERIFIED (default)
UPDATE anomaly_detections
SET annotation_status = 'UNVERIFIED'
WHERE annotation_status IS NULL;

-- Step 5: Drop the old is_false_positive column (replaced by annotation_status)
ALTER TABLE anomaly_detections
DROP COLUMN is_false_positive;

-- Step 6: Create indexes for new query patterns
CREATE INDEX idx_anomaly_detections_annotation_status ON anomaly_detections(annotation_status);
CREATE INDEX idx_anomaly_detections_original_ai_prediction ON anomaly_detections USING GIN (original_ai_prediction)
  WHERE original_ai_prediction IS NOT NULL;

-- Step 7: Add comments for documentation
COMMENT ON COLUMN anomaly_detections.original_ai_prediction IS
  'JSONB snapshot of AI original prediction before human edit. Format: {"x": int, "y": int, "width": int, "height": int}. NULL if never edited or human-added.';

COMMENT ON COLUMN anomaly_detections.annotation_status IS
  'User action tracking: UNVERIFIED (AI, no human review), CONFIRMED (human verified AI correct), ADDED (human drew new box), EDITED (human modified AI box), DELETED (false positive)';

COMMENT ON COLUMN anomaly_detections.user_comments IS
  'User feedback explaining their decision. E.g., "This is actually just a shadow" or "Missed hotspot in corner"';

-- Step 8: Add constraint to ensure data integrity
-- If annotation_status is EDITED, original_ai_prediction should not be NULL
-- (We'll handle this in application logic for flexibility, but document the expectation)
COMMENT ON TABLE anomaly_detections IS
  'Stores individual thermal anomaly detections with full human-in-the-loop tracking. When status=EDITED, original_ai_prediction should contain AI''s original box.';

