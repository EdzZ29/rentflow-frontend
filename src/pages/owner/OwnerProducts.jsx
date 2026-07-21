import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Modal from '../../components/Modal';
import { Badge, Card, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useOwnerPlan } from '../../context/OwnerPlanContext';
import { api, assetUrl } from '../../lib/api';
import { CURRENCIES, DEFAULT_CURRENCY, formatPrice } from '../../lib/currency';

const emptyForm = {
  name: '',
  description: '',
  pricePerDay: '',
  currency: DEFAULT_CURRENCY,
  availability: 'available',
};

function CurrencySelect({ value, onChange }) {
  return (
    <select
      name="currency"
      value={value}
      onChange={onChange}
      className="rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>{c.code}</option>
      ))}
    </select>
  );
}

export default function OwnerProducts() {
  const { businessId } = useParams();
  const bid = Number(businessId);
  const [products, setProducts] = useState(null);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited
  const { isActive } = useOwnerPlan();

  const load = () =>
    api.products
      .listByBusiness(bid)
      .then(setProducts)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
    api.businesses.get(bid).then(setBusiness).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bid]);

  const isMarketplace = business?.subscriptionType === 'marketplace';

  const togglePublish = async (p) => {
    try {
      await api.products.update(p.id, { isPublished: !p.isPublished });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await api.products.create({
        businessId: bid,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        pricePerDay: Number(form.pricePerDay) || 0,
        currency: form.currency,
        availability: form.availability,
      });
      if (file) await api.products.uploadImage(created.id, file);
      setForm(emptyForm);
      setFile(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAvail = async (p) => {
    try {
      await api.products.update(p.id, {
        availability: p.availability === 'available' ? 'unavailable' : 'available',
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.products.remove(p.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!products && !error) return <Loading />;

  return (
    <div>
      <Link to="/owner/businesses" className="mb-3 inline-block text-sm text-slate-500 hover:text-brand">
        ← Back to businesses
      </Link>
      <PageHeader title="Products" subtitle="Add and manage the items this business rents out." />

      <ErrorNote>{error}</ErrorNote>

      {business && !isMarketplace && (
        <div className="mb-4 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-slate-600">
          This business is on the <strong>Business Management</strong> plan, so its products stay
          private. Enable the{' '}
          <Link to="/owner/subscription" className="font-semibold text-accent hover:underline">
            Marketplace plan
          </Link>{' '}
          to publish them to customers.
        </div>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {/* Add product */}
        <Card title="Add a product" className="lg:col-span-1">
          {!isActive ? (
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              Your plan has expired.{' '}
              <Link to="/owner/subscription" className="font-semibold underline">
                Subscribe to a plan
              </Link>{' '}
              to add and manage products.
            </div>
          ) : (
          <form onSubmit={onCreate} className="space-y-3">
            <Input label="Product name" name="name" value={form.name} onChange={onChange} required placeholder="Toyota Vios 2022" />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Price per day</span>
              <div className="flex gap-2">
                <CurrencySelect value={form.currency} onChange={onChange} />
                <input type="number" min="0" step="0.01" name="pricePerDay" value={form.pricePerDay} onChange={onChange} required placeholder="500"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
              <textarea name="description" value={form.description} onChange={onChange} rows={2} placeholder="Optional"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Photo</span>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-dark" />
            </label>
            <button type="submit" disabled={saving}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
              {saving ? 'Adding…' : 'Add product'}
            </button>
          </form>
          )}
        </Card>

        {/* Product list */}
        <div className="space-y-4 lg:col-span-2">
          {products?.length === 0 && (
            <Card><p className="text-sm text-slate-500">No products yet. Add your first item.</p></Card>
          )}
          {products?.map((p) => (
            <div key={p.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {p.imageUrl ? (
                  <img src={assetUrl(p.imageUrl)} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-300">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{p.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {isMarketplace && (
                      <Badge tone={p.isPublished ? 'green' : 'slate'}>
                        {p.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    )}
                    <Badge tone={p.availability === 'available' ? 'green' : 'slate'}>{p.availability}</Badge>
                  </div>
                </div>
                <p className="text-sm font-medium text-brand">{formatPrice(p.pricePerDay, p.currency)}/day</p>
                {p.description && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.description}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => setEditing(p)} disabled={!isActive} title={!isActive ? 'Subscribe to edit' : undefined} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Edit</button>
                  <button onClick={() => toggleAvail(p)} disabled={!isActive} title={!isActive ? 'Subscribe to manage' : undefined} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                    {p.availability === 'available' ? 'Mark unavailable' : 'Mark available'}
                  </button>
                  {isMarketplace && (
                    <button
                      onClick={() => togglePublish(p)}
                      disabled={!isActive}
                      title={!isActive ? 'Subscribe to publish' : undefined}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                        p.isPublished
                          ? 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          : 'bg-accent text-white hover:bg-accent-dark'
                      }`}
                    >
                      {p.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  )}
                  <button onClick={() => remove(p)} disabled={!isActive} title={!isActive ? 'Subscribe to delete' : undefined} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}

function EditProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product.name,
    description: product.description || '',
    pricePerDay: String(product.pricePerDay),
    currency: product.currency || DEFAULT_CURRENCY,
    availability: product.availability,
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.products.update(product.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        pricePerDay: Number(form.pricePerDay) || 0,
        currency: form.currency,
        availability: form.availability,
      });
      if (file) await api.products.uploadImage(product.id, file);
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit product" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <ErrorNote>{error}</ErrorNote>
        <Input label="Name" name="name" value={form.name} onChange={onChange} required />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Price per day</span>
          <div className="flex gap-2">
            <CurrencySelect value={form.currency} onChange={onChange} />
            <input type="number" min="0" step="0.01" name="pricePerDay" value={form.pricePerDay} onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
          <textarea name="description" value={form.description} onChange={onChange} rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Availability</span>
          <select name="availability" value={form.availability} onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20">
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Replace photo</span>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-dark" />
        </label>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input {...props} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
    </label>
  );
}
