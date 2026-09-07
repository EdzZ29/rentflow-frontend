import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { api } from '../lib/api';
import { LEGAL_LINKS } from '../lib/legal';

/**
 * Renders one legal document, fetched from the API.
 *
 * The text lives on the server rather than in this bundle so the website and
 * the mobile app can't drift apart on what the policies actually say.
 */
export default function LegalPage() {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.legal
      .get(slug)
      .then((d) => {
        if (!cancelled) {
          setDoc(d);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load this document.');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Derived rather than reset inside the effect: while the slug and the loaded
  // document disagree we're still fetching, so the skeleton shows.
  const current = doc?.slug === slug ? doc : null;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm text-slate-500">
            <Link to="/" className="hover:text-accent">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">{current?.title || 'Legal'}</span>
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {current?.title || 'Legal'}
          </h1>
          {current && (
            <>
              <p className="mt-2 max-w-2xl text-slate-600">{current.summary}</p>
              <p className="mt-4 text-xs text-slate-500">
                Version {current.version} · Effective {current.effectiveDate}
              </p>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Sidebar: the other documents */}
          <aside>
            <p className="mb-3 text-sm font-semibold text-slate-900">Legal</p>
            <ul className="space-y-1">
              {LEGAL_LINKS.map((l) => (
                <li key={l.slug}>
                  <Link
                    to={`/legal/${l.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      l.slug === slug
                        ? 'bg-accent/10 font-semibold text-accent-dark'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <article className="max-w-3xl">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!current && !error && (
              <div className="space-y-6" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="space-y-2.5">
                    <div className="h-5 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-11/12 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            )}

            {current?.sections.map((section) => (
              <section key={section.heading} className="mb-9">
                <h2 className="text-lg font-bold text-slate-900">{section.heading}</h2>
                {section.body.map((paragraph, i) => (
                  <p key={i} className="mt-3 text-sm leading-6 text-slate-600">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-6 text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
