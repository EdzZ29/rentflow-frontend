function AppleIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.6 2.3a1 1 0 00-.6.9v17.6a1 1 0 00.6.9l10-9.7-10-9.7z" fill="#00D2FF" />
      <path d="M16.3 8.9L13.6 12l2.7 3.1 4.1-2.4c.9-.5.9-1.8 0-2.3l-4.1-2.4z" fill="#FFCE00" />
      <path d="M3 21.7c.2.1.5.1.8-.1l12.5-7.3-2.7-3.1L3 21.7z" fill="#00F076" />
      <path d="M3.8 2.2c-.3-.2-.6-.2-.8-.1l10.6 10.3 2.7-3.1L3.8 2.2z" fill="#FF3A44" />
    </svg>
  );
}

export default function StoreBadges({ className = '' }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href="#ios"
        className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-2.5 text-white transition-colors hover:bg-slate-800"
      >
        <AppleIcon />
        <span className="text-left leading-tight">
          <span className="block text-[10px] opacity-80">Download on the</span>
          <span className="block text-base font-semibold">App Store</span>
        </span>
      </a>

      <a
        href="#android"
        className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-2.5 text-white transition-colors hover:bg-slate-800"
      >
        <PlayIcon />
        <span className="text-left leading-tight">
          <span className="block text-[10px] opacity-80">Get it on</span>
          <span className="block text-base font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  );
}
