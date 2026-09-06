// Clerk configuration for the web app.
//
// The publishable key is public by design — it ships in the bundle and only
// identifies the Clerk instance. The *secret* key must never be exposed to the
// client, so it never belongs in a VITE_-prefixed variable (Vite inlines those
// into the build).
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Fail loudly at startup rather than deep inside Clerk with an opaque error.
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env, paste the ' +
      'key from the Clerk Dashboard → API keys, then restart the dev server.',
  );
}

// Where Clerk's prebuilt flows live in our router. Kept here so the provider,
// the pages, and any redirect share one definition.
export const SIGN_IN_URL = '/sign-in';
export const SIGN_UP_URL = '/sign-up';

// Rentivo styling for Clerk's prebuilt components. The colours mirror the
// design tokens in index.css (--color-accent, --color-brand); Clerk can't read
// CSS variables from our stylesheet, so they're repeated literally.
export const clerkAppearance = {
  variables: {
    colorPrimary: '#56aea1',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    colorDanger: '#b91c1c',
    colorBackground: '#ffffff',
    borderRadius: '0.5rem',
    fontFamily: '"Open Sans", ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  elements: {
    // AuthLayout already supplies the page shell, so drop Clerk's own card
    // chrome and let the widget sit flush in the left-hand column.
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none border-0',
    card: 'w-full bg-transparent shadow-none p-0 gap-6',
    headerTitle: 'text-3xl font-bold tracking-tight text-slate-900',
    headerSubtitle: 'text-slate-500',
    socialButtonsBlockButton:
      'border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors',
    formButtonPrimary:
      'bg-accent hover:bg-accent-dark text-white text-sm font-semibold normal-case shadow-none',
    formFieldInput:
      'border-slate-300 focus:border-accent focus:ring-2 focus:ring-accent/20',
    footerActionLink: 'text-accent hover:text-accent-dark font-semibold',
    // Clerk renders its own "Secured by Clerk" footer; the app already has one.
    footer: 'bg-transparent',
  },
};
