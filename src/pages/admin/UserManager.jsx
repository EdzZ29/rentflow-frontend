import { useCallback, useEffect, useState } from 'react';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';

function planTone(p) {
  return p === 'yearly' ? 'green' : p === 'monthly' ? 'blue' : p === 'trial' ? 'amber' : 'slate';
}

export default function UserManager({ role, title, subtitle, showPlan }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

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

  const act = async (fn) => {
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const rename = (u) => {
    const name = window.prompt('Full name', u.fullName);
    if (name && name.trim() && name !== u.fullName) {
      act(() => api.users.update(u.id, { fullName: name.trim() }));
    }
  };
  const toggleActive = (u) => act(() => api.users.update(u.id, { isActive: !u.isActive }));
  const remove = (u) => {
    if (window.confirm(`Delete ${u.email}? This cannot be undone.`)) {
      act(() => api.users.remove(u.id));
    }
  };

  if (!users && !error) return <Loading />;

  const cols = showPlan ? 5 : 4;

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
                  </td>
                )}
                <td className="px-4 py-3">
                  <Badge tone={u.isActive ? 'green' : 'slate'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => rename(u)} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      Edit
                    </button>
                    <button onClick={() => toggleActive(u)} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => remove(u)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
