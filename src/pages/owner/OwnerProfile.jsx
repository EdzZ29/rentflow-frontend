import { useState } from 'react';
import ImagePicker from '../../components/ImagePicker';
import { Card, ErrorNote, PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function OwnerProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk('');
    setSaving(true);
    try {
      // Upload the new picture first (if any), then save the text fields. Both
      // return the fresh profile; keep whichever ran last as the source of truth.
      let updated;
      if (file) updated = await api.uploadAvatar(file);

      const patch = {};
      if (form.fullName.trim() && form.fullName.trim() !== user?.fullName) patch.fullName = form.fullName.trim();
      if (form.email.trim() && form.email.trim() !== user?.email) patch.email = form.email.trim();
      if (form.password) patch.password = form.password;

      if (Object.keys(patch).length > 0) updated = await api.updateProfile(patch);

      if (updated) setUser(updated);
      setForm((f) => ({ ...f, password: '' }));
      setFile(null);
      setOk('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Update your account details and profile picture." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Profile details" className="lg:col-span-2">
          <ErrorNote>{error}</ErrorNote>
          {ok && (
            <div className="mb-3 rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent-dark">{ok}</div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <ImagePicker
              label="Profile picture"
              currentUrl={user?.avatarUrl}
              onFile={setFile}
              aspect="h-24 w-24 rounded-full"
            />

            <Field label="Full name">
              <input name="fullName" value={form.fullName} onChange={onChange} required placeholder="Jane Dela Cruz" className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="jane@example.com" className={inputCls} />
            </Field>
            <Field label="New password">
              <input type="password" name="password" value={form.password} onChange={onChange} placeholder="Leave blank to keep current password" className={inputCls} />
            </Field>

            <button type="submit" disabled={saving}
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </Card>

        <Card title="Account">
          <dl className="space-y-3 text-sm">
            <Row label="Role" value={<span className="capitalize">{user?.role}</span>} />
            <Row label="Plan" value={<span className="capitalize">{user?.plan || 'none'}</span>} />
          </dl>
          <p className="mt-4 text-xs text-slate-400">
            Your role and plan can’t be changed here. Manage your plan on the Subscription page.
          </p>
        </Card>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20';

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
