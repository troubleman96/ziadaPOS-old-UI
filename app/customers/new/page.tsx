'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';

type CustomerGroup = 'Regular' | 'VIP' | 'Wholesale';

const GROUP_DESCRIPTIONS: Record<CustomerGroup, string> = {
  Regular: 'Standard retail customer with normal pricing.',
  VIP: 'Loyal customer — eligible for discounts and priority service.',
  Wholesale: 'Bulk buyer — wholesale pricing and extended credit terms.',
};

export default function NewCustomerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    group: 'Regular' as CustomerGroup,
    creditLimit: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    else if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone)) e.phone = 'Enter a valid phone number.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.creditLimit && isNaN(Number(form.creditLimit.replace(/,/g, '')))) e.creditLimit = 'Enter a valid number.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    router.push('/customers');
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

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>

          {/* Left column — main fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Basic info card */}
            <div className="surface">
              <div className="card-head">
                <span className="card-title">Basic information</span>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Name */}
                <div style={fieldWrap}>
                  <label style={labelStyle}>Full name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Hamisi Juma"
                    style={inputStyle(!!errors.name)}
                  />
                  {errors.name && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.name}</span>}
                </div>

                {/* Phone */}
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

                {/* Email */}
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

                {/* Address */}
                <div style={fieldWrap}>
                  <label style={labelStyle}>Address <span style={{ color: 'var(--fg-4)', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--sans)' }}>(optional)</span></label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={set('address')}
                    placeholder="e.g. Kariakoo, Dar es Salaam"
                    style={inputStyle()}
                  />
                </div>

                {/* Notes */}
                <div style={fieldWrap}>
                  <label style={labelStyle}>Notes <span style={{ color: 'var(--fg-4)', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--sans)' }}>(optional)</span></label>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    placeholder="Any notes about this customer…"
                    rows={3}
                    style={{
                      ...inputStyle(),
                      resize: 'vertical', lineHeight: 1.5,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column — group + credit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Customer group */}
            <div className="surface">
              <div className="card-head">
                <span className="card-title">Customer group</span>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(['Regular', 'VIP', 'Wholesale'] as CustomerGroup[]).map((g) => {
                  const active = form.group === g;
                  const colors: Record<CustomerGroup, { active: string; border: string; dot: string }> = {
                    Regular: { active: 'var(--accent-soft)', border: 'var(--accent-line)', dot: 'var(--accent)' },
                    VIP: { active: 'var(--warn-soft)', border: 'rgba(251,191,36,0.3)', dot: 'var(--warn)' },
                    Wholesale: { active: 'var(--good-soft)', border: 'rgba(52,211,153,0.3)', dot: 'var(--good)' },
                  };
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, group: g }))}
                      style={{
                        padding: '10px 12px', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                        border: '1px solid ' + (active ? colors[g].border : 'var(--line)'),
                        background: active ? colors[g].active : 'var(--bg)',
                        transition: 'all 120ms',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 999, background: colors[g].dot, flexShrink: 0 }}></span>
                        <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: active ? 'var(--fg)' : 'var(--fg-2)' }}>{g}</span>
                        {active && (
                          <span style={{ marginLeft: 'auto', color: colors[g].dot }}>
                            {Icons.check}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-3)', paddingLeft: 16 }}>{GROUP_DESCRIPTIONS[g]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Credit limit */}
            <div className="surface">
              <div className="card-head">
                <span className="card-title">Credit settings</span>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Credit limit (TZS) <span style={{ color: 'var(--fg-4)', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--sans)' }}>(optional)</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.creditLimit}
                    onChange={set('creditLimit')}
                    placeholder="e.g. 50,000"
                    style={inputStyle(!!errors.creditLimit)}
                  />
                  {errors.creditLimit && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.creditLimit}</span>}
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--line)', fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                  Leave blank for no credit (cash only). Set a limit to allow this customer to buy on account.
                </div>
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
                  <span className="k">Group</span>
                  <span className="v">{form.group}</span>
                </div>
                <div className="field-row">
                  <span className="k">Credit limit</span>
                  <span className="v mono" style={{ fontSize: 12 }}>
                    {form.creditLimit ? `TZS ${Number(form.creditLimit.replace(/,/g, '')).toLocaleString()}` : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
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
