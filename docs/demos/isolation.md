# Isolation demo (run in 2 PowerShell windows, repo root)

Open a psql shell in each window:

    docker compose exec postgres psql -U tatkal -d tatkal

First (either window): `UPDATE seats SET status='free', booked_by=NULL WHERE seat_no=1;`

## Demo 1: Read Committed (default) - non-repeatable read
| Step | Window A | Window B |
|---|---|---|
| 1 | `BEGIN;` | |
| 2 | `SELECT status FROM seats WHERE seat_no=1;`  -> free | |
| 3 | | `UPDATE seats SET status='booked' WHERE seat_no=1;` (autocommits) |
| 4 | `SELECT status FROM seats WHERE seat_no=1;`  -> ??? | |
| 5 | `COMMIT;` | |

## Demo 2: Repeatable Read - snapshot + conflict error
Reset: `UPDATE seats SET status='free' WHERE seat_no=1;`
| Step | Window A | Window B |
|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL REPEATABLE READ;` | |
| 2 | `SELECT status FROM seats WHERE seat_no=1;`  -> free | |
| 3 | | `UPDATE seats SET status='booked' WHERE seat_no=1;` |
| 4 | `SELECT status FROM seats WHERE seat_no=1;`  -> ??? | |
| 5 | `UPDATE seats SET status='booked' WHERE seat_no=1;` -> ??? | |
| 6 | `ROLLBACK;` | |

Write down your prediction for the ??? cells BEFORE running.
