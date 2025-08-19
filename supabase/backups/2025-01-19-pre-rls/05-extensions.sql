-- ============================================================================
-- SUPABASE EXTENSIONS BACKUP
-- Generated: 2025-01-19
-- Purpose: Backup of all Supabase extensions for rollback capability
-- ============================================================================

-- Extensions currently INSTALLED:
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public" VERSION '0.8.0';
COMMENT ON EXTENSION "vector" IS 'vector data type and ivfflat and hnsw access methods';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql" VERSION '1.5.11';
COMMENT ON EXTENSION "pg_graphql" IS 'pg_graphql: GraphQL support';

CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog" VERSION '1.0';
COMMENT ON EXTENSION "plpgsql" IS 'PL/pgSQL procedural language';

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions" VERSION '1.11';
COMMENT ON EXTENSION "pg_stat_statements" IS 'track planning and execution statistics of all SQL statements executed';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions" VERSION '1.1';
COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions" VERSION '1.3';
COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault" VERSION '0.3.1';
COMMENT ON EXTENSION "supabase_vault" IS 'Supabase Vault Extension';

-- ============================================================================
-- AVAILABLE EXTENSIONS (not currently installed but available)
-- ============================================================================
-- These are available for installation but not currently active:
-- - seg (1.4): data type for representing line segments or floating-point intervals
-- - pg_hashids (1.3): pg_hashids
-- - pg_buffercache (1.5): examine the shared buffer cache
-- - address_standardizer (3.3.7): Used to parse an address into constituent elements
-- - earthdistance (1.2): calculate great-circle distances on the surface of the Earth
-- - address_standardizer_data_us (3.3.7): Address Standardizer US dataset example
-- - pgroonga_database (3.2.5): PGroonga database management module
-- - pg_jsonschema (0.3.3): pg_jsonschema
-- - insert_username (1.0): functions for tracking who changed a table
-- - postgres_fdw (1.1): foreign-data wrapper for remote PostgreSQL servers
-- - dict_xsyn (1.0): text search dictionary template for extended synonym processing
-- - pg_stat_monitor (2.1): PostgreSQL Query Performance Monitoring tool
-- - lo (1.1): Large Object maintenance
-- - tcn (1.0): Triggered change notifications
-- - unaccent (1.1): text search dictionary that removes accents
-- - index_advisor (0.2.0): Query index advisor
-- - ltree (1.3): data type for hierarchical tree-like structures
-- - tablefunc (1.0): functions that manipulate whole tables, including crosstab
-- - pgrouting (3.4.1): pgRouting Extension
-- - pg_walinspect (1.1): functions to inspect contents of PostgreSQL Write-Ahead Log
-- - refint (1.0): functions for implementing referential integrity (obsolete)
-- - pg_surgery (1.0): extension to perform surgery on a damaged relation
-- - cube (1.5): data type for multidimensional cubes
-- - sslinfo (1.2): information about SSL certificates
-- - pgsodium (3.1.8): Postgres extension for libsodium functions
-- - plpgsql_check (2.7): extended check for plpgsql functions
-- - hypopg (1.4.1): Hypothetical indexes for PostgreSQL
-- - pgjwt (0.2.0): JSON Web Token API for Postgresql
-- - amcheck (1.4): functions for verifying relation integrity
-- - pg_cron (1.6): Job scheduler for PostgreSQL
-- - bloom (1.0): bloom access method - signature file based index
-- - dict_int (1.0): text search dictionary template for integers
-- - intagg (1.1): integer aggregator and enumerator (obsolete)
-- - pg_tle (1.4.0): Trusted Language Extensions for PostgreSQL
-- - pg_trgm (1.6): text similarity measurement and index searching based on trigrams
-- - pg_freespacemap (1.2): examine the free space map (FSM)
-- - pg_net (0.14.0): Async HTTP
-- - btree_gin (1.3): support for indexing common datatypes in GIN
-- - pgstattuple (1.5): show tuple-level statistics
-- - pg_visibility (1.2): examine the visibility map (VM) and page-level visibility info
-- - postgis_raster (3.3.7): PostGIS raster types and functions
-- - citext (1.6): data type for case-insensitive character strings
-- - hstore (1.8): data type for storing sets of (key, value) pairs
-- - pageinspect (1.12): inspect the contents of database pages at a low level
-- - fuzzystrmatch (1.2): determine similarities and distance between strings
-- - pgmq (1.4.4): A lightweight message queue. Like AWS SQS and RSMQ but on Postgres
-- - pg_repack (1.5.2): Reorganize tables in PostgreSQL databases with minimal locks
-- - isn (1.2): data types for international product numbering standards
-- - postgis_tiger_geocoder (3.3.7): PostGIS tiger geocoder and reverse geocoder
-- - moddatetime (1.0): functions for tracking last modification time
-- - intarray (1.5): functions, operators, and index support for 1-D arrays of integers
-- - http (1.6): HTTP client for PostgreSQL, allows web page retrieval inside the database
-- - autoinc (1.0): functions for autoincrementing fields
-- - pgrowlocks (1.2): show row-level locking information
-- - postgis_topology (3.3.7): PostGIS topology spatial types and functions
-- - pgtap (1.2.0): Unit testing for PostgreSQL
-- - dblink (1.2): connect to other PostgreSQL databases from within a database
-- - rum (1.3): RUM index access method
-- - pgroonga (3.2.5): Super fast and all languages supported full text search index based on Groonga
-- - file_fdw (1.0): foreign-data wrapper for flat file access
-- - pgaudit (17.0): provides auditing functionality
-- - tsm_system_time (1.0): TABLESAMPLE method which accepts time in milliseconds as a limit
-- - wrappers (0.5.3): Foreign data wrappers developed by Supabase
-- - xml2 (1.1): XPath querying and XSLT
-- - btree_gist (1.7): support for indexing common datatypes in GiST
-- - tsm_system_rows (1.0): TABLESAMPLE method which accepts number of rows as a limit
-- - postgis_sfcgal (3.3.7): PostGIS SFCGAL functions
-- - pg_prewarm (1.2): prewarm relation data
-- - postgis (3.3.7): PostGIS geometry and geography spatial types and functions

-- ============================================================================
-- ROLLBACK NOTES:
-- To rollback extensions, use: DROP EXTENSION IF EXISTS extension_name CASCADE;
-- Be careful with CASCADE as it will drop dependent objects
-- ============================================================================