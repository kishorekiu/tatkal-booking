-- Phase 2b: optimistic locking. A version counter bumped on every write.
-- Applied manually:
--   docker compose exec -T postgres psql -U tatkal -d tatkal < db/003-version.sql
ALTER TABLE seats ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 0;
