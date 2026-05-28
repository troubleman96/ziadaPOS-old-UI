'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';

// ── Quick actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    id: 'whatsapp',
    icon: '💬',
    label: 'Chat with us',
    sub: 'Reply in minutes',
    note: 'WhatsApp · available 7AM–9PM',
    color: '#25d366',
    href: 'https://wa.me/255800123456',
  },
  {
    id: 'email',
    icon: '✉️',
    label: 'Email support',
    sub: 'support@ziada.co',
    note: 'Response within 24 hours',
    color: 'var(--accent)',
    href: 'mailto:support@ziada.co',
  },
  {
    id: 'video',
    icon: '▶️',
    label: 'Video tutorials',
    sub: 'Watch how-to guides',
    note: '22 videos in Swahili & English',
    color: 'var(--bad)',
    href: '#tutorials',
  },
];

// ── Articles ──────────────────────────────────────────────────────────────────

const ARTICLES = [
  {
    id: 'add-products',
    category: 'Getting Started',
    categoryPill: 'good',
    title: 'How to add products to inventory',
    desc: 'Step-by-step guide to adding new SKUs, setting prices, and managing stock levels.',
    mins: 3,
  },
  {
    id: 'process-sale',
    category: 'POS',
    categoryPill: 'accent',
    title: 'How to process a sale on POS',
    desc: 'Open a session, search products, apply discounts, and complete a transaction.',
    mins: 4,
  },
  {
    id: 'mpesa',
    category: 'Payments',
    categoryPill: 'info',
    title: 'Accepting M-Pesa payments',
    desc: 'Configure your Lipa namba, confirm push payments, and handle failed transactions.',
    mins: 5,
  },
  {
    id: 'credits',
    category: 'Credits',
    categoryPill: 'warn',
    title: 'Managing customer credit tabs',
    desc: 'Set credit limits, issue credit sales, record repayments, and view aging reports.',
    mins: 6,
  },
  {
    id: 'tra-receipt',
    category: 'Compliance',
    categoryPill: 'bad',
    title: 'Generating a TRA-compliant receipt',
    desc: 'Connect your EFD device and issue fiscal receipts that satisfy TRA requirements.',
    mins: 7,
  },
  {
    id: 'multi-store',
    category: 'Stores',
    categoryPill: '',
    title: 'Setting up multiple stores',
    desc: 'Add branch locations, assign managers, and compare performance across outlets.',
    mins: 5,
  },
];

// ── FAQs ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How do I register for TRA e-fiscal device (EFD) integration?',
    a: 'To integrate with TRA, go to Settings → Tax & compliance and enable TRA integration. You\'ll need your EFD serial number and TIN. Ziada will guide you through the pairing process, which usually takes about 10 minutes. Your device must be registered with TRA first — visit tra.go.tz to register.',
  },
  {
    q: 'Can I use Ziada on a tablet or phone?',
    a: 'Yes! Ziada runs in any modern browser, so it works on tablets (Android or iPad) and smartphones. For the best POS experience we recommend a 10-inch or larger tablet. The app automatically adapts its layout for different screen sizes.',
  },
  {
    q: 'How do I issue a refund?',
    a: 'Open the Transactions page, find the original sale, and tap "Issue refund". You can refund the full amount or specific items. The refund will reverse the inventory and generate a credit note. M-Pesa and Tigo Pesa refunds are processed within 2 business days.',
  },
  {
    q: 'What happens to my data if the internet goes off?',
    a: 'Ziada works offline! Sales, inventory updates, and customer records are stored locally on your device and automatically sync when connectivity is restored. You can process sales, print receipts (on locally connected printers), and manage stock with no internet. TRA fiscal receipts require connectivity to get a control code.',
  },
  {
    q: 'Can multiple cashiers use Ziada at the same time?',
    a: 'Absolutely. Each cashier logs in with their own PIN or password. You can set permissions per role — for example, a cashier can process sales but cannot edit prices or view reports. All sessions sync in real time so managers can see live till activity.',
  },
  {
    q: 'How do I import products from a spreadsheet?',
    a: 'Go to Inventory → Import and download our Excel template. Fill in your product names, SKUs, prices, and stock levels, then upload the file. Ziada validates the data and shows you a preview before importing. You can import up to 5,000 products at once.',
  },
];

// ── Pill color map ────────────────────────────────────────────────────────────
const PILL_CLASSES: Record<string, string> = {
  good: 'good', accent: 'accent', info: 'info', warn: 'warn', bad: 'bad', '': '',
};

// ── FAQ accordion item ────────────────────────────────────────────────────────

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div
      className="surface"
      style={{
        overflow: 'hidden',
        borderColor: open ? 'var(--accent-line)' : 'var(--line)',
        background: open ? 'var(--accent-soft)' : 'var(--bg-2)',
        transition: 'background 150ms, border-color 150ms',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '15px 18px', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--fg)', textAlign: 'left', gap: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{q}</span>
        <span style={{
          width: 22, height: 22, borderRadius: 5, border: '1px solid var(--line-2)',
          background: open ? 'var(--accent)' : 'var(--bg-3)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
          color: open ? '#fff' : 'var(--fg-3)',
          fontSize: 14, lineHeight: 1, transition: 'background 150ms, color 150ms',
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredArticles = ARTICLES.filter(
    (a) =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFaqs = FAQS.filter(
    (f) => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Help & support' }]}>
      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center', padding: '32px 24px 28px',
        background: 'linear-gradient(180deg, var(--accent-soft) 0%, transparent 100%)',
        borderRadius: 14, border: '1px solid var(--accent-line)', marginBottom: 28,
      }}>
        <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Help & support
        </div>
        <div style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 22 }}>
          Find answers, watch tutorials, or get in touch with our team.
        </div>
        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, maxWidth: 520, margin: '0 auto',
          padding: '0 14px 0 16px', height: 46,
          border: '1px solid var(--accent-line)', borderRadius: 10,
          background: 'var(--bg-2)', boxShadow: '0 4px 16px rgba(99,102,241,0.1)',
        }}>
          <span style={{ color: 'var(--fg-3)', flexShrink: 0 }}>{Icons.search}</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles…"
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 0,
              color: 'var(--fg)', fontSize: 15, fontFamily: 'inherit',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'var(--fg-3)', cursor: 'pointer', padding: 2 }}
            >
              {Icons.close}
            </button>
          )}
        </div>
        {search && (
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 10 }}>
            {filteredArticles.length + filteredFaqs.length} result{filteredArticles.length + filteredFaqs.length !== 1 ? 's' : ''} for "{search}"
          </div>
        )}
      </div>

      {/* ── Quick action cards ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-3)', gap: 14, marginBottom: 32 }}>
        {QUICK_ACTIONS.map((a) => (
          <a
            key={a.id}
            href={a.href}
            className="surface"
            style={{
              display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 20px 18px',
              textDecoration: 'none',
              borderColor: a.color === '#25d366' ? 'rgba(37,211,102,0.25)' : a.color === 'var(--bad)' ? 'rgba(251,113,133,0.25)' : 'var(--accent-line)',
              background: a.color === '#25d366' ? 'rgba(37,211,102,0.07)' : a.color === 'var(--bad)' ? 'var(--bad-soft)' : 'var(--accent-soft)',
              transition: 'transform 120ms, box-shadow 120ms',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, fontSize: 22,
                display: 'grid', placeItems: 'center', flexShrink: 0,
                background: 'var(--bg-2)', border: '1px solid var(--line)',
              }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 1 }}>{a.sub}</div>
              </div>
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{a.note}</div>
          </a>
        ))}
      </div>

      {/* ── Popular articles ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Popular articles</h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>
            {filteredArticles.length} of {ARTICLES.length} articles
          </span>
        </div>
        {filteredArticles.length === 0 ? (
          <div className="surface" style={{ padding: 36, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>NO ARTICLES FOUND</div>
            <div style={{ fontSize: 13.5, color: 'var(--fg-3)', marginTop: 6 }}>Try different keywords or browse all categories.</div>
            <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => setSearch('')}>Clear search</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-3)', gap: 12 }}>
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="surface"
                style={{
                  padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10,
                  cursor: 'pointer', transition: 'border-color 120ms, background 120ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-line)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-3)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={'pill ' + (PILL_CLASSES[article.categoryPill] || '')}>
                    {article.category}
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{article.mins} min read</span>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4, marginBottom: 5 }}>{article.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>{article.desc}</div>
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--accent)', fontWeight: 500 }}>
                    Read →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FAQ accordion ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Frequently asked questions</h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>
            {filteredFaqs.length} questions
          </span>
        </div>
        {filteredFaqs.length === 0 ? (
          <div className="surface" style={{ padding: 36, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>NO FAQS FOUND</div>
            <div style={{ fontSize: 13.5, color: 'var(--fg-3)', marginTop: 6 }}>Try different keywords.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredFaqs.map((faq, i) => (
              <FaqItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Contact strip ─────────────────────────────────────────────────── */}
      <div
        className="surface"
        style={{
          padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          background: 'linear-gradient(135deg, var(--bg-3) 0%, var(--bg-2) 100%)',
          borderColor: 'var(--line-2)',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>Still need help?</div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Our support team speaks Swahili and English. We're here to help.</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>💬</span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>WhatsApp</div>
              <div className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>+255 800 123 456</div>
            </div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--line)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>✉️</span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Email</div>
              <div className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>support@ziada.co</div>
            </div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--line)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🕐</span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Hours</div>
              <div className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>Mon–Sat 7AM–9PM</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>Ziada Retail OS</div>
          <span className="pill">v2.4.0</span>
        </div>
      </div>
    </AppShell>
  );
}
