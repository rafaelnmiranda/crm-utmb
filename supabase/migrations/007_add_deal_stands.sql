-- Add support for multiple stands per deal
-- This allows a deal to have multiple stand locations

CREATE TABLE IF NOT EXISTS deal_stands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  stand_code TEXT NOT NULL CHECK (stand_code ~ '^[A-F][0-9]{2}$'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deal_id, stand_code)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_deal_stands_deal_id ON deal_stands(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_stands_stand_code ON deal_stands(stand_code);

-- Migrate existing stand_location data to deal_stands
-- This preserves existing data while moving to the new structure
INSERT INTO deal_stands (deal_id, stand_code)
SELECT id, stand_location
FROM deals
WHERE stand_location IS NOT NULL
  AND stand_location ~ '^[A-F][0-9]{2}$'
ON CONFLICT (deal_id, stand_code) DO NOTHING;

-- Note: We keep stand_location column for backward compatibility
-- but new code should use deal_stands table
