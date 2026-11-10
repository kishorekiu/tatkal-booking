import { pool } from "@/lib/db";

export { STATIONS } from "@/lib/stations";

export type Train = {
  train_no: string;
  name: string;
  from_code: string;
  to_code: string;
  dep_time: string;
  arr_time: string;
  duration: string;
};

export type Seat = { seat_no: number; status: "free" | "booked" };

// A "journey" = one train on one date. Seats live in `seats.train_id = '<no>:<date>'`.
export const journeyId = (trainNo: string, date: string) => `${trainNo}:${date}`;

export async function searchTrains(from: string, to: string): Promise<Train[]> {
  const { rows } = await pool.query(
    `SELECT * FROM trains WHERE from_code = $1 AND to_code = $2 ORDER BY dep_time`,
    [from, to],
  );
  return rows;
}

export async function getTrain(trainNo: string): Promise<Train | null> {
  const { rows } = await pool.query(`SELECT * FROM trains WHERE train_no = $1`, [trainNo]);
  return rows[0] ?? null;
}

export async function getSeats(trainNo: string, date: string): Promise<Seat[]> {
  const { rows } = await pool.query(
    `SELECT seat_no, status FROM seats WHERE train_id = $1 ORDER BY seat_no`,
    [journeyId(trainNo, date)],
  );
  return rows;
}
