import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { STATIONS, getTrain } from "@/lib/trains";
import SeatMap from "./SeatMap";

async function Journey({ params, searchParams }: {
  params: Promise<{ trainNo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { trainNo } = await params;
  const sp = await searchParams;
  const date = String([sp.date].flat()[0] ?? "");
  const train = await getTrain(trainNo);
  if (!train) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold">
        {train.name} <span className="text-slate-400">#{train.train_no}</span>
      </h1>
      <p className="mt-1 text-slate-600">
        {STATIONS[train.from_code]} {train.dep_time} → {STATIONS[train.to_code]} {train.arr_time} · {date} · 3A coach B1
      </p>
      <SeatMap trainNo={trainNo} date={date} />
    </>
  );
}

export default function TrainPage(props: PageProps<"/trains/[trainNo]">) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-700 hover:underline">← New search</Link>
      <div className="mt-4">
        <Suspense fallback={<p className="text-slate-500">Loading train…</p>}>
          <Journey params={props.params} searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
