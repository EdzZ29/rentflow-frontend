import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { api } from '../lib/api';

// Ticket shortcuts → real support categories (see SupportView).
const TICKET_ACTIONS = [
  { label: 'Contact support', category: 'inquiry', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Report a bug', category: 'report', icon: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' },
  { label: 'Talk to sales', category: 'other', icon: 'M3 3v18h18M9 17V9m4 8V5m4 12v-6' },
  { label: 'Request a feature', category: 'request', icon: 'M9 21h6M12 3a6 6 0 00-4 10.5c.5.5 1 1.5 1 2.5h6c0-1 .5-2 1-2.5A6 6 0 0012 3z' },
  { label: 'Ask a billing question', category: 'billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

// Floating help launcher + panel for customers (Intercom-style). The AI
// "Ask a question" entry is a static placeholder for now; the ticket
// shortcuts and Messages tab hook into the real support system.
export default function SupportWidget() {
  const { user } = useAuth();
  const { subscribe } = useRealtime();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('home'); // home | ai
  const [activeCount, setActiveCount] = useState(0);

  const firstName = (user?.fullName || '').trim().split(' ')[0] || 'there';

  const refreshCount = () =>
    api.support
      .list()
      .then((t) => setActiveCount(t.filter((x) => x.status !== 'closed').length))
      .catch(() => {});

  useEffect(() => {
    refreshCount();
  }, []);
  useEffect(() => subscribe('support', refreshCount), [subscribe]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Help & support"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {!open && activeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex max-h-[75vh] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand to-accent px-5 pb-6 pt-5 text-white">
            <div className="flex items-center justify-between">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-7 9 7" />
              </svg>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 hover:bg-white/10">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-4 text-xl font-semibold text-white/70">Hi {firstName},</p>
            <p className="text-2xl font-bold">How can we help?</p>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {tab === 'ai' ? (
              <AiPlaceholder onContact={() => go('/customer/support?new=inquiry')} onBack={() => setTab('home')} />
            ) : (
              <>
                {/* Ask a question (static AI) */}
                <button
                  onClick={() => setTab('ai')}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-accent"
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Ask a question</span>
                    <span className="block text-xs text-slate-500">AI Agent and team can help</span>
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h15" />
                    </svg>
                  </span>
                </button>

                {/* Create a ticket */}
                <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                  <p className="px-3 pb-1 pt-2 text-sm font-semibold text-slate-900">Create a ticket</p>
                  {TICKET_ACTIONS.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => go(`/customer/support?new=${a.category}`)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {a.label}
                      <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                      </svg>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 border-t border-slate-100 text-xs">
            <TabButton active={tab === 'home'} onClick={() => setTab('home')} label="Home"
              icon="M3 12l9-7 9 7M5 10v10h14V10" />
            <TabButton active={false} onClick={() => go('/customer/support')} label="Messages" badge={activeCount}
              icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            <TabButton active={false} onClick={() => go('/customer/support')} label="Help"
              icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </div>
        </div>
      )}
    </>
  );
}

function AiPlaceholder({ onContact, onBack }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-white">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <p className="mt-3 font-semibold text-slate-900">AI assistant is coming soon</p>
      <p className="mt-1 text-sm text-slate-500">
        Our smart assistant will answer instantly here. For now, our team is happy to help.
      </p>
      <button onClick={onContact} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
        Contact support
      </button>
      <button onClick={onBack} className="mt-2 text-xs font-medium text-slate-400 hover:text-slate-600">
        ← Back
      </button>
    </div>
  );
}

function TabButton({ active, onClick, label, icon, badge = 0 }) {
  return (
    <button onClick={onClick} className={`relative flex flex-col items-center gap-1 py-2.5 ${active ? 'text-brand' : 'text-slate-400 hover:text-slate-600'}`}>
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {label}
      {badge > 0 && label === 'Messages' && (
        <span className="absolute right-6 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
