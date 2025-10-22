-- Create table to store user-created/edited annotations per inspection image
CREATE TABLE IF NOT EXISTS user_annotations (
    id BIGSERIAL PRIMARY KEY,
    image_id BIGINT NOT NULL,
    bb JSONB NOT NULL,               -- {"x": int, "y": int, "width": int, "height": int}
    type VARCHAR(100),               -- label/type chosen by user
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_annotations_image FOREIGN KEY (image_id)
        REFERENCES inspection_images(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_annotations_image ON user_annotations(image_id);
CREATE INDEX IF NOT EXISTS idx_user_annotations_type ON user_annotations(type);
