-- V15: Add neutral voltage field to electrical readings
-- Frontend sends voltsN but backend was only storing amps_neutral

ALTER TABLE electrical_readings
ADD COLUMN volts_neutral NUMERIC(10, 2);

COMMENT ON COLUMN electrical_readings.volts_neutral IS 'Neutral phase voltage reading';

