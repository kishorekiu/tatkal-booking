# 00 — Requirements & capacity math

## Problem
~500 seats go on sale at a fixed time (10:00:00). ~1M users try at once. Seats sell out in seconds.

## Functional requirements
- Browse availability for a train/class.
- Join the sale, get admitted, hold seat(s) for a limited time (7 min).
- Pay; on success the booking is confirmed, on failure/timeout the seat is released.
- Receive ticket confirmation (async).

## Non-functional requirements
- **Correctness:** never sell more than 500 seats; never charge without a booking or book without a charge.
- **Availability:** the site stays up under the spike; excess load is rejected gracefully, not by crashing.
- **Fairness:** admission is not decided by who has the fastest connection or a bot.
- **Durability:** a confirmed booking survives any single failure.

## Capacity estimate
| Quantity | Estimate | Note |
|---|---|---|
| Users at T0 | 1,000,000 | |
| Average rate if sold out in 5s | ~200k req/s | |
| Peak (burst + retries) | 500k–1M req/s | everyone clicks in the same second |
| Real booking attempts after edge filtering | ~50k–100k | bots/duplicates dropped |
| Admitted booking window | ~2,500 | ~5x seats: holds expire, payments fail |
| Final bookings | 500 | |

Key insight: the hard part is rejecting ~99.95% of traffic cheaply while staying correct for the 0.05%.

## Three problems, three tools
| Problem | Tool | Phase |
|---|---|---|
| Massive read traffic | CDN, caching | 6 |
| Too many simultaneous writers | rate limiting, waiting room | 5 |
| Never oversell | atomic ops (Redis Lua), DB constraints | 1–3 |

## Contention math
- Row lock in Postgres held per transaction (~1–5 ms): 50k contenders on one row serialize to 50–250 s.
- Atomic Redis script (~10–50 µs): the same 50k clears in ~1–2 s.
