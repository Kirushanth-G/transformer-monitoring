-- Create transformers table
CREATE TABLE transformers (
    id SERIAL PRIMARY KEY,
    transformer_id VARCHAR(50) NOT NULL UNIQUE,
    location TEXT NOT NULL,
    capacity_kva INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create images table
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    transformer_id INT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,  -- URL/path to image in cloud storage
    image_type VARCHAR(20) NOT NULL CHECK (image_type IN ('Baseline', 'Maintenance')),
    environmental_condition VARCHAR(20) CHECK (environmental_condition IN ('Sunny', 'Cloudy', 'Rainy')),
    uploader_name VARCHAR(100),
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster searches
CREATE INDEX idx_images_transformer_id ON images(transformer_id);
CREATE INDEX idx_images_image_type ON images(image_type);
