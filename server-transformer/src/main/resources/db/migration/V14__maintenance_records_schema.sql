-- V14: Maintenance Records Schema - Manual Field Inspection Reports
-- This migration creates tables to digitize the 3-page manual inspection form
-- Separate from AI thermal analysis - captures inspector field data

-- =============================================================================
-- 1. MAINTENANCE RECORDS TABLE (Main Form Container)
-- =============================================================================
-- Stores the baseline information, inspector details, and job timing
-- Links to existing inspections table to connect manual reports with AI analysis
CREATE TABLE maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    inspection_id BIGINT NOT NULL,

    -- Metadata from Form (Page 2 - Inspector Information)
    inspector_name VARCHAR(100),
    supervised_by VARCHAR(100),
    job_started_at TIMESTAMP WITHOUT TIME ZONE,
    job_completed_at TIMESTAMP WITHOUT TIME ZONE,

    -- Baseline Imaging Info (from PDF Page 1)
    baseline_ir_no VARCHAR(50),              -- e.g., "02062"
    baseline_condition VARCHAR(50),          -- e.g., "Sunny", "Cloudy", "Rainy"

    -- General Notes from Engineer (Page 3)
    findings_summary TEXT,
    recommendations TEXT,

    -- Status of the Record
    is_finalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Link to your existing inspections table
    CONSTRAINT fk_maintenance_inspection FOREIGN KEY (inspection_id)
        REFERENCES inspections(id) ON DELETE CASCADE
);

-- =============================================================================
-- 2. ELECTRICAL READINGS TABLE (Page 1 Data - Voltage & Current Grid)
-- =============================================================================
-- Stores the specific R/Y/B Voltage and Current readings
-- Supports two inspection stages: FIRST_INSPECTION and SECOND_INSPECTION
CREATE TABLE electrical_readings (
    id BIGSERIAL PRIMARY KEY,
    maintenance_record_id BIGINT NOT NULL,

    -- Distinguishes between the two grids in the PDF
    reading_stage VARCHAR(20) NOT NULL,

    -- Voltage Readings (Volts) - Three Phases
    volts_r NUMERIC(10, 2),
    volts_y NUMERIC(10, 2),
    volts_b NUMERIC(10, 2),

    -- Load Current Readings (Amps) - Three Phases + Neutral
    amps_r NUMERIC(10, 2),
    amps_y NUMERIC(10, 2),
    amps_b NUMERIC(10, 2),
    amps_neutral NUMERIC(10, 2),

    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Link to the maintenance record
    CONSTRAINT fk_readings_record FOREIGN KEY (maintenance_record_id)
        REFERENCES maintenance_records(id) ON DELETE CASCADE,

    -- Ensure reading_stage is valid
    CONSTRAINT chk_reading_stage CHECK (reading_stage IN ('FIRST_INSPECTION', 'SECOND_INSPECTION'))
);

-- =============================================================================
-- 3. INSPECTION SCHEMATICS TABLE (Interactive Diagram State)
-- =============================================================================
-- Stores the "Tick Boxes" state from the transformer diagram
-- JSONB allows flexible storage of LA, DDLO, FDS component states
CREATE TABLE inspection_schematics (
    id BIGSERIAL PRIMARY KEY,
    inspection_id BIGINT NOT NULL UNIQUE,  -- One diagram per inspection

    -- JSONB stores the "Ok/Not Ok" state of diagram components dynamically
    -- Example structure:
    -- {
    --   "lightning_arresters": {"status": "OK", "is_checked": true},
    --   "ddlo_fuses": {"status": "OK", "is_checked": true},
    --   "fds_boxes": [
    --     {"id": 1, "label": "FDS1", "status_text": "Ok", "is_checked": true}
    --   ]
    -- }
    diagram_state JSONB NOT NULL DEFAULT '{}'::jsonb,

    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Link directly to inspection as this is a visual artifact of the event
    CONSTRAINT fk_schematic_inspection FOREIGN KEY (inspection_id)
        REFERENCES inspections(id) ON DELETE CASCADE
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
-- Index for finding maintenance records by inspection
CREATE INDEX idx_maintenance_inspection ON maintenance_records(inspection_id);

-- Index for finding electrical readings by maintenance record
CREATE INDEX idx_readings_record ON electrical_readings(maintenance_record_id);

-- Index for finding schematics by inspection
CREATE INDEX idx_schematic_inspection ON inspection_schematics(inspection_id);

-- Index for filtering finalized vs draft records
CREATE INDEX idx_maintenance_finalized ON maintenance_records(is_finalized);

-- Index for date-based queries on maintenance records
CREATE INDEX idx_maintenance_dates ON maintenance_records(job_started_at, job_completed_at);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================
COMMENT ON TABLE maintenance_records IS 'Manual field inspection reports filled by inspectors';
COMMENT ON TABLE electrical_readings IS 'Voltage and current measurements from field inspections';
COMMENT ON TABLE inspection_schematics IS 'Interactive diagram state with component tick boxes';

COMMENT ON COLUMN maintenance_records.is_finalized IS 'When true, record is locked and cannot be edited';
COMMENT ON COLUMN electrical_readings.reading_stage IS 'FIRST_INSPECTION or SECOND_INSPECTION';
COMMENT ON COLUMN inspection_schematics.diagram_state IS 'JSONB storage for flexible diagram component states';

