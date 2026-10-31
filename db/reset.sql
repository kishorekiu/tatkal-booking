-- Reset test state: 5 seats, no bookings.
UPDATE inventory SET seats_available = 5;
DELETE FROM bookings;
