-- Reset per-seat state with :n seats. Usage:
--   docker compose exec -T postgres psql -U tatkal -d tatkal -v n=5 < db/reset-seats.sql
DELETE FROM bookings;
DELETE FROM seats;
INSERT INTO seats (train_id, seat_no)
SELECT '12345-3A', g FROM generate_series(1, :n) AS g;
