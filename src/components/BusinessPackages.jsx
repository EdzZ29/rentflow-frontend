import { useEffect, useState } from 'react';
import Modal from './Modal';
import { Badge, ErrorNote } from './ui';
import { api } from '../lib/api';
import { CURRENCIES, DEFAULT_CURRENCY, formatPrice } from '../lib/currency';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  currency: DEFAULT_CURRENCY,
  priceUnit: 'package',
  availability: 'available',
  itemsText: '',
};

// Turn the textarea (one inclusion per line) into a clean array and back.
const linesToItems = (text) =>
  text.split('\n').map((l) => l.trim()).filter(Boolean);
const itemsToLines = (items) => (items || []).join('\n');

const unitLabel = (u) => (u === 'day' ? '/day' : ' total');

// Owner-defined bundles for a business. Each package is a name + price plus a
// free-form list of inclusions the owner types in manually.
export default function BusinessPackages({ businessId, isActive, isMarketplace }) {
  const [packages, setPackages] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () =>
    api.packages.listByBusiness(businessId).then(setPackages).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const togglePublish = async (p) => {
    try {
      await api.packages.update(p.id, { isPublished: !p.isPublished });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete package "${p.name}"?`)) return;
    try {
      await api.packages.remove(p.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="mt-8">
      <ErrorNote>{error}</ErrorNote>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Packages <span className="text-slate-400">({packages?.length ?? 0})</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Bundle your offerings — add whatever inclusions you like.
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            disabled={!isActive}
            title={!isActive ? 'Subscribe to a plan to create packages' : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon /> Create Package
          </button>
        </div>

        <div className="overflow-x-auto">
          {packages?.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-400">
              No packages yet. Click <strong>Create Package</strong> to bundle your offerings.
            </p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  <Th>Package</Th>
                  <Th>Price</Th>
                  <Th>Inclusions</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages?.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => isActive && setEditing(p)}
                    className={`transition-colors hover:bg-slate-50/70 ${isActive ? 'cursor-pointer' : ''}`}
                    title={isActive ? 'Click to edit' : undefined}
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{p.name}</p>
                      {p.description && <p className="truncate text-xs text-slate-400">{p.description}</p>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-brand">
                      {formatPrice(p.price, p.currency)}
                      <span className="text-xs font-normal text-slate-400">{unitLabel(p.priceUnit)}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {p.items?.length ? (
                        <span className="text-xs">
                          {p.items.slice(0, 2).join(', ')}
                          {p.items.length > 2 ? ` +${p.items.length - 2} more` : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={p.availability === 'available' ? 'green' : 'slate'}>{p.availability}</Badge>
                        {isMarketplace && (
                          <Badge tone={p.isPublished ? 'green' : 'slate'}>{p.isPublished ? 'Published' : 'Draft'}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <RowBtn onClick={() => setEditing(p)} disabled={!isActive} title={!isActive ? 'Subscribe to edit' : undefined}>Edit</RowBtn>
                        {isMarketplace && (
                          <RowBtn onClick={() => togglePublish(p)} disabled={!isActive} tone={p.isPublished ? 'default' : 'accent'} title={!isActive ? 'Subscribe to publish' : undefined}>
                            {p.isPublished ? 'Unpublish' : 'Publish'}
                          </RowBtn>
                        )}
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

      {creating && (
        <PackageModal
          title="Create package"
          submitLabel="Create package"
          onClose={() => setCreating(false)}
          onSubmit={(payload) => api.packages.create({ businessId, ...payload })}
          onSaved={async () => { setCreating(false); await load(); }}
        />
      )}

      {editing && (
        <PackageModal
          title="Edit package"
          submitLabel="Save changes"
          pkg={editing}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => api.packages.update(editing.id, payload)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}

// Shared create/edit form. `pkg` prefills the fields when editing.
function PackageModal({ title, submitLabel, pkg, onClose, onSubmit, onSaved }) {
  const [form, setForm] = useState(
    pkg
      ? {
          name: pkg.name,
          description: pkg.description || '',
          price: String(pkg.price),
          currency: pkg.currency || DEFAULT_CURRENCY,
          priceUnit: pkg.priceUnit || 'package',
          availability: pkg.availability,
          itemsText: itemsToLines(pkg.items),
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price) || 0,
        currency: form.currency,
        priceUnit: form.priceUnit,
        availability: form.availability,
        items: linesToItems(form.itemsText),
      });
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <ErrorNote>{error}</ErrorNote>
        <Field label="Package name">
          <input name="name" value={form.name} onChange={onChange} required placeholder="Wedding Package" className={inputCls} />
        </Field>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Price</span>
          <div className="flex gap-2">
            <select name="currency" value={form.currency} onChange={onChange} className={selectCls}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={onChange} required placeholder="5000" className={inputCls} />
            <select name="priceUnit" value={form.priceUnit} onChange={onChange} className={selectCls}>
              <option value="package">total</option>
              <option value="day">/day</option>
            </select>
          </div>
        </label>
        <Field label="Description">
          <textarea name="description" value={form.description} onChange={onChange} rows={2} placeholder="Optional" className={inputCls} />
        </Field>
        <Field label="What's included (one per line)">
          <textarea name="itemsText" value={form.itemsText} onChange={onChange} rows={4}
            placeholder={'Sound system\n2 wireless mics\nSetup & teardown'} className={inputCls} />
        </Field>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Availability</span>
          <select name="availability" value={form.availability} onChange={onChange} className={`${selectCls} w-full`}>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
            {saving ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
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
  accent: 'bg-accent text-white hover:bg-accent-dark',
  danger: 'border border-red-200 text-red-600 hover:bg-red-50',
};

function RowBtn({ children, tone = 'default', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-md px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${ROW_BTN_TONES[tone]}`}
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

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20';
const selectCls =
  'rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
