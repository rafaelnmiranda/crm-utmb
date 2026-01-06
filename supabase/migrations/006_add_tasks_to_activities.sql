-- Add lightweight tasks support by extending activities

-- Expand allowed activity types
ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS activities_type_check;

ALTER TABLE activities
  ADD CONSTRAINT activities_type_check
  CHECK (type IN ('call', 'email', 'meeting', 'note', 'task'));

-- Short title for tasks/activities (optional)
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Indexes to keep task queries fast
CREATE INDEX IF NOT EXISTS idx_activities_type_completed_date
  ON activities (type, completed, activity_date);

CREATE INDEX IF NOT EXISTS idx_activities_open_tasks
  ON activities (deal_id, activity_date)
  WHERE type = 'task' AND completed = false;




