-- Anonymous accounts: no name, email or IP is stored.
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  events_day TEXT,
  events_count INTEGER NOT NULL DEFAULT 0
);

-- One row per linked browser. Only the SHA-256 of the bearer token is stored.
CREATE TABLE devices (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);
CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_devices_last_seen ON devices(last_seen_at);

-- Latest progress snapshot per account; `rev` implements optimistic concurrency.
CREATE TABLE progress (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rev INTEGER NOT NULL,
  state TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  last_active_day TEXT
);

-- Short-lived, single-use codes to link another device. Stored hashed.
CREATE TABLE pairing_codes (
  code_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX idx_pairing_user ON pairing_codes(user_id);

CREATE TABLE push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  reminder_time TEXT NOT NULL,
  timezone TEXT NOT NULL,
  last_sent_day TEXT,
  failures INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_push_user ON push_subscriptions(user_id);

-- Aggregated, non-identifying learning analytics for improving the question bank.
CREATE TABLE challenge_stats (
  challenge_id INTEGER NOT NULL,
  mode TEXT NOT NULL,
  confidence TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (challenge_id, mode, confidence)
);

CREATE TABLE option_picks (
  challenge_id INTEGER NOT NULL,
  option_index INTEGER NOT NULL,
  picks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (challenge_id, option_index)
);
