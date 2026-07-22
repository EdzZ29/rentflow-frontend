import { useEffect, useState } from 'react';
import Modal from './Modal';
import { ErrorNote } from './ui';
import { api } from '../lib/api';
import { formatPrice } from '../lib/currency';

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

// Modal for owners to manually record a booking for a walk-in or direct-contact
// customer, straight from the Manage Booking page. Calls onCreated on success
// so the caller can refresh its list.
export default function AddBookingModal({ onClose, onCreated }) {
  const [businesses, setBusinesses] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    // Switching business resets the product choice + its list.
    if (name === 'businessId') {
      set({ businessId: value, productId: '' });
      setProducts([]);
    } else {
      set({ [name]: value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.productId) return setError('Please choose a product.');
    if (form.endDate < form.startDate)
      return setError('End date must be on or after the start date.');
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
      onCreated();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title="Add booking" onClose={onClose}>
      <p className="mb-4 -mt-2 text-sm text-slate-500">
        Manually record a booking for a walk-in or direct-contact customer.
      </p>
      <ErrorNote>{error}</ErrorNote>

      <form onSubmit={onSubmit} className="mt-3 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business">
            <select name="businessId" value={form.businessId} onChange={onChange} required className={selectCls}>
              <option value="" disabled>Select a business…</option>
              {(businesses || []).map((b) => (
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
          <Field label="Contact number">
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

        <p className="text-xs text-slate-400">
          If the customer email isn&apos;t registered yet, a customer account is created
          automatically so the booking shows in their account.
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
            {saving ? 'Creating…' : 'Create booking'}
          </button>
        </div>
      </form>
    </Modal>
  );
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
