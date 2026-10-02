-- Allow the API role to manage one-time authentication challenges and resets.
-- Run as postgres after 003_auth_challenges.sql.
BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE auth_challenges, password_resets
TO inventory_app;

GRANT USAGE, SELECT
ON SEQUENCE auth_challenges_id_seq, password_resets_id_seq
TO inventory_app;

COMMIT;
