import { getSeats } from "@/lib/trains";

// GET /api/seats?train=12621&date=2026-11-05 → [{seat_no, status}]
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const train = searchParams.get("train");
  const date = searchParams.get("date");
  if (!train || !date) {
    return Response.json({ error: "train and date required" }, { status: 400 });
  }
  return Response.json(await getSeats(train, date), {
    headers: { "Cache-Control": "no-store" },
  });
}
