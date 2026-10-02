-- Store refresh-token families and only hashes of individual refresh tokens.
-- Apply this migration against inventory_management_db before starting the updated API.
BEGIN;

CREATE TABLE refresh_token_families (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE TABLE refresh_tokens (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES refresh_token_families (id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMPTZ,
  replaced_by_id BIGINT REFERENCES refresh_tokens (id) ON DELETE SET NULL
);

CREATE INDEX refresh_token_families_user_idx ON refresh_token_families (user_id);
CREATE INDEX refresh_tokens_family_idx ON refresh_tokens (family_id);

COMMIT;
