import { pool } from "@/lib/db";

// Fix #1: check + decrement + insert as ONE SQL statement.
// The UPDATE locks the row; a waiting request re-checks `seats_available > 0`
// against the new value, so the decision can never go stale.
export async function POST(req: Request) {
  const { userId, trainId = "12345-3A" } = await req.json();

  const result = await pool.query(
    `WITH taken AS (
       UPDATE inventory
       SET seats_available = seats_available - 1
       WHERE train_id = $1 AND seats_available > 0
       RETURNING train_id
     )
     INSERT INTO bookings (train_id, user_id)
     SELECT train_id, $2 FROM taken`,
    [trainId, userId],
  );

  if (result.rowCount === 0) {
    return Response.json({ ok: false, reason: "sold_out" }, { status: 409 });
  }
  return Response.json({ ok: true });
}
