'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';

// ── Types & shared atoms ──────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 38, height: 22, borderRadius: 999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? 'var(--accent)' : 'var(--bg-4)',
        position: 'relative', flexShrink: 0, transition: 'background 150ms',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 19 : 3,
        width: 16, height: 16, borderRadius: 999, background: '#fff',
        transition: 'left 150ms', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

function TextInput({ label, value, onChange, placeholder, disabled, note }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; disabled?: boolean; note?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: 12.5, color: 'var(--fg-2)', fontWeight: 500 }}>{label}</label>
        {note && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{note}</span>}
      </div>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          padding: '9px 12px', borderRadius: 7, border: '1px solid var(--line)',
          background: disabled ? 'var(--bg-3)' : 'var(--bg)',
          color: disabled ? 'var(--fg-3)' : 'var(--fg)',
          fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'text',
          width: '100%', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function SelectInput({ label, value, options, onChange, disabled }: {
  label: string; value: string; options: string[]; onChange?: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, color: 'var(--fg-2)', fontWeight: 500 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          padding: '9px 12px', borderRadius: 7, border: '1px solid var(--line)',
          background: disabled ? 'var(--bg-3)' : 'var(--bg)',
          color: disabled ? 'var(--fg-3)' : 'var(--fg)',
          fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          appearance: 'none', width: '100%', boxSizing: 'border-box',
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ flex: 1, marginRight: 24 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 2 }}>{description}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Sidebar items ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'store',        label: 'Store profile',       icon: Icons.store },
  { id: 'tax',          label: 'Tax & compliance',     icon: Icons.receipt },
  { id: 'payments',     label: 'Payment methods',      icon: Icons.credit },
  { id: 'receipt',      label: 'Receipt & printing',   icon: Icons.reports },
  { id: 'notifications',label: 'Notifications',        icon: Icons.bell },
  { id: 'staff',        label: 'Staff & permissions',  icon: Icons.customers },
  { id: 'integrations', label: 'Integrations',         icon: Icons.sparkles },
  { id: 'billing',      label: 'Billing & subscription', icon: Icons.analytics },
];

// ── Section panels ────────────────────────────────────────────────────────────

function StoreProfilePanel() {
  const [name, setName] = useState('Duka Kuu');
  const [tagline, setTagline] = useState('Your trusted neighborhood store');
  const [address, setAddress] = useState('Msimbazi St, Kariakoo, Dar es Salaam');
  const [phone, setPhone] = useState('+255 712 345 678');
  const [email, setEmail] = useState('dukakuu@kariakoo.co.tz');
  const [tin, setTin] = useState('100-987-654');
  const [btype, setBtype] = useState('Retail');
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 500 }}>Store profile</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)' }}>Business identity shown on receipts, reports, and the customer-facing display.</p>
      </div>

      {/* Logo upload zone */}
      <div className="surface" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Store logo</div>
        <div style={{
          border: '2px dashed var(--line-2)', borderRadius: 10, padding: '28px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          cursor: 'pointer', background: 'var(--bg-3)',
          transition: 'border-color 150ms',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
            {Icons.download}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Drop image here or click to upload</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 3 }}>PNG or SVG · max 2 MB · recommended 512×512px</div>
          </div>
          <button className="btn btn-soft" style={{ padding: '6px 14px', fontSize: 12.5 }}>Choose file</button>
        </div>
      </div>

      {/* Fields */}
      <div className="surface" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Business details</div>
        <div className="form-grid-2">
          <TextInput label="Store name" value={name} onChange={setName} placeholder="e.g. Duka Kuu" />
          <TextInput label="Tagline" value={tagline} onChange={setTagline} placeholder="Short description" />
          <TextInput label="Phone" value={phone} onChange={setPhone} placeholder="+255 7XX XXX XXX" />
          <TextInput label="Email" value={email} onChange={setEmail} placeholder="info@store.co.tz" />
        </div>
        <TextInput label="Address" value={address} onChange={setAddress} placeholder="Full address" />
        <div className="form-grid-2">
          <TextInput label="TIN Number" value={tin} onChange={setTin} placeholder="Tax Identification Number" note="Required for TRA receipts" />
          <SelectInput label="Business type" value={btype} options={['Retail', 'Wholesale', 'Retail & Wholesale', 'Services']} onChange={setBtype} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={save} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {saved ? Icons.check : Icons.edit} {saved ? 'Saved!' : 'Save changes'}
        </button>
        <button className="btn btn-ghost">Discard</button>
      </div>
    </div>
  );
}

function TaxPanel() {
  const [traEnabled, setTraEnabled] = useState(true);
  const [autoReceipts, setAutoReceipts] = useState(true);
  const [fyMonth, setFyMonth] = useState('January');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 500 }}>Tax & compliance</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)' }}>Tanzania Revenue Authority integration and fiscal settings.</p>
      </div>

      <div className="surface" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>VAT & currency</div>
        <div className="form-grid-2">
          <TextInput label="VAT rate" value="18%" disabled note="Locked — Tanzania standard rate" />
          <TextInput label="Currency" value="TZS (Tanzanian Shilling)" disabled note="Locked" />
        </div>
      </div>

      <div className="surface" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>TRA integration</div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginBottom: 14 }}>Connect to Tanzania Revenue Authority e-fiscal device (EFD) for compliant receipt generation.</div>

        <ToggleRow
          label="Enable TRA integration"
          description="Connect your store to TRA EFD system for fiscal receipts"
          checked={traEnabled}
          onChange={setTraEnabled}
        />
        <ToggleRow
          label="Automatic TRA receipts"
          description="Generate a TRA-compliant receipt for every completed sale automatically"
          checked={autoReceipts}
          onChange={setAutoReceipts}
        />

        {traEnabled && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: 'var(--good-soft)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--good)' }}>{Icons.check}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--good)' }}>TRA EFD connected</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>Device ID: EFD-00124-DSM · Last sync: 3 min ago</div>
          </div>
        )}
      </div>

      <div className="surface" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Fiscal year</div>
        <div className="form-grid-2">
          <SelectInput
            label="Fiscal year start month"
            value={fyMonth}
            options={['January', 'April', 'July', 'October']}
            onChange={setFyMonth}
          />
          <TextInput label="Tax authority reference" value="TRA-DSM-001-2024" disabled note="From your registration" />
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: 'fit-content' }}>Save tax settings</button>
    </div>
  );
}

function PaymentsPanel() {
  const [cash, setCash] = useState(true);
  const [mpesa, setMpesa] = useState(true);
  const [mpesaNum, setMpesaNum] = useState('174174');
  const [tigo, setTigo] = useState(true);
  const [airtel, setAirtel] = useState(false);
  const [nmb, setNmb] = useState(true);
  const [crdb, setCrdb] = useState(false);
  const [creditTab, setCreditTab] = useState(true);
  const [maxCredit, setMaxCredit] = useState('500000');

  const methods = [
    { id: 'cash', label: 'Cash', description: 'Accept physical cash payments', color: '#64748b', enabled: cash, onChange: setCash },
    { id: 'mpesa', label: 'M-Pesa', description: 'Vodacom M-Pesa Lipa namba', color: '#10b981', enabled: mpesa, onChange: setMpesa },
    { id: 'tigo', label: 'Tigo Pesa', description: 'Tigo mobile money payments', color: '#f59e0b', enabled: tigo, onChange: setTigo },
    { id: 'airtel', label: 'Airtel Money', description: 'Airtel mobile money', color: '#ef4444', enabled: airtel, onChange: setAirtel },
    { id: 'nmb', label: 'NMB Bank POS', description: 'NMB point-of-sale terminal', color: '#60a5fa', enabled: nmb, onChange: setNmb },
    { id: 'crdb', label: 'CRDB Bank POS', description: 'CRDB point-of-sale terminal', color: '#818cf8', enabled: crdb, onChange: setCrdb },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 500 }}>Payment methods</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)' }}>Choose which payment methods your cashiers can accept at POS.</p>
      </div>

      <div className="form-grid-2" style={{ gap: 12 }}>
        {methods.map((m) => (
          <div key={m.id} className="surface" style={{
            padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
            borderColor: m.enabled ? m.color + '44' : 'var(--line)',
            background: m.enabled ? m.color + '0a' : 'var(--bg-2)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: m.color + '22',
              border: '1px solid ' + m.color + '44', display: 'grid', placeItems: 'center',
              color: m.color, fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)',
              flexShrink: 0,
            }}>
              {m.label.slice(0, 1)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 1 }}>{m.description}</div>
              {m.id === 'mpesa' && m.enabled && (
                <div style={{ marginTop: 8 }}>
                  <TextInput label="Lipa namba" value={mpesaNum} onChange={setMpesaNum} placeholder="M-Pesa business number" />
                </div>
              )}
            </div>
            <Toggle checked={m.enabled} onChange={m.onChange} />
          </div>
        ))}
      </div>

      {/* Credit tab */}
      <div className="surface" style={{
        padding: '16px 18px',
        borderColor: creditTab ? 'var(--accent-line)' : 'var(--line)',
        background: creditTab ? 'var(--accent-soft)' : 'var(--bg-2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: creditTab ? 14 : 0 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Credit / Tab</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 2 }}>Allow customers to buy on credit and pay later. Set a maximum credit limit per customer.</div>
          </div>
          <Toggle checked={creditTab} onChange={setCreditTab} />
        </div>
        {creditTab && (
          <div style={{ maxWidth: 280 }}>
            <TextInput label="Max credit limit per customer (TZS)" value={maxCredit} onChange={setMaxCredit} placeholder="500000" />
          </div>
        )}
      </div>

      <button className="btn btn-primary" style={{ width: 'fit-content' }}>Save payment settings</button>
    </div>
  );
}

function ReceiptPanel() {
  const [header, setHeader] = useState('Duka Kuu — Kariakoo');
  const [footer, setFooter] = useState('Asante kwa kununua! / Thank you for shopping with us.');
  const [showLogo, setShowLogo] = useState(true);
  const [showTin, setShowTin] = useState(true);
  const [lang, setLang] = useState('Both');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 500 }}>Receipt & printing</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)' }}>Customize what appears on printed and digital receipts.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-receipt)', gap: 16, alignItems: 'start' }}>
        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="surface" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Receipt content</div>
            <TextInput label="Receipt header text" value={header} onChange={setHeader} placeholder="Store name or tagline" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12.5, color: 'var(--fg-2)', fontWeight: 500 }}>Footer message</label>
              <textarea
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                rows={2}
                style={{
                  padding: '9px 12px', borderRadius: 7, border: '1px solid var(--line)',
                  background: 'var(--bg)', color: 'var(--fg)', fontSize: 13.5, outline: 'none',
                  fontFamily: 'inherit', resize: 'vertical',
                }}
              />
            </div>
            <SelectInput label="Receipt language" value={lang} options={['Swahili', 'English', 'Both']} onChange={setLang} />
          </div>

          <div className="surface" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Display options</div>
            <ToggleRow label="Show store logo" description="Print your logo at the top of the receipt" checked={showLogo} onChange={setShowLogo} />
            <ToggleRow label="Show TIN on receipt" description="Required for TRA-compliant receipts" checked={showTin} onChange={setShowTin} />
          </div>

          <div className="surface" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Thermal printer</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--line)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--good-soft)', display: 'grid', placeItems: 'center', color: 'var(--good)' }}>
                {Icons.check}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Epson TM-T20III detected</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>USB · 80mm · ready</div>
              </div>
              <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '5px 10px', fontSize: 12 }}>Configure</button>
            </div>
            <button className="btn btn-soft" style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.plus} Add printer
            </button>
          </div>
        </div>

        {/* Receipt preview */}
        <div className="surface" style={{ padding: 16, position: 'sticky', top: 20 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 10 }}>RECEIPT PREVIEW</div>
          <div style={{
            background: '#fff', color: '#111', borderRadius: 6, padding: '16px 14px',
            fontFamily: 'var(--mono)', fontSize: 11.5, lineHeight: 1.8,
            border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              {showLogo && <div style={{ width: 36, height: 36, background: '#6366f1', borderRadius: 6, margin: '0 auto 8px', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>D</div>}
              <div style={{ fontWeight: 700, fontSize: 13 }}>{header}</div>
              <div style={{ fontSize: 10.5, color: '#666' }}>Msimbazi St, Kariakoo, DSM</div>
              {showTin && <div style={{ fontSize: 10.5, color: '#666' }}>TIN: 100-987-654</div>}
            </div>
            <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0', paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Unga Jogoo 2kg</span><span>TZS 4,200</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Chai Bora 500g</span><span>TZS 3,800</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Mafuta 1L</span><span>TZS 8,500</span></div>
            </div>
            <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0', paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>JUMLA / TOTAL</span><span>TZS 16,500</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666' }}><span>VAT 18%</span><span>TZS 2,523</span></div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, color: '#666', marginTop: 8 }}>{footer}</div>
            {lang !== 'English' && <div style={{ textAlign: 'center', fontSize: 9, color: '#aaa', marginTop: 4 }}>Receipt in: {lang}</div>}
          </div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: 'fit-content' }}>Save receipt settings</button>
    </div>
  );
}

function NotificationsPanel() {
  const [lowStock, setLowStock] = useState(true);
  const [dailyWa, setDailyWa] = useState(true);
  const [weeklyEmail, setWeeklyEmail] = useState(false);
  const [creditReminders, setCreditReminders] = useState(true);
  const [staffLogin, setStaffLogin] = useState(false);

  const rows = [
    { label: 'Low stock alerts', description: 'Get notified when any product drops below its reorder point', checked: lowStock, onChange: setLowStock },
    { label: 'Daily summary — WhatsApp', description: 'Receive a daily sales summary on WhatsApp each evening at 8 PM', checked: dailyWa, onChange: setDailyWa },
    { label: 'Weekly report — Email', description: 'Receive a weekly performance report every Monday morning', checked: weeklyEmail, onChange: setWeeklyEmail },
    { label: 'Credit reminders', description: 'Automatically remind customers with overdue credit balances', checked: creditReminders, onChange: setCreditReminders },
    { label: 'Staff login alerts', description: 'Get notified whenever a staff member logs in or clocks in', checked: staffLogin, onChange: setStaffLogin },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 500 }}>Notifications</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)' }}>Control when and how Ziada alerts you about important events.</p>
      </div>

      <div className="surface" style={{ padding: '4px 20px 4px' }}>
        {rows.map((row) => (
          <ToggleRow key={row.label} {...row} />
        ))}
      </div>

      <div className="surface" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Notification channels</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { icon: '📱', label: 'WhatsApp', value: '+255 712 345 678', active: true },
            { icon: '✉️', label: 'Email', value: 'dukakuu@kariakoo.co.tz', active: true },
            { icon: '🔔', label: 'In-app', value: 'Always on', active: true },
          ].map((ch) => (
            <div key={ch.label} style={{
              flex: 1, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--line)',
              background: ch.active ? 'var(--accent-soft)' : 'var(--bg-3)',
              borderColor: ch.active ? 'var(--accent-line)' : 'var(--line)',
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{ch.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{ch.label}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 2 }}>{ch.value}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: 'fit-content' }}>Save notification settings</button>
    </div>
  );
}

function PlaceholderPanel({ id }: { id: string }) {
  const labels: Record<string, string> = {
    staff: 'Staff & permissions',
    integrations: 'Integrations',
    billing: 'Billing & subscription',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 500 }}>{labels[id]}</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)' }}>This section is being built and will be available soon.</p>
      </div>
      <div className="surface" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ color: 'var(--fg-3)', marginBottom: 8 }}>{Icons.sparkles}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>COMING SOON</div>
        <div style={{ fontSize: 13.5, color: 'var(--fg-2)', marginTop: 8 }}>We're building {labels[id]?.toLowerCase()} right now.</div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState('store');

  function renderPanel() {
    switch (active) {
      case 'store':         return <StoreProfilePanel />;
      case 'tax':           return <TaxPanel />;
      case 'payments':      return <PaymentsPanel />;
      case 'receipt':       return <ReceiptPanel />;
      case 'notifications': return <NotificationsPanel />;
      default:              return <PlaceholderPanel id={active} />;
    }
  }

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Settings' }]}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Settings</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>Manage your store configuration, tax, payments, and more.</p>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-settings)', gap: 20, alignItems: 'start' }}>
        {/* Sidebar */}
        <div className="surface settings-sidebar" style={{ padding: '6px 8px', position: 'sticky', top: 20 }}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={'settings-nav-btn' + (active === s.id ? ' active' : '')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 7, border: 'none',
                background: active === s.id ? 'var(--accent-soft)' : 'transparent',
                color: active === s.id ? 'var(--fg)' : 'var(--fg-2)',
                fontSize: 13.5, cursor: 'pointer', textAlign: 'left',
                marginBottom: 2,
              }}
            >
              <span style={{ color: active === s.id ? 'var(--accent)' : 'var(--fg-4)', flexShrink: 0 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {renderPanel()}
        </div>
      </div>
    </AppShell>
  );
}
