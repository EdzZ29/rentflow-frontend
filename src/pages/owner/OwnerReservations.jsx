import { useEffect, useMemo, useState } from 'react';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { Avatar, Pagination, SearchInput, Tabs } from '../../components/table';
import { api, assetUrl } from '../../lib/api';
import { formatPrice, rentalDays } from '../../lib/currency';

const STATUS_TONE = { pending: 'amber', confirmed: 'green', cancelled: 'red', completed: 'blue' };
const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const money = (r) => rentalDays(r.startDate, r.endDate) * Number(r.product?.pricePerDay || 0);
const isEarning = (r) => r.status === 'confirmed' || r.status === 'completed';

export default function OwnerReservations() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('bookings');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const load = () => api.reservations.list().then(setItems).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const setReservationStatus = async (r, next) => {
    try {
      await api.reservations.updateStatus(r.id, next);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const { bookings, reservations, pendingCount } = useMemo(() => {
    const list = items || [];
    return {
      bookings: list.filter((r) => r.type !== 'reserve'),
      reservations: list.filter((r) => r.type === 'reserve'),
      pendingCount: list.filter((r) => r.status === 'pending').length,
    };
  }, [items]);

  // Aggregate unique customers across every reservation.
  const customers = useMemo(() => {
    const map = new Map();
    (items || []).forEach((r) => {
      const key = r.customer?.email || r.customerId;
      const cur =
        map.get(key) ||
        { name: r.customer?.fullName || 'Unknown', email: r.customer?.email || '—', phone: '', bookings: 0, spent: 0, last: '', currency: r.product?.currency };
      cur.bookings += 1;
      if (isEarning(r)) cur.spent += money(r);
      if (r.startDate > cur.last) cur.last = r.startDate;
      if (!cur.phone && r.contactPhone) cur.phone = r.contactPhone;
      map.set(key, cur);
    });
    return [...map.values()];
  }, [items]);

  // Rows for the active tab, after search + status filtering.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (tab === 'customers') {
      return customers.filter(
        (c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      );
    }
    let rows = tab === 'reservations' ? reservations : bookings;
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
  }, [tab, status, query, bookings, reservations, customers]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  // Change a filter and jump back to the first page.
  const withReset = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  if (!items && !error) return <Loading />;

  const tabs = [
    { key: 'bookings', label: 'Bookings', count: bookings.length },
    { key: 'reservations', label: 'Reservations', count: reservations.length },
    { key: 'customers', label: 'Customers', count: customers.length },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Bookings"
        subtitle="Review, approve, and track every booking, reservation, and customer."
      />
      <ErrorNote>{error}</ErrorNote>

      {pendingCount > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have <strong>{pendingCount}</strong> request{pendingCount === 1 ? '' : 's'} waiting for approval.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="px-4 pt-2 sm:px-5">
          <Tabs tabs={tabs} active={tab} onChange={withReset(setTab)} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <SearchInput value={query} onChange={withReset(setQuery)} placeholder={tab === 'customers' ? 'Search customers…' : 'Search product or customer…'} />
          {tab !== 'customers' && (
            <select
              value={status}
              onChange={(e) => withReset(setStatus)(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize text-slate-600 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-slate-400">
              No {tab} found.
            </div>
          ) : tab === 'customers' ? (
            <CustomerTable rows={pageRows} />
          ) : (
            <BookingTable rows={pageRows} onStatus={setReservationStatus} />
          )}
        </div>

        <div className="px-4 pb-4 sm:px-5">
          <Pagination page={safePage} pageCount={pageCount} onPage={setPage} perPage={perPage} onPerPage={withReset(setPerPage)} />
        </div>
      </div>
    </div>
  );
}

/* ── Tables ─────────────────────────────────────────────── */

function Th({ children, className = '' }) {
  return (
    <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 ${className}`}>
      {children}
    </th>
  );
}

function BookingTable({ rows, onStatus }) {
  return (
    <table className="w-full min-w-[820px] border-collapse text-sm">
      <thead className="border-y border-slate-100 bg-slate-50/60">
        <tr>
          <Th>Product</Th>
          <Th>Customer</Th>
          <Th>Schedule</Th>
          <Th>Amount</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r) => {
          const days = rentalDays(r.startDate, r.endDate);
          const img = assetUrl(r.product?.imageUrl);
          return (
            <tr key={r.id} className="transition-colors hover:bg-slate-50/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {img ? (
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-300">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{r.product?.name}</p>
                    <p className="truncate text-xs text-slate-400">{r.product?.business?.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.customer?.fullName} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{r.customer?.fullName}</p>
                    <p className="truncate text-xs text-slate-400">{r.customer?.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-slate-600">
                <p className="whitespace-nowrap">{r.startDate} → {r.endDate}</p>
                <p className="text-xs text-slate-400">{days} day{days === 1 ? '' : 's'}</p>
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-900">
                {formatPrice(money(r), r.product?.currency)}
              </td>
              <td className="px-5 py-3">
                <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1.5">
                  {r.status === 'pending' && (
                    <button onClick={() => onStatus(r, 'confirmed')} className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark">
                      Approve
                    </button>
                  )}
                  {r.status === 'confirmed' && (
                    <button onClick={() => onStatus(r, 'completed')} className="rounded-md border border-brand px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/5">
                      Complete
                    </button>
                  )}
                  {(r.status === 'pending' || r.status === 'confirmed') ? (
                    <button onClick={() => onStatus(r, 'cancelled')} className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      {r.status === 'pending' ? 'Decline' : 'Cancel'}
                    </button>
                  ) : (
                    <span className="px-1 text-xs text-slate-300">—</span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CustomerTable({ rows }) {
  return (
    <table className="w-full min-w-[720px] border-collapse text-sm">
      <thead className="border-y border-slate-100 bg-slate-50/60">
        <tr>
          <Th>Customer</Th>
          <Th>Contact</Th>
          <Th>Bookings</Th>
          <Th>Total spent</Th>
          <Th>Last activity</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((c) => (
          <tr key={c.email} className="transition-colors hover:bg-slate-50/60">
            <td className="px-5 py-3">
              <div className="flex items-center gap-2.5">
                <Avatar name={c.name} size="h-9 w-9" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{c.name}</p>
                  <p className="truncate text-xs text-slate-400">{c.email}</p>
                </div>
              </div>
            </td>
            <td className="whitespace-nowrap px-5 py-3 text-slate-600">{c.phone || '—'}</td>
            <td className="px-5 py-3">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {c.bookings}
              </span>
            </td>
            <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-900">{formatPrice(c.spent, c.currency)}</td>
            <td className="whitespace-nowrap px-5 py-3 text-slate-500">{c.last || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
