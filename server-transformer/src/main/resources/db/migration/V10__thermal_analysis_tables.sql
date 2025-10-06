-- Create thermal analysis related tables

-- Table for storing thermal analysis results
CREATE TABLE thermal_analyses (
    id BIGSERIAL PRIMARY KEY,
    maintenance_image_id BIGINT NOT NULL,
    baseline_image_id BIGINT,
    analysis_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    overall_assessment VARCHAR(20) NOT NULL CHECK (overall_assessment IN ('NORMAL', 'WARNING', 'CRITICAL')),
    anomaly_score DECIMAL(5,3) NOT NULL DEFAULT 0.0,
    sensitivity_percentage INTEGER NOT NULL DEFAULT 50 CHECK (sensitivity_percentage >= 0 AND sensitivity_percentage <= 100),
    processing_time_ms INTEGER,
    processing_device INTEGER DEFAULT -1,
    input_image_size INTEGER DEFAULT 640,
    use_half_precision BOOLEAN DEFAULT FALSE,
    api_version VARCHAR(50),
    equipment_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),

    -- Foreign key constraints
    CONSTRAINT fk_thermal_maintenance_image FOREIGN KEY (maintenance_image_id) REFERENCES inspection_images(id),
    CONSTRAINT fk_thermal_baseline_image FOREIGN KEY (baseline_image_id) REFERENCES inspection_images(id),
    CONSTRAINT fk_thermal_equipment FOREIGN KEY (equipment_id) REFERENCES transformers(id)
);

-- Table for storing individual anomaly detections
CREATE TABLE anomaly_detections (
    id BIGSERIAL PRIMARY KEY,
    analysis_id BIGINT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    label VARCHAR(100) NOT NULL,
    confidence DECIMAL(5,3) NOT NULL,
    area INTEGER NOT NULL,
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    severity_level VARCHAR(20) CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    temperature_celsius DECIMAL(6,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_anomaly_analysis FOREIGN KEY (analysis_id) REFERENCES thermal_analyses(id) ON DELETE CASCADE
);

-- Table for storing analysis configuration metadata
CREATE TABLE thermal_analysis_configs (
    id BIGSERIAL PRIMARY KEY,
    analysis_id BIGINT NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_config_analysis FOREIGN KEY (analysis_id) REFERENCES thermal_analyses(id) ON DELETE CASCADE,
    -- Unique constraint to prevent duplicate keys per analysis
    CONSTRAINT uk_analysis_config UNIQUE (analysis_id, config_key)
);

-- Create indexes for performance
CREATE INDEX idx_thermal_analyses_maintenance_image ON thermal_analyses(maintenance_image_id);
CREATE INDEX idx_thermal_analyses_equipment ON thermal_analyses(equipment_id);
CREATE INDEX idx_thermal_analyses_timestamp ON thermal_analyses(analysis_timestamp);
CREATE INDEX idx_thermal_analyses_assessment ON thermal_analyses(overall_assessment);
CREATE INDEX idx_anomaly_detections_analysis ON anomaly_detections(analysis_id);
CREATE INDEX idx_anomaly_detections_label ON anomaly_detections(label);
CREATE INDEX idx_anomaly_detections_critical ON anomaly_detections(is_critical);

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_thermal_analyses_updated_at
    BEFORE UPDATE ON thermal_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
