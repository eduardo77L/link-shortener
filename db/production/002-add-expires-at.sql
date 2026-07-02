ALTER TABLE links
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days');

CREATE INDEX IF NOT EXISTS idx_links_expires_at ON links (expires_at);
