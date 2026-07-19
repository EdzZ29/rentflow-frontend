import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImagePicker from '../../components/ImagePicker';
import Modal from '../../components/Modal';
import { Badge, Card, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { api, assetUrl } from '../../lib/api';

const CATEGORIES = [
  'Vehicles',
  'Events & Party',
  'Audio & Video',
  'Photography',
  'Tools & Equipment',
  'Sports & Outdoor',
  'Property & Spaces',
  'Other',
];

const empty = { name: '', category: CATEGORIES[0], location: '', description: '' };

export default function OwnerBusinesses() {
  const [businesses, setBusinesses] = useState(null);
  const [sub, setSub] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () =>
    Promise.all([api.businesses.list(), api.subscription.get()])
      .then(([b, s]) => {
        setBusinesses(b);
        setSub(s);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await api.businesses.create(form);
      if (file) await api.businesses.uploadImage(created.id, file);
      setForm(empty);
      setFile(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (b) => {
    try {
      await api.businesses.update(b.id, {
        status: b.status === 'active' ? 'paused' : 'active',
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete "${b.name}"?`)) return;
    try {
      await api.businesses.remove(b.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!businesses || !sub) return <Loading />;

  const atLimit = businesses.length >= sub.businessLimit;

  return (
    <div>
      <PageHeader
        title="My Businesses"
        subtitle={`${businesses.length} of ${sub.businessLimit} used on your ${sub.effectivePlan} plan.`}
      />

      <ErrorNote>{error}</ErrorNote>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {/* Add form */}
        <Card title="Add a business" className="lg:col-span-1">
          {atLimit ? (
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              You've reached your plan limit.{' '}
              <Link to="/owner/subscription" className="font-semibold underline">
                Upgrade your plan
              </Link>{' '}
              to add more.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <Input label="Business name" name="name" value={form.name} onChange={onChange} required />
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <Input label="Location" name="location" value={form.location} onChange={onChange} placeholder="Optional" />
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={3}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
              <ImagePicker label="Business photo" onFile={setFile} />
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
              >
                {saving ? 'Adding…' : 'Add business'}
              </button>
            </form>
          )}
        </Card>

        {/* List */}
        <div className="space-y-4 lg:col-span-2">
          {businesses.length === 0 && (
            <Card>
              <p className="text-sm text-slate-500">No businesses yet. Add your first one to start listing rentals.</p>
            </Card>
          )}
          {businesses.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {b.imageUrl ? (
                      <img src={assetUrl(b.imageUrl)} alt={b.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-300">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{b.name}</h3>
                      <Badge tone={b.status === 'active' ? 'green' : 'amber'}>{b.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {b.category}
                      {b.location ? ` · ${b.location}` : ''}
                    </p>
                    {b.description && <p className="mt-2 text-sm text-slate-600">{b.description}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link
                    to={`/owner/businesses/${b.id}/products`}
                    className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-accent-dark"
                  >
                    Manage products
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(b)} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                    <button onClick={() => toggleStatus(b)} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      {b.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button onClick={() => remove(b)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <EditBusinessModal
          business={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}

function EditBusinessModal({ business, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: business.name,
    category: business.category,
    location: business.location || '',
    phone: business.phone || '',
    description: business.description || '',
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
      await api.businesses.update(business.id, {
        name: form.name.trim(),
        category: form.category,
        location: form.location.trim() || undefined,
        phone: form.phone.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      if (file) await api.businesses.uploadImage(business.id, file);
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit business" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <ErrorNote>{error}</ErrorNote>
        <Input label="Business name" name="name" value={form.name} onChange={onChange} required />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
          <select name="category" value={form.category} onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <Input label="Contact number" name="phone" value={form.phone} onChange={onChange} />
        <Input label="Location" name="location" value={form.location} onChange={onChange} />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
          <textarea name="description" value={form.description} onChange={onChange} rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
        </label>
        <ImagePicker label="Business photo" currentUrl={business.imageUrl} onFile={setFile} />
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
      <input
        {...props}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}
