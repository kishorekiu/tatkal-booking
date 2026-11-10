import Link from "next/link";
import { Suspense } from "react";
import { STATIONS, searchTrains } from "@/lib/trains";

// searchParams is request-time data → must be read inside <Suspense> (Cache Components).
async function Results({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [from, to, date] = ["from", "to", "date"].map((k) => String([sp[k]].flat()[0] ?? ""));
  const trains = await searchTrains(from, to);

  return (
    <>
      <h1 className="text-2xl font-bold">
        {STATIONS[from] ?? from} → {STATIONS[to] ?? to}
        <span className="ml-2 text-base font-normal text-slate-500">{date}</span>
      </h1>
      {trains.length === 0 && <p className="mt-6 text-slate-600">No trains on this route.</p>}
      <ul className="mt-6 space-y-4">
        {trains.map((t) => (
          <li key={t.train_no} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{t.name} <span className="text-slate-400">#{t.train_no}</span></p>
                <p className="mt-1 text-sm text-slate-600">
                  {t.dep_time} {t.from_code} → {t.arr_time} {t.to_code} · {t.duration}
                </p>
              </div>
              <Link
                href={`/trains/${t.train_no}?date=${date}`}
                className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
              >
                Select seats · 3A
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function TrainsPage(props: PageProps<"/trains">) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-700 hover:underline">← New search</Link>
      <div className="mt-4">
        <Suspense fallback={<p className="text-slate-500">Searching trains…</p>}>
          <Results searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
