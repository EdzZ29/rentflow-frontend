import DashboardLayout from '../../components/DashboardLayout';
import SupportWidget from '../../components/SupportWidget';

function Icon({ d }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const nav = [
  { to: '/customer', end: true, label: 'Overview', icon: <Icon d="M4 5a1 1 0 011-1h5v7H4V5zm10-1h5a1 1 0 011 1v4h-6V4zm0 8h6v7a1 1 0 01-1 1h-5v-8zM4 13h6v7H5a1 1 0 01-1-1v-6z" /> },
  { to: '/customer/bookings', label: 'My Bookings', icon: <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { to: '/customer/reviews', label: 'My Reviews', icon: <Icon d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.79c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
  { to: '/rentals', label: 'Browse Rentals', icon: <Icon d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /> },
  { to: '/customer/support', label: 'Support', icon: <Icon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
];

export default function CustomerDashboard() {
  return (
    <>
      <DashboardLayout nav={nav} roleLabel="Customer" />
      <SupportWidget />
    </>
  );
}
