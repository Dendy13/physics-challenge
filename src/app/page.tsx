export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 p-6 md:p-10">
      <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur md:p-14">
        <p className="mb-3 inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-700">
          Physics Sprint Game
        </p>
        <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
          Physics Challenge
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
          Uji kecepatan hitung dan pemahaman konsep fisika dalam mode kuis berbasis seed
          yang adil dan bisa di-replay.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/play"
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            Mulai Bermain
          </a>
        </div>
      </section>
    </main>
  );
}
