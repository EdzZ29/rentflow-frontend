import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useOwnerPlan } from '../../context/OwnerPlanContext';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/currency';

const today = () => new Date().toISOString().slice(0, 10);

const empty = {
  businessId: '',
  productId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  startDate: today(),
  endDate: today(),
  status: 'confirmed',
  note: '',
};

export default function OwnerCustomBooking() {
  const navigate = useNavigate();
  const { isActive } = useOwnerPlan();
  const [businesses, setBusinesses] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    api.businesses.list().then(setBusinesses).catch((e) => setError(e.message));
  }, []);

  // Load the selected business's products when it changes.
  useEffect(() => {
    if (!form.businessId) return undefined;
    let cancelled = false;
    api.products
      .listByBusiness(Number(form.businessId))
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [form.businessId]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const onChange = (e) => {
    const { name, value } = e.target;
    // Switching business resets the product choice + its list (event handler,
    // so no cascading-render lint issue).
    if (name === 'businessId') {
      set({ businessId: value, productId: '' });
      setProducts([]);
    } else {
      set({ [name]: value });
    }
  };

  const selectedProduct = products.find((p) => p.id === Number(form.productId));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk('');
    if (!form.productId) return setError('Please choose a product.');
    if (form.endDate < form.startDate) return setError('End date must be on or after the start date.');
    setSaving(true);
    try {
      await api.bookings.createForOwner({
        productId: Number(form.productId),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        note: form.note.trim() || undefined,
      });
      setOk('Booking created.');
      setForm((f) => ({ ...empty, businessId: f.businessId }));
      setTimeout(() => navigate('/owner/bookings'), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!businesses && !error) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Custom Booking"
        subtitle="Manually record a booking for a walk-in or phone customer."
      />

      {!isActive ? (
        <Card>
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            Your plan has expired.{' '}
            <Link to="/owner/subscription" className="font-semibold underline">
              Subscribe to a plan
            </Link>{' '}
            to create bookings.
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="New booking" className="lg:col-span-2">
            <ErrorNote>{error}</ErrorNote>
            {ok && (
              <div className="mb-3 rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent-dark">{ok}</div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business">
                  <select name="businessId" value={form.businessId} onChange={onChange} required className={selectCls}>
                    <option value="" disabled>Select a business…</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Product">
                  <select name="productId" value={form.productId} onChange={onChange} required disabled={!form.businessId} className={selectCls}>
                    <option value="" disabled>
                      {form.businessId ? 'Select a product…' : 'Choose a business first'}
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatPrice(p.pricePerDay, p.currency)}/day
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Customer name">
                  <input name="customerName" value={form.customerName} onChange={onChange} required placeholder="Jane Dela Cruz" className={inputCls} />
                </Field>
                <Field label="Customer email">
                  <input type="email" name="customerEmail" value={form.customerEmail} onChange={onChange} required placeholder="jane@example.com" className={inputCls} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Contact number (optional)">
                  <input name="customerPhone" value={form.customerPhone} onChange={onChange} placeholder="09xx xxx xxxx" className={inputCls} />
                </Field>
                <Field label="Start date">
                  <input type="date" name="startDate" value={form.startDate} onChange={onChange} required className={inputCls} />
                </Field>
                <Field label="End date">
                  <input type="date" name="endDate" value={form.endDate} min={form.startDate} onChange={onChange} required className={inputCls} />
                </Field>
              </div>

              <Field label="Status">
                <select name="status" value={form.status} onChange={onChange} className={selectCls}>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                </select>
              </Field>

              <Field label="Note (optional)">
                <textarea name="note" value={form.note} onChange={onChange} rows={2} placeholder="Anything to remember about this booking…" className={inputCls} />
              </Field>

              <button type="submit" disabled={saving} className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60 sm:w-auto sm:px-8">
                {saving ? 'Creating…' : 'Create booking'}
              </button>
            </form>
          </Card>

          {/* Summary */}
          <Card title="Summary">
            <dl className="space-y-3 text-sm">
              <Row label="Customer" value={form.customerName || '—'} />
              <Row label="Product" value={selectedProduct?.name || '—'} />
              <Row label="Dates" value={`${form.startDate} → ${form.endDate}`} />
              <Row
                label="Estimated total"
                value={
                  selectedProduct
                    ? formatPrice(
                        Math.max(1, daysBetween(form.startDate, form.endDate)) *
                          Number(selectedProduct.pricePerDay || 0),
                        selectedProduct.currency,
                      )
                    : '—'
                }
              />
            </dl>
            <p className="mt-4 text-xs text-slate-400">
              If the customer email isn&apos;t registered yet, a customer account is created
              automatically so the booking shows in their account.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

// Inclusive day count between two YYYY-MM-DD strings.
function daysBetween(start, end) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20';
const selectCls = `${inputCls} disabled:cursor-not-allowed disabled:bg-slate-50`;

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
