import { pool } from "@/lib/db";

// NAIVE on purpose (Phase 1): read, decide in app code, then write.
// Two requests can both read seats_available = 1 before either writes.
export async function POST(req: Request) {
  const { userId, trainId = "12345-3A" } = await req.json();

  const { rows } = await pool.query(
    "SELECT seats_available FROM inventory WHERE train_id = $1",
    [trainId],
  );
  const available = rows[0]?.seats_available ?? 0;

  if (available < 1) {
    return Response.json({ ok: false, reason: "sold_out" }, { status: 409 });
  }

  // The gap between the SELECT above and the UPDATE below is the race window.
  await pool.query(
    "UPDATE inventory SET seats_available = $1 WHERE train_id = $2",
    [available - 1, trainId],
  );
  await pool.query("INSERT INTO bookings (train_id, user_id) VALUES ($1, $2)", [
    trainId,
    userId,
  ]);

  return Response.json({ ok: true });
}
