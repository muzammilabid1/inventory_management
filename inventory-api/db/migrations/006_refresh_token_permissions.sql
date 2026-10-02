-- Allow the Express API role to manage refresh-token sessions.
-- Run as postgres after 005_refresh_tokens.sql.
BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE refresh_token_families, refresh_tokens
TO inventory_app;

GRANT USAGE, SELECT
ON SEQUENCE refresh_tokens_id_seq
TO inventory_app;

COMMIT;
