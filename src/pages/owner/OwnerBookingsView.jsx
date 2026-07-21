import { useEffect, useMemo, useState } from 'react';
import BookingsTable from '../../components/BookingsTable';
import { Pagination, SearchInput } from '../../components/table';
import { ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useOwnerPlan } from '../../context/OwnerPlanContext';
import { useRealtime } from '../../context/RealtimeContext';
import { api } from '../../lib/api';

// Reusable owner bookings list. Each page (Manage / History / Reservation)
// supplies a base filter, the status options to offer, and whether to show the
// row actions. Data, search, status filter, pagination, plan-gating, and live
// refresh are handled here.
export default function OwnerBookingsView({
  title,
  subtitle,
  baseFilter,
  statusOptions = [],
  showActions = true,
  emptyLabel = 'bookings',
}) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const { subscribe } = useRealtime();
  const { isActive } = useOwnerPlan();

  const load = () => api.reservations.list().then(setItems).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  useEffect(() => subscribe('reservation', load), [subscribe]);

  const setReservationStatus = async (r, next) => {
    try {
      await api.reservations.updateStatus(r.id, next);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const withReset = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = (items || []).filter(baseFilter);
    if (status !== 'all') rows = rows.filter((r) => r.status === status);
    if (q) {
      rows = rows.filter(
        (r) =>
          r.product?.name?.toLowerCase().includes(q) ||
          r.customer?.fullName?.toLowerCase().includes(q) ||
          r.customer?.email?.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [items, baseFilter, status, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  if (!items && !error) return <Loading />;

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <ErrorNote>{error}</ErrorNote>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <SearchInput value={query} onChange={withReset(setQuery)} placeholder="Search product or customer…" />
          {statusOptions.length > 0 && (
            <select
              value={status}
              onChange={(e) => withReset(setStatus)(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize text-slate-600 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-slate-400">
              No {emptyLabel} found.
            </div>
          ) : (
            <BookingsTable
              rows={pageRows}
              onStatus={setReservationStatus}
              canManage={isActive}
              showActions={showActions}
            />
          )}
        </div>

        <div className="px-4 pb-4 sm:px-5">
          <Pagination page={safePage} pageCount={pageCount} onPage={setPage} perPage={perPage} onPerPage={withReset(setPerPage)} />
        </div>
      </div>
    </div>
  );
}
