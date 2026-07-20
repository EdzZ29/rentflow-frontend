// Phone input with a country/flag selector on the left, live formatting of the
// national number, and a shared validator. The parent keeps two pieces of state:
// a country code (e.g. "PH") and the formatted national number string.

export const PHONE_COUNTRIES = [
  { code: 'PH', flag: '🇵🇭', dial: '63', name: 'Philippines', len: 10, groups: [3, 3, 4], hint: '917 123 4567' },
  { code: 'US', flag: '🇺🇸', dial: '1', name: 'United States', len: 10, groups: [3, 3, 4], hint: '415 555 0132' },
  { code: 'SG', flag: '🇸🇬', dial: '65', name: 'Singapore', len: 8, groups: [4, 4], hint: '8123 4567' },
  { code: 'AU', flag: '🇦🇺', dial: '61', name: 'Australia', len: 9, groups: [3, 3, 3], hint: '412 345 678' },
  { code: 'GB', flag: '🇬🇧', dial: '44', name: 'United Kingdom', len: 10, groups: [4, 6], hint: '7400 123456' },
  { code: 'AE', flag: '🇦🇪', dial: '971', name: 'UAE', len: 9, groups: [2, 3, 4], hint: '50 123 4567' },
  { code: 'JP', flag: '🇯🇵', dial: '81', name: 'Japan', len: 10, groups: [2, 4, 4], hint: '90 1234 5678' },
  { code: 'HK', flag: '🇭🇰', dial: '852', name: 'Hong Kong', len: 8, groups: [4, 4], hint: '5123 4567' },
];

export function phoneCountry(code) {
  return PHONE_COUNTRIES.find((c) => c.code === code) ?? PHONE_COUNTRIES[0];
}

// Keep only digits, capped at the country's national-number length.
export function digitsOnly(code, raw) {
  const c = phoneCountry(code);
  return (raw || '').replace(/\D/g, '').slice(0, c.len);
}

// Group the digits for display, e.g. "9171234567" → "917 123 4567".
export function formatPhone(code, raw) {
  const c = phoneCountry(code);
  const digits = digitsOnly(code, raw);
  const parts = [];
  let i = 0;
  for (const g of c.groups) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + g));
    i += g;
  }
  if (i < digits.length) parts.push(digits.slice(i));
  return parts.join(' ');
}

export function phoneIsValid(code, raw) {
  const c = phoneCountry(code);
  const digits = digitsOnly(code, raw);
  if (digits.length !== c.len) return false;
  // Philippine mobile numbers are 10 digits and start with 9.
  if (code === 'PH' && !digits.startsWith('9')) return false;
  return true;
}

// Full international form for storage, e.g. "+63 917 123 4567".
export function fullPhone(code, raw) {
  return `+${phoneCountry(code).dial} ${formatPhone(code, raw)}`;
}

export default function PhoneInput({ country, value, onCountryChange, onValueChange, error, name = 'phone' }) {
  const c = phoneCountry(country);
  return (
    <div>
      <div
        className={`flex items-stretch overflow-hidden rounded-lg border transition-colors focus-within:ring-2 ${
          error
            ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-100'
            : 'border-slate-300 focus-within:border-accent focus-within:ring-accent/20'
        }`}
      >
        <div className="relative flex items-center border-r border-slate-200 bg-slate-50">
          <span className="pointer-events-none absolute left-3 flex items-center gap-1 text-sm">
            <span aria-hidden>{c.flag}</span>
            <span className="text-slate-600">+{c.dial}</span>
            <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
          <select
            aria-label="Country calling code"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="appearance-none bg-transparent py-2.5 pl-3 pr-9 text-sm text-transparent outline-none"
          >
            {PHONE_COUNTRIES.map((pc) => (
              <option key={pc.code} value={pc.code} className="text-slate-900">
                {pc.flag} {pc.name} (+{pc.dial})
              </option>
            ))}
          </select>
        </div>
        <input
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          maxLength={c.len + c.groups.length}
          onChange={(e) => onValueChange(formatPhone(country, e.target.value))}
          aria-invalid={!!error}
          placeholder={c.hint}
          className="w-full bg-white px-3 py-2.5 text-sm text-slate-900 outline-none"
        />
      </div>
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        <span className="mt-1 block text-xs text-slate-400">Enter your {c.len}-digit number, e.g. {c.hint}</span>
      )}
    </div>
  );
}
