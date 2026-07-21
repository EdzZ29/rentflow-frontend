import { Link } from 'react-router-dom';
import { useOwnerPlan } from '../context/OwnerPlanContext';

// Shown across the owner area while the plan has lapsed. Data stays visible;
// this explains why create/edit/delete actions are disabled.
export default function PlanExpiredBanner() {
  const { isActive, loading } = useOwnerPlan();
  if (loading || isActive) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-900">Your plan has expired</p>
          <p className="text-sm text-amber-800">
            All your data is safe. Subscribe again to add or edit businesses and products and manage bookings.
          </p>
        </div>
      </div>
      <Link
        to="/owner/subscription"
        className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
      >
        Subscribe to unlock
      </Link>
    </div>
  );
}
