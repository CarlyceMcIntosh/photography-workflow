-- Create projects table
-- Represents one photography engagement with state-driven workflow

CREATE TYPE workflow_state AS ENUM (
  'DRAFT',
  'BOOKED',
  'PREPARATION',
  'SESSION_SCHEDULED',
  'PROOFS_IN_PREPARATION',
  'PROOFING',
  'SELECTION_SUBMITTED',
  'RETOUCHING',
  'DELIVERED'
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  session_date TIMESTAMPTZ,
  session_location TEXT,
  workflow_state workflow_state NOT NULL DEFAULT 'DRAFT',
  selection_limit INTEGER CHECK (selection_limit IS NULL OR selection_limit >= 1),
  selection_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ
);

-- Index for faster lookups by creator
CREATE INDEX idx_projects_created_by_user_id ON projects(created_by_user_id);

-- Index for faster lookups by workflow state
CREATE INDEX idx_projects_workflow_state ON projects(workflow_state);

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
