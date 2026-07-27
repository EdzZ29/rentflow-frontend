// Human labels for the per-category booking detail columns, so a booking's
// details can be listed without knowing which category it came from.
const LABELS = {
  // Vehicles
  driverOption: 'Driver',
  // Events & Party
  eventType: 'Event type',
  venue: 'Venue',
  guestCount: 'Guests',
  quantity: 'Quantity',
  setupNeeded: 'Owner sets up',
  setupTime: 'Setup time',
  isOutdoor: 'Outdoor',
  // Audio & Video
  audienceSize: 'Audience size',
  powerSource: 'Power on site',
  operatorNeeded: 'Operator requested',
  // Photography
  shootType: 'Shoot type',
  shootLocation: 'Shoot location',
  experienceLevel: 'Experience',
  accessories: 'Accessories',
  // Tools & Equipment
  siteAddress: 'Work site',
  jobDescription: 'Job',
  shiftHoursPerDay: 'Hours per day',
  // Sports & Outdoor
  activity: 'Activity',
  destination: 'Destination',
  participantCount: 'Participants',
  sizeNotes: 'Sizes',
  // Property & Spaces
  useType: 'Use',
  occupantCount: 'Occupants',
  checkInTime: 'Check-in',
  checkOutTime: 'Check-out',
  overnightStay: 'Overnight',
  // Other
  useDescription: 'Purpose of use',
  headcount: 'People involved',
};

const VALUE_LABELS = {
  self_drive: 'Self drive',
  with_driver: 'With driver',
  outlet: 'Wall outlet',
  generator: 'Generator',
  none: 'None',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  professional: 'Professional',
};

// Bookkeeping fields that shouldn't be shown as details.
const HIDDEN = new Set(['reservationId', 'categoryKey', 'licenseIdUrl']);

// Turns a details object into [label, displayValue] pairs, skipping empties.
export function detailEntries(details) {
  if (!details) return [];
  return Object.entries(details)
    .filter(([k, v]) => !HIDDEN.has(k) && v !== null && v !== undefined && v !== '')
    .map(([k, v]) => [
      LABELS[k] ?? k,
      typeof v === 'boolean' ? (v ? 'Yes' : 'No') : (VALUE_LABELS[v] ?? String(v)),
    ]);
}
