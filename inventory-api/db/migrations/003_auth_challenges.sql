BEGIN;

CREATE TABLE auth_challenges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  purpose VARCHAR(16) NOT NULL CHECK (purpose IN ('login', 'register')),
  code_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX auth_challenges_user_purpose_idx ON auth_challenges (user_id, purpose);

CREATE TABLE password_resets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  code_hash CHAR(64) NOT NULL,
  code_expires_at TIMESTAMPTZ NOT NULL,
  code_attempts INTEGER NOT NULL DEFAULT 0 CHECK (code_attempts >= 0),
  reset_token_hash CHAR(64),
  token_expires_at TIMESTAMPTZ,
  token_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX password_resets_user_idx ON password_resets (user_id);

COMMIT;
