import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { api } from '../../lib/api';

const CATEGORIES = [
  { key: 'inquiry', label: 'General inquiry' },
  { key: 'report', label: 'Report a problem' },
  { key: 'request', label: 'Feature / request' },
  { key: 'billing', label: 'Billing' },
  { key: 'other', label: 'Other' },
];
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));
const STATUS_TONE = { open: 'amber', pending: 'blue', resolved: 'green', closed: 'slate' };
const STATUS_OPTIONS = ['open', 'pending', 'resolved', 'closed'];

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function SupportView({ admin = false }) {
  const { user } = useAuth();
  const { subscribe } = useRealtime();
  const [params, setParams] = useSearchParams();
  const newCategory = !admin && params.get('new');
  const [tickets, setTickets] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [active, setActive] = useState(null);
  const [composing, setComposing] = useState(!!newCategory);
  const [error, setError] = useState('');

  const loadList = () => api.support.list().then(setTickets).catch((e) => setError(e.message));
  const loadActive = (id) =>
    api.support.get(id).then(setActive).catch((e) => setError(e.message));

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (activeId) loadActive(activeId);
    else setActive(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Real-time: new tickets, replies, and status changes refresh the view.
  useEffect(
    () =>
      subscribe('support', () => {
        loadList();
        if (activeId) loadActive(activeId);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subscribe, activeId],
  );

  const clearNew = () => {
    if (params.has('new')) {
      const n = new URLSearchParams(params);
      n.delete('new');
      setParams(n, { replace: true });
    }
  };

  const openTicket = (id) => { setComposing(false); clearNew(); setActiveId(id); };
  const startNew = () => { clearNew(); setActiveId(null); setActive(null); setComposing(true); };

  const onCreated = async (ticket) => {
    setComposing(false);
    clearNew();
    await loadList();
    setActiveId(ticket.id);
    setActive(ticket);
  };

  if (!tickets && !error) return <Loading />;

  return (
    <div>
      <PageHeader
        title={admin ? 'Support Inbox' : 'Support'}
        subtitle={admin ? 'Respond to customer and owner tickets.' : 'Questions, reports, or requests — chat with our team.'}
        action={
          !admin ? (
            <button onClick={startNew} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
              New ticket
            </button>
          ) : undefined
        }
      />
      <ErrorNote>{error}</ErrorNote>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Ticket list */}
        <aside className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
            Tickets <span className="text-slate-400">({tickets?.length ?? 0})</span>
          </div>
          {tickets?.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-400">
              {admin ? 'No tickets yet.' : 'No tickets yet. Start a conversation.'}
            </p>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
              {tickets?.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => openTicket(t.id)}
                    className={`w-full px-4 py-3 text-left transition-colors ${activeId === t.id ? 'bg-accent/5' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{t.subject}</p>
                      <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {admin && t.user ? `${t.user.name} · ${t.user.role} · ` : ''}
                      {CATEGORY_LABEL[t.category] || t.category} · {timeAgo(t.lastMessageAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Right panel */}
        <section className="min-h-[70vh] rounded-2xl border border-slate-200 bg-white">
          {composing ? (
            <NewTicketForm
              initialCategory={newCategory || 'inquiry'}
              onCreated={onCreated}
              onCancel={() => { setComposing(false); clearNew(); }}
            />
          ) : active ? (
            <ChatPanel
              key={active.id}
              ticket={active}
              admin={admin}
              currentUserId={user?.id}
              onChanged={() => { loadActive(active.id); loadList(); }}
            />
          ) : (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center text-slate-400">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">{admin ? 'Select a ticket to view the conversation.' : 'Select a ticket or start a new one.'}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function NewTicketForm({ onCreated, onCancel, initialCategory = 'inquiry' }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(
    CATEGORIES.some((c) => c.key === initialCategory) ? initialCategory : 'inquiry',
  );
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (subject.trim().length < 3) return setError('Please enter a short subject.');
    if (!message.trim()) return setError('Please describe how we can help.');
    setSaving(true);
    try {
      const ticket = await api.support.create({ subject: subject.trim(), category, message: message.trim() });
      await onCreated(ticket);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col p-6">
      <h2 className="text-lg font-bold text-slate-900">New support ticket</h2>
      <p className="mt-1 text-sm text-slate-500">Tell us what you need and our team will reply here.</p>

      <label className="mt-5 block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Problem with a booking"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
      </label>
      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20">
          {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </label>
      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-medium text-slate-700">How can we help?</span>
        <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your inquiry, request, or the issue you're seeing…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
          {saving ? 'Submitting…' : 'Submit ticket'}
        </button>
      </div>
    </form>
  );
}

function ChatPanel({ ticket, admin, currentUserId, onChanged }) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const closed = ticket.status === 'closed';

  // Keep the latest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [ticket.messages?.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError('');
    try {
      await api.support.sendMessage(ticket.id, body.trim());
      setBody('');
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status) => {
    try {
      await api.support.updateStatus(ticket.id, status);
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-semibold text-slate-900">{ticket.subject}</h2>
            <Badge tone={STATUS_TONE[ticket.status]}>{ticket.status}</Badge>
          </div>
          <p className="text-xs text-slate-400">
            {CATEGORY_LABEL[ticket.category] || ticket.category}
            {admin && ticket.user ? ` · ${ticket.user.name} (${ticket.user.email})` : ''}
          </p>
        </div>
        {admin ? (
          <select
            value={ticket.status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-accent"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        ) : (
          !closed && (
            <button onClick={() => setStatus('closed')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              Close ticket
            </button>
          )
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 px-5 py-4">
        {ticket.messages.map((m) => {
          // "mine" = messages on the current viewer's side of the conversation.
          const mine = admin ? m.fromAdmin : !m.fromAdmin;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'bg-accent text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                <p className={`mb-0.5 text-[11px] font-medium ${mine ? 'text-white/80' : 'text-slate-400'}`}>
                  {m.fromAdmin ? (admin && m.senderName ? m.senderName : 'Support') : m.senderName} · {timeAgo(m.createdAt)}
                </p>
                <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      {error && <p className="px-5 pt-2 text-sm text-red-600">{error}</p>}
      {closed ? (
        <p className="border-t border-slate-100 px-5 py-4 text-center text-sm text-slate-400">
          This ticket is closed.{!admin && ' Start a new ticket if you need more help.'}
        </p>
      ) : (
        <form onSubmit={send} className="flex items-end gap-2 border-t border-slate-100 p-3">
          <textarea
            rows={1}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); } }}
            placeholder="Type a message…"
            className="max-h-32 flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button type="submit" disabled={sending || !body.trim()} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50">
            Send
          </button>
        </form>
      )}
    </div>
  );
}
