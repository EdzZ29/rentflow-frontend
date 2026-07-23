import DashboardLayout from '../../components/DashboardLayout';
import PlanExpiredBanner from '../../components/PlanExpiredBanner';
import { OwnerPlanProvider } from '../../context/OwnerPlanContext';

function Icon({ d }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const nav = [
  { to: '/owner', end: true, label: 'Dashboard', icon: <Icon d="M4 5a1 1 0 011-1h5v7H4V5zm10-1h5a1 1 0 011 1v4h-6V4zm0 8h6v7a1 1 0 01-1 1h-5v-8zM4 13h6v7H5a1 1 0 01-1-1v-6z" /> },
  { to: '/owner/businesses', label: 'My Businesses', icon: <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
  {
    label: 'Booking',
    icon: <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    children: [
      { to: '/owner/bookings', end: true, label: 'Manage Booking' },
      { to: '/owner/bookings/custom', label: 'Custom Booking' },
      { to: '/owner/bookings/history', label: 'Booking History' },
      { to: '/owner/bookings/reservations', label: 'Reservation' },
    ],
  },
  { to: '/owner/reports', label: 'Reports & Analytics', icon: <Icon d="M3 3v18h18M9 17V9m4 8V5m4 12v-6" /> },
  { to: '/owner/reviews', label: 'Reviews', icon: <Icon d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.79c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
  { to: '/owner/activity', label: 'Activity Log', icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { to: '/owner/subscription', label: 'Subscription', icon: <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { to: '/owner/support', label: 'Support', icon: <Icon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
  { to: '/owner/profile', label: 'Profile', icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
];

export default function OwnerDashboard() {
  return (
    <OwnerPlanProvider>
      <DashboardLayout nav={nav} roleLabel="Business Owner" banner={<PlanExpiredBanner />} />
    </OwnerPlanProvider>
  );
}
