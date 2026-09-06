// Plan state for the admin views. Mirrors the backend's plan-limits helpers:
// a trial past trialEndsAt, or a paid plan past planEndsAt, behaves like "none".
// A paid plan with no planEndsAt never expires (legacy accounts).

export const PLAN_OPTIONS = [
  { value: 'none', label: 'No plan', hint: 'Paid features locked' },
  { value: 'trial', label: 'Trial', hint: '7 days, 1 business' },
  { value: 'monthly', label: 'Monthly', hint: '30 days, 5 businesses' },
  { value: 'yearly', label: 'Yearly', hint: '365 days, unlimited' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function endDateFor(user) {
  if (!user) return null;
  if (user.plan === 'trial') return user.trialEndsAt || null;
  if (user.plan === 'monthly' || user.plan === 'yearly') return user.planEndsAt || null;
  return null;
}

// Whole days remaining; 0 when lapsed, null when there's no end date at all.
export function daysLeft(user) {
  const end = endDateFor(user);
  if (!end) return null;
  return Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / DAY_MS));
}

export function isExpired(user) {
  const left = daysLeft(user);
  return left === 0;
}

// What the owner effectively has right now, regardless of the stored value.
export function effectivePlan(user) {
  if (!user?.plan || user.plan === 'none') return 'none';
  return isExpired(user) ? 'none' : user.plan;
}

// "24 days left" · "3 months left" · "Expired" · "No expiry"
export function remainingLabel(user) {
  if (!user?.plan || user.plan === 'none') return '—';
  const left = daysLeft(user);
  if (left === null) return 'No expiry';
  if (left === 0) return 'Expired';
  if (left < 60) return `${left} day${left === 1 ? '' : 's'} left`;
  const months = Math.round(left / 30);
  return `${months} month${months === 1 ? '' : 's'} left`;
}

// Tone for the remaining-time badge: red once lapsed, amber in the last week.
export function remainingTone(user) {
  if (!user?.plan || user.plan === 'none') return 'slate';
  const left = daysLeft(user);
  if (left === null) return 'blue';
  if (left === 0) return 'red';
  if (left <= 7) return 'amber';
  return 'green';
}

export function planEndsOn(user) {
  const end = endDateFor(user);
  return end ? new Date(end).toLocaleDateString() : null;
}

// Whether moving to `next` loses the owner capability they have now.
export function isDowngrade(current, next) {
  const rank = { none: 0, trial: 1, monthly: 2, yearly: 3 };
  return (rank[next] ?? 0) < (rank[current] ?? 0);
}
