import DashboardLayout from '../../components/DashboardLayout';

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
  { to: '/rentals', label: 'Browse Rentals', icon: <Icon d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /> },
];

export default function CustomerDashboard() {
  return <DashboardLayout nav={nav} roleLabel="Customer" />;
}
