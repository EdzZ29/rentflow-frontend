// Rental categories with an icon for each — kept in one place so the browse
// page, cards, and mega menu stay consistent.
export const CATEGORIES = [
  { name: 'Vehicles', icon: 'M3 13l1-4h13l3 4v4h-2m-4 0H9m-4 0H3v-4m2 4a2 2 0 104 0m6 0a2 2 0 104 0' },
  { name: 'Events & Party', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { name: 'Audio & Video', icon: 'M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z' },
  { name: 'Photography', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z' },
  { name: 'Tools & Equipment', icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63' },
  { name: 'Sports & Outdoor', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { name: 'Property & Spaces', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Other', icon: 'M4 6a2 2 0 012-2h2l2 3h6a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6z' },
];

const iconMap = Object.fromEntries(CATEGORIES.map((c) => [c.name, c.icon]));

export function categoryIcon(name) {
  return iconMap[name] ?? CATEGORIES[CATEGORIES.length - 1].icon;
}
