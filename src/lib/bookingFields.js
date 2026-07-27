// Category-specific booking questions.
//
// Each category maps to its own detail table in the API, and every `name` here
// matches a column in that table. The booking wizard renders these generically,
// so adding a question is a one-line change here plus a backend column.
//
// Field types: text | textarea | number | time | select | toggle

const POWER_SOURCES = [
  { value: 'outlet', label: 'Wall outlet on site' },
  { value: 'generator', label: 'Generator (mine)' },
  { value: 'none', label: 'No  power available' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'professional', label: 'Professional' },
];

export const CATEGORY_BOOKING_FIELDS = {
  // Vehicles keep their own bespoke driver UI in the wizard, so only the
  // fields that render generically are listed here.
  Vehicles: { key: 'vehicle', title: 'Vehicle details', fields: [] },

  'Events & Party': {
    key: 'event',
    title: 'Event details',
    fields: [
      {
        name: 'eventType',
        label: 'What kind of event?',
        type: 'select',
        required: true,
        options: ['Birthday', 'Wedding', 'Corporate', 'Reunion', 'Fiesta', 'Funeral', 'Other'],
      },
      { name: 'venue', label: 'Event venue', type: 'text', required: true, placeholder: 'Hall, address or landmark' },
      { name: 'guestCount', label: 'Expected guests', type: 'number', required: true, min: 1, placeholder: '150' },
      { name: 'quantity', label: 'How many sets/units?', type: 'number', min: 1, placeholder: '10' },
      { name: 'isOutdoor', label: 'Outdoor venue', type: 'toggle', hint: 'Affects covering and setup' },
      { name: 'setupNeeded', label: 'Owner sets up and tears down', type: 'toggle' },
      { name: 'setupTime', label: 'Setup time', type: 'time', showIf: (v) => v.setupNeeded },
    ],
  },

  'Audio & Video': {
    key: 'audio',
    title: 'Event & venue details',
    fields: [
      { name: 'venue', label: 'Where will it be used?', type: 'text', required: true, placeholder: 'Venue or address' },
      { name: 'audienceSize', label: 'Audience size', type: 'number', required: true, min: 1, placeholder: '200' },
      {
        name: 'powerSource',
        label: 'Power available on site',
        type: 'select',
        required: true,
        options: POWER_SOURCES,
      },
      { name: 'isOutdoor', label: 'Outdoor setup', type: 'toggle' },
      { name: 'operatorNeeded', label: 'Send a technician to operate it', type: 'toggle' },
      { name: 'setupTime', label: 'Setup time', type: 'time' },
    ],
  },

  Photography: {
    key: 'photo',
    title: 'Shoot details',
    fields: [
      {
        name: 'shootType',
        label: 'What kind of shoot?',
        type: 'select',
        required: true,
        options: ['Wedding', 'Portrait', 'Event', 'Product', 'Real estate', 'Travel', 'Other'],
      },
      { name: 'shootLocation', label: 'Shoot location', type: 'text', required: true, placeholder: 'Studio, venue or area' },
      {
        name: 'experienceLevel',
        label: 'Your experience with this gear',
        type: 'select',
        required: true,
        options: EXPERIENCE_LEVELS,
      },
      { name: 'accessories', label: 'Extra accessories needed', type: 'textarea', placeholder: 'Lenses, batteries, memory cards, tripod…' },
    ],
  },

  'Tools & Equipment': {
    key: 'tool',
    title: 'Job site details',
    fields: [
      { name: 'siteAddress', label: 'Work site address', type: 'text', required: true, placeholder: 'Where the equipment will be used' },
      { name: 'jobDescription', label: 'What is the job?', type: 'textarea', required: true, placeholder: 'e.g. concrete slab pour, roof repair' },
      { name: 'shiftHoursPerDay', label: 'Running hours per day', type: 'number', min: 1, max: 24, placeholder: '8' },
      { name: 'powerSource', label: 'Power available on site', type: 'select', options: POWER_SOURCES },
      { name: 'operatorNeeded', label: 'Send a trained operator', type: 'toggle' },
    ],
  },

  'Sports & Outdoor': {
    key: 'sport',
    title: 'Activity details',
    fields: [
      { name: 'activity', label: 'What activity?', type: 'text', required: true, placeholder: 'e.g. island hopping, trail ride' },
      { name: 'participantCount', label: 'How many people?', type: 'number', required: true, min: 1, placeholder: '4' },
      { name: 'destination', label: 'Destination', type: 'text', placeholder: 'Where are you heading?' },
      { name: 'sizeNotes', label: 'Sizes needed', type: 'text', placeholder: 'e.g. 2 medium helmets, 1 large wetsuit' },
      { name: 'experienceLevel', label: 'Experience level', type: 'select', options: EXPERIENCE_LEVELS },
    ],
  },

  'Property & Spaces': {
    key: 'space',
    title: 'Use of the space',
    fields: [
      {
        name: 'useType',
        label: 'What will you use it for?',
        type: 'select',
        required: true,
        options: ['Event', 'Photo/video shoot', 'Meeting', 'Workshop', 'Stay', 'Other'],
      },
      { name: 'occupantCount', label: 'How many people?', type: 'number', required: true, min: 1, placeholder: '20' },
      { name: 'checkInTime', label: 'Check-in time', type: 'time' },
      { name: 'checkOutTime', label: 'Check-out time', type: 'time' },
      { name: 'overnightStay', label: 'Overnight stay', type: 'toggle' },
    ],
  },

  Other: {
    key: 'other',
    title: 'Booking details',
    fields: [
      { name: 'useDescription', label: 'What do you need it for?', type: 'textarea', required: true, placeholder: 'Describe how you plan to use it' },
      { name: 'quantity', label: 'How many units?', type: 'number', min: 1, placeholder: '1' },
      { name: 'headcount', label: 'How many people involved?', type: 'number', min: 1, placeholder: '5' },
    ],
  },
};

const FALLBACK = CATEGORY_BOOKING_FIELDS.Other;

export function bookingFieldsFor(category) {
  return CATEGORY_BOOKING_FIELDS[category] || FALLBACK;
}

// Normalises a field's options into { value, label } pairs.
export function fieldOptions(field) {
  return (field.options || []).map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  );
}

// Fields currently visible, honouring any showIf condition.
export function visibleFields(spec, values) {
  return spec.fields.filter((f) => !f.showIf || f.showIf(values));
}
