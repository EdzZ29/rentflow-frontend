import { useState } from 'react';
import ImagePicker from '../components/ImagePicker';
import { Card, ErrorNote, PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import { LANGUAGES } from '../lib/languages';

// Account settings shared by every dashboard role (customer / owner / admin).
export default function Settings() {
  const { user, setUser } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [file, setFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileOk, setProfileOk] = useState('');

  const [pw, setPw] = useState({ password: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwOk, setPwOk] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onPwChange = (e) => setPw((p) => ({ ...p, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileOk('');
    setSavingProfile(true);
    try {
      // Picture first (if changed), then the text fields — both return the
      // fresh profile, so the later response wins.
      let updated;
      if (file) updated = await api.uploadAvatar(file);

      const patch = {};
      if (form.fullName.trim() && form.fullName.trim() !== user?.fullName) {
        patch.fullName = form.fullName.trim();
      }
      if (form.email.trim() && form.email.trim() !== user?.email) {
        patch.email = form.email.trim();
      }
      if (Object.keys(patch).length > 0) updated = await api.updateProfile(patch);

      if (updated) setUser(updated);
      setFile(null);
      setProfileOk('Settings saved.');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwOk('');
    if (pw.password !== pw.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      setUser(await api.updateProfile({ password: pw.password }));
      setPw({ password: '', confirm: '' });
      setPwOk('Password updated.');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account details and preferences." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Account" className="lg:col-span-2">
          <ErrorNote>{profileError}</ErrorNote>
          {profileOk && <Note>{profileOk}</Note>}

          <form onSubmit={saveProfile} className="space-y-4">
            <ImagePicker
              label="Profile picture"
              currentUrl={user?.avatarUrl}
              onFile={setFile}
              aspect="h-24 w-24 rounded-full"
            />

            <Field label="Full name">
              <input
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                required
                placeholder="Jane Dela Cruz"
                className={inputCls}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="jane@example.com"
                className={inputCls}
              />
            </Field>

            <button type="submit" disabled={savingProfile} className={buttonCls}>
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card title="Preferences">
            <Field label="Language">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={inputCls}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-2 text-xs text-slate-400">
              Applies across the app on this device.
            </p>
          </Card>

          <Card title="Account info">
            <dl className="space-y-3 text-sm">
              <Row label="Role" value={<span className="capitalize">{user?.role}</span>} />
              <Row label="Plan" value={<span className="capitalize">{user?.plan || 'none'}</span>} />
            </dl>
            <p className="mt-4 text-xs text-slate-400">
              Your role and plan can’t be changed here.
            </p>
          </Card>
        </div>

        <Card title="Password" className="lg:col-span-2">
          <ErrorNote>{pwError}</ErrorNote>
          {pwOk && <Note>{pwOk}</Note>}

          <form onSubmit={savePassword} className="space-y-4">
            <Field label="New password">
              <input
                type="password"
                name="password"
                value={pw.password}
                onChange={onPwChange}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={inputCls}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                name="confirm"
                value={pw.confirm}
                onChange={onPwChange}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Re-enter the new password"
                className={inputCls}
              />
            </Field>

            <button type="submit" disabled={savingPw} className={buttonCls}>
              {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20';

const buttonCls =
  'rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60';

function Note({ children }) {
  return (
    <div className="mb-3 rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent-dark">
      {children}
    </div>
  );
}

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
