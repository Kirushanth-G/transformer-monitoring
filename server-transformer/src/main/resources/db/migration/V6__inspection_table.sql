-- Create inspection table
CREATE TABLE inspections (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    inspection_no VARCHAR(50) NOT NULL UNIQUE, -- Human-readable inspection ID like INSP-001
    transformer_id BIGINT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
    inspected_at TIMESTAMP NOT NULL,
    maintenance_at TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    branch TEXT NOT NULL
);
