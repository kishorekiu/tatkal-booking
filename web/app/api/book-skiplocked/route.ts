import { pool } from "@/lib/db";

// Fix #3: per-seat rows + FOR UPDATE SKIP LOCKED. Each request locks ONE free
// seat and skips any seat another transaction already holds, so concurrent
// requests grab different seats instead of queueing on a single hot row.
export async function POST(req: Request) {
  const { userId, trainId = "12345-3A" } = await req.json();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT id FROM seats
       WHERE train_id = $1 AND status = 'free'
       ORDER BY seat_no
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
      [trainId],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return Response.json({ ok: false, reason: "sold_out" }, { status: 409 });
    }

    await client.query(
      "UPDATE seats SET status = 'booked', booked_by = $1 WHERE id = $2",
      [userId, rows[0].id],
    );
    await client.query(
      "INSERT INTO bookings (train_id, user_id) VALUES ($1, $2)",
      [trainId, userId],
    );
    await client.query("COMMIT");
    return Response.json({ ok: true, seatId: rows[0].id });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
