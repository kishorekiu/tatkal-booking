import SearchForm from "./SearchForm";

export default function Home() {
  return (
    <main>
      <section className="bg-blue-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">Tatkal Booking</h1>
          <p className="mt-1 mb-8 text-blue-200">
            A system-design lab: no oversell, safe transactions, graceful degradation.
          </p>
          <div className="rounded-2xl bg-white p-6 text-slate-800 shadow-lg">
            <SearchForm />
          </div>
        </div>
      </section>
    </main>
  );
}
