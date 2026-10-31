-- Phase 1: naive schema. One row per train/class with a seat counter.
CREATE TABLE inventory (
  id              SERIAL PRIMARY KEY,
  train_id        TEXT NOT NULL UNIQUE,
  seats_available INT  NOT NULL
);

CREATE TABLE bookings (
  id         SERIAL PRIMARY KEY,
  train_id   TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO inventory (train_id, seats_available) VALUES ('12345-3A', 5);
