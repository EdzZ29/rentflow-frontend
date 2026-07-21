import OwnerBookingsView from './OwnerBookingsView';

// Read-only archive: everything that's completed or cancelled (any type).
const baseFilter = (r) => r.status === 'completed' || r.status === 'cancelled';

export default function OwnerBookingHistory() {
  return (
    <OwnerBookingsView
      title="Booking History"
      subtitle="Your completed and cancelled bookings and reservations."
      baseFilter={baseFilter}
      statusOptions={['all', 'completed', 'cancelled']}
      showActions={false}
      emptyLabel="past bookings"
    />
  );
}
