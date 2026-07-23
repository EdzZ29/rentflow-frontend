// Owners enter a business location as free text (e.g. "Makati, Metro Manila"
// or just "Cebu City"). For the customer-facing cards we show only the city —
// the first comma-separated segment, which is the city in the common
// "City, Province" and plain-"City" formats.
export function cityOf(location) {
  if (!location) return '';
  return location.split(',')[0].trim();
}
