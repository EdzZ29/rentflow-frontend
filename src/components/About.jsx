const categories = [
  'Cars',
  'Motorcycles',
  'Bicycles',
  'Construction Equipment',
  'Tools',
  'Cameras',
  'Party Supplies',
  'Sports Equipment',
  'Properties',
];

const highlights = [
  'Cloud-based SaaS',
  '7-day free trial',
  'Your own booking page',
  'Built to scale',
];

export default function About() {
  return (
    <section id="about" className="bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Intro */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            About RentFlow
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            One platform for every rental business
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            RentFlow is a cloud-based rental management platform that helps
            businesses digitize their daily operations. Instead of spreadsheets,
            phone calls, and paper records, it automates reservations, inventory
            tracking, customers, payments, and maintenance all from one secure
            dashboard with a customizable online booking page.
          </p>

          {/* Highlights */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent-dark"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Rental categories */}
        <div className="mx-auto mt-14 max-w-4xl text-center">
          <p className="text-sm font-medium text-slate-500">
            Manage any rental asset
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {categories.map((c) => (
              <span
                key={c}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">Our Mission</h3>
            <p className="mt-3 leading-relaxed text-slate-600">
              To empower rental businesses with a modern, reliable, and
              intelligent platform that simplifies operations, improves customer
              experiences, and enables sustainable growth through technology.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-dark">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">Our Vision</h3>
            <p className="mt-3 leading-relaxed text-slate-600">
              To become the leading all-in-one rental management platform trusted
              by businesses worldwide supporting every rental industry with
              innovative, scalable, and easy-to-use solutions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
