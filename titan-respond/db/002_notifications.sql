ALTER TABLE organizations ADD COLUMN IF NOT EXISTS notification_email text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS notification_phone text;
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS response jsonb;
