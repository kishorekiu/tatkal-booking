import { pool } from "@/lib/db";

const MAX_ATTEMPTS = 20;

// Fix #4: optimistic locking. No locks while reading: pick a free seat with a
// plain SELECT, remember its version, then UPDATE ... WHERE version = <what I
// saw>. If someone else changed the row in between, rowCount is 0 -> we lost
// the race, re-read and retry. Correct (never oversells) but wasteful under
// heavy contention: everyone reads the SAME first free seat, so most attempts
// collide and get thrown away.
export async function POST(req: Request) {
  const { userId, trainId = "12345-3A" } = await req.json();

  const client = await pool.connect();
  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `SELECT id, version FROM seats
         WHERE train_id = $1 AND status = 'free'
         ORDER BY seat_no
         LIMIT 1`,
        [trainId],
      );

      if (rows.length === 0) {
        await client.query("ROLLBACK");
        return Response.json({ ok: false, reason: "sold_out", attempt }, { status: 409 });
      }

      const { id, version } = rows[0];
      const upd = await client.query(
        `UPDATE seats
         SET status = 'booked', booked_by = $1, version = version + 1
         WHERE id = $2 AND version = $3`,
        [userId, id, version],
      );

      if (upd.rowCount === 0) {
        // Lost the race: another txn bumped the version first. Retry.
        await client.query("ROLLBACK");
        continue;
      }

      await client.query(
        "INSERT INTO bookings (train_id, user_id) VALUES ($1, $2)",
        [trainId, userId],
      );
      await client.query("COMMIT");
      return Response.json({ ok: true, seatId: id, attempts: attempt });
    }
    return Response.json({ ok: false, reason: "contention" }, { status: 503 });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
