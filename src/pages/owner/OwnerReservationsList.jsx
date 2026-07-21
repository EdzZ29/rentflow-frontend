import OwnerBookingsView from './OwnerBookingsView';

// "Reserve for later" type entries that are still active.
const baseFilter = (r) =>
  r.type === 'reserve' && (r.status === 'pending' || r.status === 'confirmed');

export default function OwnerReservationsList() {
  return (
    <OwnerBookingsView
      title="Reservation"
      subtitle="Held-for-later reservations awaiting pickup."
      baseFilter={baseFilter}
      statusOptions={['all', 'pending', 'confirmed']}
      emptyLabel="reservations"
    />
  );
}
