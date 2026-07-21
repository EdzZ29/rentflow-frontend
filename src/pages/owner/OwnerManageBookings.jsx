import OwnerBookingsView from './OwnerBookingsView';

// Active bookings (rent-now type) that still need action.
const baseFilter = (r) =>
  r.type !== 'reserve' && (r.status === 'pending' || r.status === 'confirmed');

export default function OwnerManageBookings() {
  return (
    <OwnerBookingsView
      title="Manage Booking"
      subtitle="Approve, complete, or cancel your active bookings."
      baseFilter={baseFilter}
      statusOptions={['all', 'pending', 'confirmed']}
      emptyLabel="active bookings"
    />
  );
}
