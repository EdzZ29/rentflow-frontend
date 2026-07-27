import OwnerBookingsView from './OwnerBookingsView';

// Active bookings (rent-now type) that still need action — including units
// that are out and waiting to come back.
const baseFilter = (r) =>
  r.type !== 'reserve' &&
  (r.status === 'pending' || r.status === 'confirmed' || r.status === 'released');

export default function OwnerManageBookings() {
  return (
    <OwnerBookingsView
      title="Manage Booking"
      subtitle="Approve, release, accept returns, or cancel your active bookings."
      baseFilter={baseFilter}
      statusOptions={['all', 'pending', 'confirmed', 'released']}
      allowAdd
      emptyLabel="active bookings"
    />
  );
}
