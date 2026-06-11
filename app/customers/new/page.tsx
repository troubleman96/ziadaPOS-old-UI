'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { customerApi } from '../../../lib/api';

type Segment = 'New' | 'Regular' | 'VIP' | 'Occasional';

const SEGMENT_META: Record<Segment, { desc: string; color: string; border: string; dot: string }> = {
  New:       { desc: 'First-time buyer — no purchase history yet.',                      color: 'var(--info-soft)',  border: 'var(--info-line)',             dot: 'var(--info)' },
  Regular:   { desc: 'Returning customer with normal retail pricing.',                    color: 'var(--accent-soft)', border: 'var(--accent-line)',           dot: 'var(--accent)' },
  VIP:       { desc: 'Loyal high-value customer — eligible for discounts and priority.',  color: 'var(--warn-soft)',  border: 'rgba(251,191,36,0.3)',          dot: 'var(--warn)' },
  Occasional:{ desc: 'Infrequent buyer — visits a few times a year.',                    color: 'var(--good-soft)',  border: 'rgba(52,211,153,0.3)',          dot: 'var(--good)' },
};

export default function NewCustomerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    segment: 'New' as Segment,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form | '_submit', string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): typeof errors => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrs = validate();
    if (Object.keys(clientErrs).length > 0) { setErrors(clientErrs); return; }

    setSaving(true);
    setErrors({});

    const result = await customerApi.create({
      name:       form.name.trim(),
      phone:      form.phone.trim(),
      email:      form.email.trim() || undefined,
      notes:      form.notes.trim() || undefined,
      segment:    form.segment,
      avatar_hue: Math.floor(Math.random() * 360),
    });

    setSaving(false);

    if (result.success && result.data) {
      router.push(`/customers/${result.data.id}`);
      return;
    }

    // Map API field errors back to the form
    const apiErrs: typeof errors = {};
    const rawErrs = (result as { errors?: Record<string, unknown> }).errors ?? {};
    const FIELDS = new Set(['name', 'phone', 'email', 'notes', 'segment']);
    const unknown: string[] = [];

    for (const [k, v] of Object.entries(rawErrs)) {
      const msg = Array.isArray(v) ? (v as string[])[0] : String(v);
      if (FIELDS.has(k)) apiErrs[k as keyof typeof form] = msg;
      else unknown.push(msg);
    }

    if (unknown.length) apiErrs._submit = unknown.join('; ');
    if (!Object.keys(apiErrs).length) apiErrs._submit = result.message || 'Failed to save customer.';

    setErrors(apiErrs);
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%', padding: '9px 12px',
    border: '1px solid ' + (hasError ? 'var(--bad)' : 'var(--line-2)'),
    borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)',
    fontSize: 13.5, fontFamily: 'inherit', outline: 0,
    transition: 'border-color 120ms',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12,
    fontFamily: 'var(--mono)', color: 'var(--fg-3)',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    marginBottom: 5,
  };

  const fieldWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 0 };

  return (
    <AppShell
      crumbs={[
        { label: 'ziada', href: '/' },
        { label: 'Duka Kuu', href: '/' },
        { label: 'Customers', href: '/customers' },
        { label: 'New customer' },
      ]}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>Add customer</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--fg-3)' }}>
            Create a new customer profile for Duka Kuu.
          </p>
        </div>
        <Link href="/customers">
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.close} Cancel
          </button>
        </Link>
      </div>

      {errors._submit && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', fontSize: 13, color: 'var(--bad)' }}>
          {errors._submit}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>

          {/* Left column — main fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="surface">
              <div className="card-head">
                <span className="card-title">Basic information</span>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Full name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Hamisi Juma"
                    style={inputStyle(!!errors.name)}
                    autoFocus
                  />
                  {errors.name && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.name}</span>}
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Phone number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+255 7XX XXX XXX"
                    style={inputStyle(!!errors.phone)}
                  />
                  {errors.phone && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.phone}</span>}
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Email <span style={{ color: 'var(--fg-4)', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--sans)' }}>(optional)</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="customer@example.com"
                    style={inputStyle(!!errors.email)}
                  />
                  {errors.email && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.email}</span>}
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Notes <span style={{ color: 'var(--fg-4)', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--sans)' }}>(optional)</span></label>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    placeholder="Address, preferences, or any notes about this customer…"
                    rows={3}
                    style={{ ...inputStyle(), resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column — segment + actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="surface">
              <div className="card-head">
                <span className="card-title">Customer segment</span>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.keys(SEGMENT_META) as Segment[]).map((seg) => {
                  const active = form.segment === seg;
                  const m = SEGMENT_META[seg];
                  return (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, segment: seg }))}
                      style={{
                        padding: '10px 12px', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                        border: '1px solid ' + (active ? m.border : 'var(--line)'),
                        background: active ? m.color : 'var(--bg)',
                        transition: 'all 120ms',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 999, background: m.dot, flexShrink: 0 }}></span>
                        <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: active ? 'var(--fg)' : 'var(--fg-2)' }}>{seg}</span>
                        {active && <span style={{ marginLeft: 'auto', color: m.dot }}>{Icons.check}</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-3)', paddingLeft: 16 }}>{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="surface" style={{ padding: '14px 18px' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 10 }}>SUMMARY</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div className="field-row">
                  <span className="k">Name</span>
                  <span className="v" style={{ fontWeight: 500 }}>{form.name || <span style={{ color: 'var(--fg-4)' }}>—</span>}</span>
                </div>
                <div className="field-row">
                  <span className="k">Phone</span>
                  <span className="v mono" style={{ fontSize: 12 }}>{form.phone || <span style={{ color: 'var(--fg-4)' }}>—</span>}</span>
                </div>
                <div className="field-row">
                  <span className="k">Segment</span>
                  <span className="v">{form.segment}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (
                <span className="mono" style={{ fontSize: 12 }}>Saving…</span>
              ) : (
                <>{Icons.check} Save customer</>
              )}
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
