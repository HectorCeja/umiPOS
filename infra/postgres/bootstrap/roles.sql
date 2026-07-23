-- Local/CI bootstrap only. Production roles are provisioned by infrastructure
-- automation and secrets management, never by application migrations.
DO $bootstrap$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nexo_migration') THEN
    CREATE ROLE nexo_migration LOGIN PASSWORD 'nexo_migration_local_only'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nexo_runtime') THEN
    CREATE ROLE nexo_runtime LOGIN PASSWORD 'nexo_runtime_local_only'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nexo_readonly') THEN
    CREATE ROLE nexo_readonly LOGIN PASSWORD 'nexo_readonly_local_only'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nexo_maintenance') THEN
    CREATE ROLE nexo_maintenance LOGIN PASSWORD 'nexo_maintenance_local_only'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nexo_worker') THEN
    CREATE ROLE nexo_worker LOGIN PASSWORD 'nexo_worker_local_only'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
END
$bootstrap$;

GRANT CONNECT ON DATABASE nexo TO nexo_migration, nexo_runtime, nexo_readonly, nexo_maintenance, nexo_worker;
GRANT CREATE ON DATABASE nexo TO nexo_migration;
ALTER SCHEMA public OWNER TO nexo_migration;
GRANT USAGE ON SCHEMA public TO nexo_runtime, nexo_readonly, nexo_worker;
GRANT pg_monitor TO nexo_maintenance;

DO $bootstrap$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'pg_maintain') THEN
    GRANT pg_maintain TO nexo_maintenance;
  END IF;
END
$bootstrap$;
