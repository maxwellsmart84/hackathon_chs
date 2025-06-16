-- Drop the old focus_area column
ALTER TABLE chs_hack_startups DROP COLUMN focus_area;

-- Add new columns for startup onboarding
ALTER TABLE chs_hack_startups
  ADD COLUMN focus_areas JSON NOT NULL,
  ADD COLUMN product_types JSON NOT NULL,
  ADD COLUMN technologies JSON NOT NULL,
  ADD COLUMN regulatory_status VARCHAR(50),
  ADD COLUMN needs_clinical_trials BOOLEAN DEFAULT FALSE,
  ADD COLUMN nih_funding_interest VARCHAR(50),
  ADD COLUMN business_needs JSON DEFAULT (JSON_ARRAY()),
  ADD COLUMN keywords JSON DEFAULT (JSON_ARRAY());

-- Add index for regulatory_status
CREATE INDEX regulatory_status_idx ON chs_hack_startups(regulatory_status); 