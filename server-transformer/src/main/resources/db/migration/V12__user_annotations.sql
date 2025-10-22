-- Drop existing table if it exists (clean slate)
DROP TABLE IF EXISTS user_annotations CASCADE;

-- Create table to store user-created/edited annotations per inspection image
CREATE TABLE user_annotations (
    id BIGSERIAL PRIMARY KEY,
    image_id BIGINT NOT NULL,
    inspection_id BIGINT NOT NULL,
    bb JSONB NOT NULL,               -- {"x": int, "y": int, "width": int, "height": int, "label": string}
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_annotations_image FOREIGN KEY (image_id)
        REFERENCES inspection_images(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_annotations_inspection FOREIGN KEY (inspection_id)
        REFERENCES inspections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_annotations_image ON user_annotations(image_id);
CREATE INDEX IF NOT EXISTS idx_user_annotations_inspection ON user_annotations(inspection_id);
CREATE INDEX IF NOT EXISTS idx_user_annotations_user ON user_annotations(user_id);
