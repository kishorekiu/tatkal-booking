-- Slice 1: mock trains + per-date seat inventory.
-- Reuses the existing `seats` table: train_id = '<train_no>:<YYYY-MM-DD>', one coach of 72 seats.
-- Old benchmark rows (train_id '12345-3A') are left untouched so the A/B endpoints still work.
-- Apply: Get-Content db\004-trains.sql | docker compose exec -T postgres psql -U tatkal -d tatkal
CREATE TABLE IF NOT EXISTS trains (
  train_no  TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  from_code TEXT NOT NULL,
  to_code   TEXT NOT NULL,
  dep_time  TEXT NOT NULL,
  arr_time  TEXT NOT NULL,
  duration  TEXT NOT NULL
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seat_no INT;

INSERT INTO trains (train_no, name, from_code, to_code, dep_time, arr_time, duration) VALUES
  ('12621', 'Tamil Nadu Express', 'MAS', 'NDLS', '22:00', '06:45', '32h 45m'),
  ('12433', 'Chennai Rajdhani',   'MAS', 'NZM',  '06:10', '08:40', '26h 30m'),
  ('12007', 'Shatabdi Express',   'MAS', 'SBC',  '06:00', '11:00', '05h 00m'),
  ('12639', 'Brindavan Express',  'MAS', 'SBC',  '07:50', '13:55', '06h 05m'),
  ('12658', 'Bengaluru Mail',     'MAS', 'SBC',  '22:40', '05:15', '06h 35m'),
  ('12841', 'Coromandel Express', 'HWH', 'MAS',  '14:50', '17:10', '26h 20m')
ON CONFLICT (train_no) DO NOTHING;

-- 72 seats per train per day for the next 7 days; ~35% pre-booked so the map looks lived-in.
INSERT INTO seats (train_id, seat_no, status, booked_by)
SELECT t.train_no || ':' || to_char(d, 'YYYY-MM-DD'),
       s,
       CASE WHEN random() < 0.35 THEN 'booked' ELSE 'free' END,
       CASE WHEN random() < 0.35 THEN 'seed' END
FROM trains t
CROSS JOIN generate_series(current_date, current_date + 6, interval '1 day') AS d
CROSS JOIN generate_series(1, 72) AS s
ON CONFLICT (train_id, seat_no) DO NOTHING;

-- keep booked_by consistent with status
UPDATE seats SET booked_by = NULL WHERE status = 'free' AND booked_by IS NOT NULL;
UPDATE seats SET booked_by = 'seed' WHERE status = 'booked' AND booked_by IS NULL;
