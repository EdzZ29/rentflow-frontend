import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BusinessPackages from '../../components/BusinessPackages';
import Modal from '../../components/Modal';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useOwnerPlan } from '../../context/OwnerPlanContext';
import { api, assetUrl } from '../../lib/api';
import { CURRENCIES, DEFAULT_CURRENCY, formatPrice } from '../../lib/currency';

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
  const [creating, setCreating] = useState(false); // create-product modal open
  const [editing, setEditing] = useState(null); // product being edited
  const [viewing, setViewing] = useState(null); // product whose details are open
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

      {/* Products table */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Products <span className="text-slate-400">({products?.length ?? 0})</span>
          </h2>
          <button
            onClick={() => setCreating(true)}
            disabled={!isActive}
            title={!isActive ? 'Subscribe to a plan to add products' : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon /> Create Product
          </button>
        </div>

        <div className="overflow-x-auto">
          {products?.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-400">
              No products yet. Click <strong>Create Product</strong> to add your first item.
            </p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <Th>Product</Th>
                  <Th>Price / day</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products?.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => (isActive ? setEditing(p) : setViewing(p))}
                    className="cursor-pointer transition-colors hover:bg-slate-50/70"
                    title={isActive ? 'Click to edit' : 'Click to view'}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {p.imageUrl ? (
                            <img src={assetUrl(p.imageUrl)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-slate-300">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{p.name}</p>
                          {p.description && <p className="truncate text-xs text-slate-400">{p.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-brand">
                      {formatPrice(p.pricePerDay, p.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={p.availability === 'available' ? 'green' : 'slate'}>{p.availability}</Badge>
                        <Badge tone={isMarketplace && p.isPublished ? 'green' : 'slate'}>
                          {isMarketplace && p.isPublished ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <RowBtn onClick={() => setViewing(p)} tone="brand">Details</RowBtn>
                        <RowBtn onClick={() => setEditing(p)} disabled={!isActive} title={!isActive ? 'Subscribe to edit' : undefined}>Edit</RowBtn>
                        <RowBtn
                          onClick={() => togglePublish(p)}
                          disabled={!isActive || !isMarketplace}
                          tone={isMarketplace && p.isPublished ? 'default' : 'accent'}
                          title={
                            !isMarketplace
                              ? 'Enable Marketplace for this business to make items public'
                              : !isActive
                                ? 'Subscribe to change visibility'
                                : undefined
                          }
                        >
                          {isMarketplace && p.isPublished ? 'Make private' : 'Make public'}
                        </RowBtn>
                        <RowBtn onClick={() => remove(p)} disabled={!isActive} tone="danger" title={!isActive ? 'Subscribe to delete' : undefined}>Delete</RowBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Packages — owner-defined bundles for this business */}
      <BusinessPackages businessId={bid} isActive={isActive} isMarketplace={isMarketplace} />

      {creating && (
        <CreateProductModal
          businessId={bid}
          onClose={() => setCreating(false)}
          onSaved={async () => { setCreating(false); await load(); }}
        />
      )}

      {editing && (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}

      {viewing && (
        <ProductDetailsModal
          product={viewing}
          isMarketplace={isMarketplace}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 ${className}`}>
      {children}
    </th>
  );
}

const ROW_BTN_TONES = {
  default: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
  brand: 'bg-brand/10 text-brand hover:bg-brand/15',
  accent: 'bg-accent text-white hover:bg-accent-dark',
  danger: 'border border-red-200 text-red-600 hover:bg-red-50',
};

function RowBtn({ children, tone = 'default', className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-md px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${ROW_BTN_TONES[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

// Full product details plus a payment estimation across common rental durations.
const ESTIMATE_DURATIONS = [
  { days: 1, label: '1 day' },
  { days: 3, label: '3 days' },
  { days: 7, label: '1 week' },
  { days: 14, label: '2 weeks' },
  { days: 30, label: '1 month' },
];

function ProductDetailsModal({ product, isMarketplace, onClose }) {
  const rate = Number(product.pricePerDay) || 0;
  return (
    <Modal title={product.name} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {product.imageUrl ? (
              <img src={assetUrl(product.imageUrl)} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-slate-300">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-brand">{formatPrice(rate, product.currency)}<span className="text-sm font-normal text-slate-400">/day</span></p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge tone={product.availability === 'available' ? 'green' : 'slate'}>{product.availability}</Badge>
              <Badge tone={isMarketplace && product.isPublished ? 'green' : 'slate'}>
                {isMarketplace && product.isPublished ? 'Public' : 'Private'}
              </Badge>
            </div>
          </div>
        </div>

        {product.description && (
          <div>
            <Dt>Description</Dt>
            <p className="mt-1 text-sm text-slate-600">{product.description}</p>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-slate-50 p-4 text-sm">
          <Detail label="Currency" value={product.currency} />
          <Detail label="Daily rate" value={formatPrice(rate, product.currency)} />
          {product.createdAt && (
            <Detail label="Added" value={new Date(product.createdAt).toLocaleDateString()} />
          )}
          {product.updatedAt && (
            <Detail label="Last updated" value={new Date(product.updatedAt).toLocaleDateString()} />
          )}
        </dl>

        {/* Payment estimation */}
        <div>
          <Dt>Payment estimation</Dt>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-1 font-semibold">Duration</th>
                <th className="pb-1 text-right font-semibold">Estimated total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ESTIMATE_DURATIONS.map((d) => (
                <tr key={d.days}>
                  <td className="py-1.5 text-slate-600">{d.label}</td>
                  <td className="py-1.5 text-right font-semibold text-slate-900">
                    {formatPrice(rate * d.days, product.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-400">
            Estimates are the daily rate × number of days and exclude any deposits or add-ons.
          </p>
        </div>
      </div>
    </Modal>
  );
}

function Dt({ children }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</p>;
}

function Detail({ label, value }) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </>
  );
}

const emptyForm = {
  name: '',
  description: '',
  pricePerDay: '',
  currency: DEFAULT_CURRENCY,
  availability: 'available',
};

function CreateProductModal({ businessId, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await api.products.create({
        businessId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        pricePerDay: Number(form.pricePerDay) || 0,
        currency: form.currency,
        availability: form.availability,
      });
      if (file) await api.products.uploadImage(created.id, file);
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Create product" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <ErrorNote>{error}</ErrorNote>
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
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
            {saving ? 'Creating…' : 'Create product'}
          </button>
        </div>
      </form>
    </Modal>
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
