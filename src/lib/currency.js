// Supported currencies. PHP (₱) is the default across RentFlow.
export const CURRENCIES = [
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso (₱)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' },
];

export const DEFAULT_CURRENCY = 'PHP';

const symbolMap = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.symbol]));

export function currencySymbol(code) {
  return symbolMap[code] || code || '₱';
}

export function formatPrice(amount, code) {
  const n = Number(amount) || 0;
  return `${currencySymbol(code)}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

// Inclusive day count between two YYYY-MM-DD dates (min 1).
export function rentalDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}
