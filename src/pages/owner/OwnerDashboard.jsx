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
  { to: '/owner/activity', label: 'Activity Log', icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { to: '/owner/subscription', label: 'Subscription', icon: <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { to: '/owner/profile', label: 'Profile', icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
];

export default function OwnerDashboard() {
  return (
    <OwnerPlanProvider>
      <DashboardLayout nav={nav} roleLabel="Business Owner" banner={<PlanExpiredBanner />} />
    </OwnerPlanProvider>
  );
}
