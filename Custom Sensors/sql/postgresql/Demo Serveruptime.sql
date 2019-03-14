-- calculates the uptime of the database in seconds
SELECT now() - pg_postmaster_start_time();