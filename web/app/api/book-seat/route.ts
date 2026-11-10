import { pool } from "@/lib/db";

// Book ONE specific seat the user clicked.
// FOR UPDATE SKIP LOCKED: if another txn holds/just took this seat, we don't wait —
// we get zero rows and tell the user to pick another. Here the "ambiguous no-row"
// (taken vs. being-taken) is acceptable: either way THIS seat isn't ours.
export async function POST(req: Request) {
  const { userId, trainNo, date, seatNo } = await req.json();
  if (!userId || !trainNo || !date || !Number.isInteger(seatNo)) {
    return Response.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  const trainId = `${trainNo}:${date}`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT id FROM seats
       WHERE train_id = $1 AND seat_no = $2 AND status = 'free'
       FOR UPDATE SKIP LOCKED`,
      [trainId, seatNo],
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return Response.json({ ok: false, reason: "seat_unavailable" }, { status: 409 });
    }
    await client.query(
      "UPDATE seats SET status = 'booked', booked_by = $1 WHERE id = $2",
      [userId, rows[0].id],
    );
    await client.query(
      "INSERT INTO bookings (train_id, user_id, seat_no) VALUES ($1, $2, $3)",
      [trainId, userId, seatNo],
    );
    await client.query("COMMIT");
    return Response.json({ ok: true, seatNo });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
