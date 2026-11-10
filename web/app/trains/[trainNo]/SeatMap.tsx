"use client";

import { useCallback, useEffect, useState } from "react";

type Seat = { seat_no: number; status: "free" | "booked" };

// 3A berth pattern inside each 8-seat bay: 6 main berths + 2 side berths.
const BERTH = ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"];

function getUserId() {
  try {
    let id = localStorage.getItem("tatkal-user");
    if (!id) {
      id = "u-" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("tatkal-user", id);
    }
    return id;
  } catch {
    return "u-anon";
  }
}

export default function SeatMap({ trainNo, date }: { trainNo: string; date: string }) {
  const [seats, setSeats] = useState<Seat[] | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/seats?train=${trainNo}&date=${date}`, { cache: "no-store" });
    setSeats(await r.json());
  }, [trainNo, date]);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000); // crude polling; Slice 5 replaces this with SSE
    return () => clearInterval(t);
  }, [load]);

  async function book() {
    if (picked == null) return;
    setBusy(true);
    const r = await fetch("/api/book-seat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: getUserId(), trainNo, date, seatNo: picked }),
    });
    const body = await r.json();
    if (body.ok) setMsg({ kind: "ok", text: `Seat ${picked} booked. Have a good journey!` });
    else setMsg({ kind: "err", text: `Seat ${picked} was just taken — pick another.` });
    setPicked(null);
    await load();
    setBusy(false);
  }

  if (!seats) return <p className="mt-6 text-slate-500">Loading seat map…</p>;

  const free = seats.filter((s) => s.status === "free").length;
  const bays = Array.from({ length: 9 }, (_, b) => seats.slice(b * 8, b * 8 + 8));

  const seatBtn = (s: Seat) => {
    const state =
      s.status === "booked"
        ? "cursor-not-allowed bg-slate-300 text-slate-500"
        : picked === s.seat_no
          ? "bg-orange-500 text-white ring-2 ring-orange-300"
          : "bg-white text-emerald-700 ring-1 ring-emerald-500 hover:bg-emerald-50";
    return (
      <button
        key={s.seat_no}
        disabled={s.status === "booked"}
        onClick={() => { setMsg(null); setPicked(s.seat_no); }}
        title={`Seat ${s.seat_no} · ${BERTH[(s.seat_no - 1) % 8]}`}
        className={`h-10 w-10 rounded-md text-xs font-semibold ${state}`}
      >
        {s.seat_no}
      </button>
    );
  };

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        <span className="font-semibold">{free} of {seats.length} seats available</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded-sm ring-1 ring-emerald-500" /> Free</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded-sm bg-orange-500" /> Selected</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded-sm bg-slate-300" /> Booked</span>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-3">
        {bays.map((bay, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2">
            <span className="w-6 text-[10px] text-slate-400">Bay {i + 1}</span>
            <div className="grid grid-cols-3 gap-1">{bay.slice(0, 6).map(seatBtn)}</div>
            <div className="ml-2 grid gap-1 border-l border-dashed border-slate-300 pl-2">
              {bay.slice(6).map(seatBtn)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={book}
          disabled={picked == null || busy}
          className="rounded-lg bg-orange-500 px-6 py-2 font-semibold text-white enabled:hover:bg-orange-600 disabled:opacity-40"
        >
          {busy ? "Booking…" : picked == null ? "Select a seat" : `Book seat ${picked}`}
        </button>
        {msg && (
          <span className={msg.kind === "ok" ? "text-emerald-700" : "text-red-600"}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}
