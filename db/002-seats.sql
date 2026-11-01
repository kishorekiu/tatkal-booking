-- Phase 2b: per-seat model. One row per physical seat instead of one counter row.
-- Applied manually (init.sql only runs on a fresh volume):
--   docker compose exec -T postgres psql -U tatkal -d tatkal < db/002-seats.sql
CREATE TABLE IF NOT EXISTS seats (
  id        SERIAL PRIMARY KEY,
  train_id  TEXT NOT NULL,
  seat_no   INT  NOT NULL,
  status    TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'booked')),
  booked_by TEXT,
  UNIQUE (train_id, seat_no)
);

-- Partial index: only free seats are looked up on the hot path.
CREATE INDEX IF NOT EXISTS seats_free_idx ON seats (train_id, seat_no) WHERE status = 'free';
