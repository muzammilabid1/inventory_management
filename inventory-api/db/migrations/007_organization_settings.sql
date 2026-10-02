-- Save one organization profile for each user.
BEGIN;

CREATE TABLE organization_settings (
  user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  organization_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
