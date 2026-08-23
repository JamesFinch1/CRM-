CREATE TABLE IF NOT EXISTS rate_limit_events (
  key text NOT NULL,
  bucket timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1,
  PRIMARY KEY(key,bucket)
);
CREATE INDEX IF NOT EXISTS rate_limit_bucket_idx ON rate_limit_events(bucket);
