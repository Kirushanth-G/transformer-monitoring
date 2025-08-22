-- Drop old images table
DROP TABLE IF EXISTS images;

-- Create transformer_images table (for baseline images)
CREATE TABLE transformer_images (
    id BIGINT PRIMARY KEY,
    transformer_id BIGINT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    uploader_name VARCHAR(100),
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inspection_images table (for inspection images)
CREATE TABLE inspection_images (
    id BIGINT PRIMARY KEY,
    inspection_id BIGINT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    environmental_condition VARCHAR(20) CHECK (environmental_condition IN ('Sunny', 'Cloudy', 'Rainy')),
    uploader_name VARCHAR(100),
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_transformer_images_transformer_id ON transformer_images(transformer_id);
CREATE INDEX idx_inspection_images_inspection_id ON inspection_images(inspection_id);
