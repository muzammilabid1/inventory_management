-- Grant the Express API access to app data without making it a database administrator.
-- Run this in pgAdmin while connected to inventory_management_db as postgres.

BEGIN;

GRANT CONNECT ON DATABASE inventory_management_db TO inventory_app;
GRANT USAGE ON SCHEMA public TO inventory_app;

-- Allow normal CRUD operations on tables that already exist.
GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO inventory_app;

-- Allow generated identity values to be used when inserting rows.
GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO inventory_app;

-- Apply the same data permissions to future tables/sequences created by postgres.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO inventory_app;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO inventory_app;

COMMIT;
