'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { aiApi, AIUsage } from '../../../lib/api';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

export default function AIUsagePage() {
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    aiApi.getUsage().then((res) => {
      setLoading(false);
      if (res.success) setUsage(res.data);
      else setError(true);
    });
  }, []);

  if (loading) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Ziada AI', href: '/ai' }, { label: 'Usage' }]}>
        <div style={{ padding: 80, textAlign: 'center' }}>{SPINNER}</div>
      </AppShell>
    );
  }

  if (error || !usage) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Ziada AI', href: '/ai' }, { label: 'Usage' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Couldn't load usage</div>
          <Link href="/ai" className="btn btn-primary">← Back to Ziada AI</Link>
        </div>
      </AppShell>
    );
  }

  const c = usage.ai_credits;

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Ziada AI', href: '/ai' }, { label: 'Usage' }]}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>AI usage</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>How your store is actually using Ziada AI — real records, not estimates.</p>
        </div>
        {!usage.ngamia_configured && (
          <a href="https://ngamia.cc" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
            Get more credits →
          </a>
        )}
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 20 }}>
        <div className="surface" style={{ padding: 16 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>CREDITS REMAINING</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4 }}>{c.remaining.toLocaleString()}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>of {c.allocated.toLocaleString()} this month</div>
        </div>
        <div className="surface" style={{ padding: 16 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>MESSAGES · THIS MONTH</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4 }}>{usage.this_month.messages.toLocaleString()}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{usage.totals.messages.toLocaleString()} all time</div>
        </div>
        <div className="surface" style={{ padding: 16 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>TOKENS · THIS MONTH</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4 }}>{(usage.this_month.prompt_tokens + usage.this_month.completion_tokens).toLocaleString()}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>prompt + completion</div>
        </div>
        <div className="surface" style={{ padding: 16 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>YOUR OWN KEY</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginTop: 6 }}>
            {usage.ngamia_configured
              ? <span style={{ color: 'var(--good)' }}>Connected</span>
              : <span style={{ color: 'var(--fg-3)' }}>Not set</span>}
          </div>
          <Link href="/settings" className="mono" style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2, display: 'inline-block' }}>
            {usage.ngamia_configured ? 'Manage in Settings →' : 'Add in Settings →'}
          </Link>
        </div>
      </div>

      {/* Credit bar */}
      <div className="surface" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Monthly free credits</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{c.used.toLocaleString()} / {c.allocated.toLocaleString()} used</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-4)', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(c.pct_used, 100)}%`, height: '100%', borderRadius: 999,
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
          }} />
        </div>
      </div>

      {/* Recent usage table */}
      <div className="surface">
        <div className="card-head">
          <span className="card-title">Recent AI replies</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>Last {usage.recent.length}</span>
        </div>
        {usage.recent.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
            No AI usage yet. <Link href="/ai" style={{ color: 'var(--accent)' }}>Ask Ziada AI something →</Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead><tr>
                <th>CONVERSATION</th>
                <th style={{ width: 200 }}>MODEL</th>
                <th style={{ width: 110, textAlign: 'right' }} className="num">PROMPT</th>
                <th style={{ width: 110, textAlign: 'right' }} className="num">COMPLETION</th>
                <th style={{ width: 140 }}>DATE</th>
              </tr></thead>
              <tbody>
                {usage.recent.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{r.conversation_title}</td>
                    <td className="mono" style={{ color: 'var(--fg-3)', fontSize: 12 }}>{r.model_used || '—'}</td>
                    <td className="num mono">{r.prompt_tokens.toLocaleString()}</td>
                    <td className="num mono">{r.completion_tokens.toLocaleString()}</td>
                    <td className="mono" style={{ color: 'var(--fg-3)', fontSize: 12 }}>
                      {new Date(r.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
