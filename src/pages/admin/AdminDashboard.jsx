import DashboardLayout from '../../components/DashboardLayout';

function Icon({ d }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const nav = [
  { to: '/admin', end: true, label: 'Overview', icon: <Icon d="M4 5a1 1 0 011-1h5v7H4V5zm10-1h5a1 1 0 011 1v4h-6V4zm0 8h6v7a1 1 0 01-1 1h-5v-8zM4 13h6v7H5a1 1 0 01-1-1v-6z" /> },
  { to: '/admin/clients', label: 'Clients', icon: <Icon d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" /> },
  { to: '/admin/owners', label: 'Owners', icon: <Icon d="M12 7a3 3 0 100-6 3 3 0 000 6zm-6 14v-1a6 6 0 0112 0v1M3 10h18l-1-4H4l-1 4z" /> },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { to: '/admin/bookings', label: 'Bookings', icon: <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
];

export default function AdminDashboard() {
  return <DashboardLayout nav={nav} roleLabel="Admin" />;
}
