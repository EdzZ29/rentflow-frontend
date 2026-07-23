import StoreBadges from './StoreBadges';

// "Download the app" marketing banner shown on the landing page.
export default function DownloadApp() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-brand/5 p-8 lg:grid-cols-2 lg:p-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Download the app</h2>
          <p className="mt-3 max-w-md text-slate-600">
            Manage your rental business from anywhere with our mobile apps, available on iOS and Android.
          </p>
          <StoreBadges className="mt-6" />
        </div>

        {/* Decorative phone mockup with floating feature chips */}
        <div className="relative mx-auto hidden h-72 w-full max-w-sm sm:block">
          <div className="absolute left-1/2 top-0 h-72 w-40 -translate-x-1/2 rounded-[2rem] border-[6px] border-slate-900 bg-white shadow-2xl">
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-2/3 rounded bg-slate-100" />
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2">
                  <div className="h-6 w-6 rounded bg-brand/10" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-3/4 rounded bg-slate-100" />
                    <div className="h-2 w-1/2 rounded bg-slate-50" />
                  </div>
                  <div className="h-3 w-8 rounded-full bg-accent/20" />
                </div>
              ))}
            </div>
          </div>

          <Chip className="left-0 top-10" color="bg-brand text-white">Barcode scanner</Chip>
          <Chip className="right-0 top-24" color="bg-white text-slate-700 border border-slate-200">Tap to pay</Chip>
          <Chip className="bottom-6 left-2" color="bg-white text-slate-700 border border-slate-200">Check-in &amp; check-out</Chip>
        </div>
      </div>
    </section>
  );
}

function Chip({ children, className = '', color }) {
  return (
    <span className={`absolute inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md ${color} ${className}`}>
      {children}
    </span>
  );
}
