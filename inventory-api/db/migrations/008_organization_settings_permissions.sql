-- Grant the API role access to organization profile settings.
BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE organization_settings
TO inventory_app;

COMMIT;
