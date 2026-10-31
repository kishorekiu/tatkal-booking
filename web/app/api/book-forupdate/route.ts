import { pool } from "@/lib/db";

// Fix #2: classic pessimistic locking. Read-decide-write is safe because
// SELECT ... FOR UPDATE makes every other transaction wait for this one to
// COMMIT before it can even read the row. Same logic as the naive version,
// but the lock is held across the whole read-decide-write window.
export async function POST(req: Request) {
  const { userId, trainId = "12345-3A" } = await req.json();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT seats_available FROM inventory WHERE train_id = $1 FOR UPDATE",
      [trainId],
    );
    const available = rows[0]?.seats_available ?? 0;

    if (available < 1) {
      await client.query("ROLLBACK");
      return Response.json({ ok: false, reason: "sold_out" }, { status: 409 });
    }

    await client.query(
      "UPDATE inventory SET seats_available = $1 WHERE train_id = $2",
      [available - 1, trainId],
    );
    await client.query(
      "INSERT INTO bookings (train_id, user_id) VALUES ($1, $2)",
      [trainId, userId],
    );
    await client.query("COMMIT");
    return Response.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
