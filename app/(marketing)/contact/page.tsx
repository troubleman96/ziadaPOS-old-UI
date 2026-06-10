'use client';

import React, { useState } from 'react';

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 6.5L22 7" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText('contact@ziadapos.com').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ padding: '80px 0 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, #000 20%, transparent 75%)' }} />
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 16 }}>CONTACT</div>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.02, fontFamily: 'var(--sans)' }}>
            Get in touch.
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: 'var(--fg-2)', maxWidth: 480 }}>
            We reply within 24 hours — usually faster. Talk to the founders directly, no support bots.
          </p>
        </div>
      </section>

      {/* ── Contact cards ── */}
      <section style={{ padding: '0 0 72px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div className="mkt-contact-grid">

            {/* Email */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '28px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                <EmailIcon />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Email</div>
                <div style={{ fontSize: 13.5, color: 'var(--fg-3)', lineHeight: 1.55 }}>
                  For general enquiries, partnership and billing questions.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                <a
                  href="mailto:contact@ziadapos.com"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 7, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
                >
                  contact@ziadapos.com
                </a>
                <button
                  onClick={copyEmail}
                  style={{ padding: '9px 14px', borderRadius: 7, border: '1px solid var(--line)', background: 'var(--bg-3)', color: 'var(--fg-2)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                >
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
            </div>

            {/* WhatsApp */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '28px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'grid', placeItems: 'center', color: '#22c55e' }}>
                <WhatsAppIcon />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>WhatsApp</div>
                <div style={{ fontSize: 13.5, color: 'var(--fg-3)', lineHeight: 1.55 }}>
                  The fastest way to reach us. Talk directly to a founder, not a support queue.
                </div>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <a
                  href="https://wa.me/255692069230?text=Hi%20Ziada%20team%2C%20I%27d%20like%20to%20learn%20more%20about%20Ziada"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '9px 18px', borderRadius: 7, background: '#22c55e', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
                >
                  <WhatsAppIcon /> Chat on WhatsApp
                </a>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', marginTop: 10, letterSpacing: '0.04em' }}>0692069230 · Ditrick Mpangile</div>
              </div>
            </div>

            {/* Location */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '28px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--info-soft)', border: '1px solid rgba(96,165,250,0.25)', display: 'grid', placeItems: 'center', color: 'var(--info)' }}>
                <LocationIcon />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Location</div>
                <div style={{ fontSize: 13.5, color: 'var(--fg-3)', lineHeight: 1.65 }}>
                  Dar es Salaam, Tanzania<br />
                  East Africa
                </div>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)', lineHeight: 1.8, letterSpacing: '0.04em' }}>
                  DAR ES SALAAM · ARUSHA · MWANZA<br />
                  DODOMA · MBEYA · ZANZIBAR
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Talk to founders ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '72px 0', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 8 }}>THE TEAM</div>
          <h2 style={{ margin: '0 0 36px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em' }}>Talk directly to a founder</h2>
          <div className="mkt-founders-grid">
            {[
              {
                name: 'Emmanuel Lugenge',
                role: 'Co-founder · Product & Engineering',
                company: 'Camel Tech',
                note: 'Questions about product features, integrations, and the technical roadmap.',
                initial: 'E',
                wa: 'https://wa.me/255692069230?text=Hi+Emmanuel%2C+',
              },
              {
                name: 'Ditrick Mpangile',
                role: 'Co-founder · Design & Growth',
                company: 'Camel Creatives',
                note: 'Questions about onboarding, partnerships, pricing, and getting set up.',
                initial: 'D',
                wa: 'https://wa.me/255692069230?text=Hi+Ditrick%2C+',
              },
            ].map((f) => (
              <div key={f.name} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '24px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--accent)', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 600, color: '#fff', flexShrink: 0, fontFamily: 'var(--sans)' }}>
                    {f.initial}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 3 }}>{f.role}</div>
                    <div style={{ display: 'inline-flex', marginTop: 6, padding: '2px 8px', borderRadius: 999, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--accent)', letterSpacing: '0.04em' }}>
                      {f.company}
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6 }}>{f.note}</p>
                <a
                  href={f.wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 7, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 13, textDecoration: 'none', background: 'var(--bg-2)', marginTop: 'auto' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--good)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                  WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Response SLA ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '56px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="mkt-contact-grid">
            {[
              { label: 'WhatsApp', time: '< 2 hours', note: 'During business hours EAT' },
              { label: 'Email', time: '< 24 hours', note: 'Responses every business day' },
              { label: 'Enterprise', time: '< 4 hours', note: 'Priority SLA for Enterprise plans' },
            ].map(({ label, time, note }) => (
              <div key={label} style={{ textAlign: 'center', padding: '24px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg-2)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--good)', fontFamily: 'var(--mono)', marginBottom: 6 }}>{time}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
