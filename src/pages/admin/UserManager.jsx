import { useCallback, useEffect, useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import Modal from '../../components/Modal';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import {
  PLAN_OPTIONS,
  effectivePlan,
  isDowngrade,
  planEndsOn,
  remainingLabel,
  remainingTone,
} from '../../lib/plans';

function planTone(p) {
  return p === 'yearly' ? 'green' : p === 'monthly' ? 'blue' : p === 'trial' ? 'amber' : 'slate';
}

export default function UserManager({ role, title, subtitle, showPlan }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null); // awaiting confirmation
  const [editing, setEditing] = useState(null); // account being edited

  const load = useCallback(() => {
    setError('');
    return api.users
      .list()
      .then((all) => setUsers(all.filter((u) => u.role === role)))
      .catch((e) => setError(e.message));
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  // Confirmed through a modal — errors surface inside it.
  const removeConfirmed = async () => {
    await api.users.remove(pendingDelete.id);
    await load();
  };

  if (!users && !error) return <Loading />;

  const cols = showPlan ? 6 : 4;

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <ErrorNote>{error}</ErrorNote>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              {showPlan && <th className="px-4 py-3">Plan</th>}
              {showPlan && <th className="px-4 py-3">Remaining</th>}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users?.length === 0 && (
              <tr>
                <td colSpan={cols} className="px-4 py-10 text-center text-slate-400">
                  No {title.toLowerCase()} yet.
                </td>
              </tr>
            )}
            {users?.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{u.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                {showPlan && (
                  <td className="px-4 py-3">
                    <Badge tone={planTone(u.plan)}>{u.plan}</Badge>
                    {/* Flag a stored plan that has already lapsed. */}
                    {u.plan !== 'none' && effectivePlan(u) === 'none' && (
                      <span className="mt-0.5 block text-xs text-red-600">lapsed</span>
                    )}
                  </td>
                )}
                {showPlan && (
                  <td className="px-4 py-3">
                    <Badge tone={remainingTone(u)}>{remainingLabel(u)}</Badge>
                    {planEndsOn(u) && (
                      <span className="mt-0.5 block text-xs text-slate-400">
                        until {planEndsOn(u)}
                      </span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <Badge tone={u.isActive ? 'green' : 'red'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(u)} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      Edit
                    </button>
                    <button onClick={() => setPendingDelete(u)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditUserModal
          user={editing}
          showPlan={showPlan}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete account"
          message={`Delete ${pendingDelete.email}?`}
          detail="This cannot be undone. Everything belonging to this account is removed with it."
          confirmLabel="Delete account"
          onConfirm={removeConfirmed}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20';

const ROLES = [
  { value: 'customer', label: 'Customer' },
  { value: 'owner', label: 'Business owner' },
  { value: 'admin', label: 'Admin' },
];

// Admin editor for one account. Nothing is sent until the change summary is
// confirmed, so a mis-typed email or an accidental role change can be caught.
function EditUserModal({ user, showPlan, onClose, onSaved }) {
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    role: user.role || 'customer',
    isActive: !!user.isActive,
    plan: user.plan || 'none',
    password: '',
  });
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  // Deactivating blocks sign-in, so it's confirmed the moment it's picked.
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Only changed fields are sent, so an untouched field can't be overwritten.
  const changes = [];
  const patch = {};
  if (form.fullName.trim() && form.fullName.trim() !== user.fullName) {
    patch.fullName = form.fullName.trim();
    changes.push(['Name', `${user.fullName} → ${patch.fullName}`]);
  }
  if (form.email.trim() && form.email.trim() !== user.email) {
    patch.email = form.email.trim();
    changes.push(['Email', `${user.email} → ${patch.email}`]);
  }
  if (form.role !== user.role) {
    patch.role = form.role;
    changes.push(['Role', `${user.role} → ${form.role}`]);
  }
  if (form.isActive !== !!user.isActive) {
    patch.isActive = form.isActive;
    changes.push(['Status', form.isActive ? 'Activated' : 'Deactivated']);
  }
  if (form.password) {
    patch.password = form.password;
    changes.push(['Password', 'Reset to a new password']);
  }
  // The plan goes through its own endpoint, so it's tracked separately from
  // the profile patch but still listed in the same confirmation.
  const planChanged = showPlan && form.plan !== (user.plan || 'none');
  if (planChanged) {
    changes.push([
      'Plan',
      `${user.plan || 'none'} → ${form.plan}${isDowngrade(user.plan, form.plan) ? ' (downgrade)' : ''}`,
    ]);
  }

  const review = (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim()) return setError('Full name is required.');
    if (!form.email.trim()) return setError('Email is required.');
    if (form.password && form.password.length < 8) {
      return setError('A new password must be at least 8 characters.');
    }
    if (changes.length === 0) return setError('Nothing has changed yet.');
    setConfirming(true);
  };

  const apply = async () => {
    if (Object.keys(patch).length > 0) await api.users.update(user.id, patch);
    if (planChanged) await api.users.setPlan(user.id, form.plan);
    await onSaved();
  };

  return (
    <Modal title={`Edit ${user.role === 'owner' ? 'owner' : 'account'}`} onClose={onClose}>
      <form onSubmit={review} className="space-y-4">
        <ErrorNote>{error}</ErrorNote>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Full name</span>
          <input value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} className={inputCls} />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={inputCls} />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Role</span>
          <select value={form.role} onChange={(e) => set({ role: e.target.value })} className={inputCls}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-slate-400">
            Changing the role changes which dashboard this person lands on.
          </span>
        </label>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Account status</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => set({ isActive: true })}
              className={`rounded-lg border px-3 py-2 text-left ${form.isActive ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <span className={`block text-sm font-semibold ${form.isActive ? 'text-accent-dark' : 'text-slate-900'}`}>Active</span>
              <span className="block text-xs text-slate-500">Can sign in</span>
            </button>
            {/* Inactive is styled red and asks for confirmation before it sticks. */}
            <button
              type="button"
              onClick={() => (form.isActive ? setConfirmDeactivate(true) : null)}
              className={`rounded-lg border px-3 py-2 text-left ${!form.isActive ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-red-300'}`}
            >
              <span className={`block text-sm font-semibold ${!form.isActive ? 'text-red-700' : 'text-slate-900'}`}>Inactive</span>
              <span className={`block text-xs ${!form.isActive ? 'text-red-600' : 'text-slate-500'}`}>Sign-in blocked</span>
            </button>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Reset password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => set({ password: e.target.value })}
            placeholder="Leave blank to keep the current password"
            autoComplete="new-password"
            className={inputCls}
          />
          <span className="mt-1 block text-xs text-slate-400">At least 8 characters.</span>
        </label>

        {showPlan && (
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Subscription plan</span>
              <span className="flex items-center gap-2">
                <Badge tone={planTone(user.plan)}>{user.plan || 'none'}</Badge>
                <Badge tone={remainingTone(user)}>{remainingLabel(user)}</Badge>
              </span>
            </div>
            {planEndsOn(user) && (
              <p className="mt-1 text-xs text-slate-500">
                Current term ends {planEndsOn(user)}.
              </p>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2">
              {PLAN_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set({ plan: p.value })}
                  className={`rounded-lg border px-3 py-2 text-left ${form.plan === p.value ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className={`block text-sm font-semibold ${form.plan === p.value ? 'text-accent-dark' : 'text-slate-900'}`}>
                    {p.label}
                  </span>
                  <span className="block text-xs text-slate-500">{p.hint}</span>
                </button>
              ))}
            </div>

            {form.plan !== user.plan && (
              <p className={`mt-2 text-xs font-medium ${isDowngrade(user.plan, form.plan) ? 'text-red-600' : 'text-accent-dark'}`}>
                {isDowngrade(user.plan, form.plan)
                  ? `Downgrade to ${form.plan} — paid features are reduced immediately.`
                  : `Upgrade to ${form.plan} — the term restarts from today.`}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
            Review changes
          </button>
        </div>
      </form>

      {confirmDeactivate && (
        <ConfirmModal
          title="Deactivate this account?"
          message={`${user.email} will no longer be able to sign in.`}
          detail="Their data is kept — you can reactivate them at any time. Nothing is saved until you apply the changes."
          confirmLabel="Set inactive"
          onConfirm={() => set({ isActive: false })}
          onClose={() => setConfirmDeactivate(false)}
        />
      )}

      {confirming && (
        <ConfirmModal
          title="Apply these changes?"
          message={`${changes.length} change${changes.length === 1 ? '' : 's'} to ${user.email}:`}
          detail={changes.map(([label, value]) => `• ${label}: ${value}`).join('\n')}
          confirmLabel="Apply changes"
          tone="accent"
          onConfirm={apply}
          onClose={() => setConfirming(false)}
        />
      )}
    </Modal>
  );
}
