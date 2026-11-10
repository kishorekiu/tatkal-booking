"use client";

import { useEffect, useState } from "react";
import { STATIONS } from "@/lib/stations";

const iso = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

// Client component: "today" must be computed in the browser, not at build/prerender time.
export default function SearchForm() {
  const [date, setDate] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  useEffect(() => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 6);
    setDate(iso(now));
    setMin(iso(now));
    setMax(iso(end));
  }, []);

  const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2";

  return (
    <form action="/trains" className="grid gap-4 sm:grid-cols-4">
      <label className="text-sm font-medium">
        From
        <select name="from" defaultValue="MAS" className={field}>
          {Object.entries(STATIONS).map(([c, n]) => (
            <option key={c} value={c}>{n} ({c})</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        To
        <select name="to" defaultValue="NDLS" className={field}>
          {Object.entries(STATIONS).map(([c, n]) => (
            <option key={c} value={c}>{n} ({c})</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Date
        <input type="date" name="date" value={date} min={min} max={max}
          onChange={(e) => setDate(e.target.value)} required className={field} />
      </label>
      <button className="self-end rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600">
        Search trains
      </button>
    </form>
  );
}
