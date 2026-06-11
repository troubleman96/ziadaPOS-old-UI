'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmtDate } from '../../lib/utils';
import {
  reportsApi,
  authApi,
  ReportType,
  ScheduledReportEntry,
  ReportExportEntry,
} from '../../lib/api';
import { openReportPrintWindow } from '../../lib/reportPdf';

// ── helpers ───────────────────────────────────────────────────────────────────
const RANGE_OPTIONS = [
  { label: 'Last 7 days',          value: '7d'    },
  { label: 'Last 30 days',         value: '30d'   },
  { label: 'Last 90 days',         value: '90d'   },
  { label: 'This calendar month',  value: 'month' },
  { label: 'Year to date',         value: 'ytd'   },
];

const FREQ_OPTIONS = [
  { label: 'Daily',   value: 'daily'   },
  { label: 'Weekly',  value: 'weekly'  },
  { label: 'Monthly', value: 'monthly' },
];

const TYPE_OPTIONS = [
  { label: 'Sales Summary',        value: 'sales'     },
  { label: 'Inventory Valuation',  value: 'inventory' },
  { label: 'Tax Statement',        value: 'tax'       },
  { label: 'Credit Aged Debtors',  value: 'credit'    },
];

function colorVar(c: string) {
  return c === 'accent' ? 'var(--accent)' : c === 'good' ? 'var(--good)' :
         c === 'warn'   ? 'var(--warn)'   : c === 'bad'  ? 'var(--bad)' : 'var(--info)';
}
function softVar(c: string) {
  return c === 'accent' ? 'var(--accent-soft)' : c === 'good' ? 'var(--good-soft)' :
         c === 'warn'   ? 'var(--warn-soft)'   : c === 'bad'  ? 'var(--bad-soft)'  : 'var(--bg-3)';
}
function lineVar(c: string) {
  return c === 'accent' ? 'var(--accent-line)' : c === 'good' ? 'rgba(52,211,153,.3)' :
         c === 'warn'   ? 'rgba(251,191,36,.3)' : c === 'bad'  ? 'rgba(251,113,133,.3)' : 'var(--line-2)';
}

function freqColor(f: string) {
  return f === 'daily' ? 'var(--accent)' : f === 'weekly' ? 'var(--good)' : 'var(--warn)';
}
function freqSoft(f: string) {
  return f === 'daily' ? 'var(--accent-soft)' : f === 'weekly' ? 'var(--good-soft)' : 'var(--warn-soft)';
}
function freqLine(f: string) {
  return f === 'daily' ? 'var(--accent-line)' : f === 'weekly' ? 'rgba(52,211,153,.3)' : 'rgba(251,191,36,.3)';
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes rsp{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'rsp 0.7s linear infinite', display: 'inline-block', verticalAlign: 'middle' }} />
    </>
  );
}

// ── QuickExportCard ───────────────────────────────────────────────────────────
function QuickExportCard({
  rt, lastRun, onGenerated,
}: {
  rt: ReportType;
  lastRun: string | null;
  onGenerated: () => void;
}) {
  const [range, setRange] = useState('30d');
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const cv = colorVar(rt.color);
  const sv = softVar(rt.color);
  const lv = lineVar(rt.color);

  async function handleCSV() {
    setLoadingCSV(true);
    await reportsApi.generateCSV(rt.id, range);
    setLoadingCSV(false);
    onGenerated();
  }

  async function handlePDF() {
    setLoadingPDF(true);
    const res = await reportsApi.generateJSON(rt.id, range);
    setLoadingPDF(false);
    if (res.success && res.data) {
      const d = res.data as Record<string, unknown>;
      const reportData = (d.report as Record<string, unknown>) ?? d;
      openReportPrintWindow(
        rt.id,
        reportData,
        {
          report_name:  String(reportData.report_name ?? rt.name),
          store_name:   String(reportData.store_name  ?? ''),
          period_label: String(d.period_label ?? reportData.period_label ?? range),
          date_from:    String(d.date_from    ?? reportData.date_from ?? ''),
          date_to:      String(d.date_to      ?? reportData.date_to   ?? ''),
        },
        `${window.location.origin}/ziada-final.jpeg`,
      );
      onGenerated();
    }
  }

  return (
    <div className="surface" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: sv, color: cv, display: 'grid', placeItems: 'center', border: `1px solid ${lv}` }}>
            {rt.id === 'sales'     ? Icons.analytics  :
             rt.id === 'inventory' ? Icons.inventory   :
             rt.id === 'tax'       ? Icons.receipt     :
             rt.id === 'credit'    ? Icons.credit      : Icons.reports}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3 }}>{rt.name}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.45 }}>{rt.desc}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {rt.supports_date_range && (
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 5 }}>DATE RANGE</div>
            <select value={range} onChange={(e) => setRange(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line-2)', background: 'var(--bg)', color: 'var(--fg)', fontSize: 12.5, fontFamily: 'inherit', outline: 0, cursor: 'pointer' }}>
              {RANGE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-soft" onClick={handleCSV} disabled={loadingCSV}
            style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5, opacity: loadingCSV ? 0.7 : 1 }}>
            {loadingCSV ? <Spinner /> : Icons.download} CSV
          </button>
          <button className="btn btn-primary" onClick={handlePDF} disabled={loadingPDF}
            style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5, opacity: loadingPDF ? 0.7 : 1 }}>
            {loadingPDF ? <Spinner /> : Icons.reports} PDF
          </button>
        </div>
        {lastRun && (
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>Last run: {fmtDate(new Date(lastRun))}</div>
        )}
      </div>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      style={{ width: 36, height: 20, borderRadius: 999, background: enabled ? 'var(--accent)' : 'var(--bg-4)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 150ms', padding: 0, flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: enabled ? 18 : 2, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'left 150ms', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

// ── Add Schedule Modal ────────────────────────────────────────────────────────
function AddScheduleModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '', report_type: 'sales', frequency: 'weekly',
    date_range_preset: '30d',
  });
  // Up to 2 separate email fields
  const [email1, setEmail1] = useState('');
  const [email2, setEmail2] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Auto-populate the user's registered email on open
  useEffect(() => {
    authApi.me().then((res) => {
      if (res.success && res.data?.user?.email) {
        setEmail1(res.data.user.email);
      }
    });
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    const recipients = [email1, email2].map(s => s.trim()).filter(Boolean);
    if (recipients.length === 0) e.email1 = 'At least one recipient is required.';
    else if (recipients.some(r => !r.includes('@'))) e.email1 = 'Enter a valid email address.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const recipients = [email1, email2].map(s => s.trim()).filter(Boolean);
    const res = await reportsApi.createScheduled({
      name: form.name.trim(),
      report_type: form.report_type,
      frequency: form.frequency,
      date_range_preset: form.date_range_preset,
      recipients,
      is_enabled: true,
    });
    setSaving(false);
    if (res.success) { onSaved(); onClose(); }
    else setErrors({ _: 'Failed to save. Please try again.' });
  }

  const field = (key: string, label: string, node: React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg-2)' }}>{label}</label>
      {node}
      {errors[key] && <span style={{ fontSize: 11.5, color: 'var(--bad)' }}>{errors[key]}</span>}
    </div>
  );

  const selectStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 7, border: '1px solid var(--line-2)', background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit', outline: 0, width: '100%' };
  const inputStyle: React.CSSProperties = { ...selectStyle };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}>
      <div className="surface" style={{ width: 460, borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.4)' }}>
        <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <span className="card-title" style={{ fontSize: 15 }}>Schedule a report</span>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px 8px', fontSize: 13 }}>✕</button>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {errors._ && <div style={{ padding: '8px 12px', borderRadius: 7, background: 'var(--bad-soft)', color: 'var(--bad)', fontSize: 13 }}>{errors._}</div>}

          {field('name', 'Report name', (
            <input style={inputStyle} value={form.name}
              placeholder="e.g. Weekly Sales Summary"
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('report_type', 'Report type', (
              <select style={selectStyle} value={form.report_type} onChange={(e) => setForm(f => ({ ...f, report_type: e.target.value }))}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ))}
            {field('frequency', 'Frequency', (
              <select style={selectStyle} value={form.frequency} onChange={(e) => setForm(f => ({ ...f, frequency: e.target.value }))}>
                {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ))}
          </div>

          {field('date_range_preset', 'Date range', (
            <select style={selectStyle} value={form.date_range_preset} onChange={(e) => setForm(f => ({ ...f, date_range_preset: e.target.value }))}>
              {RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg-2)' }}>
              Recipients <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>(max 2)</span>
            </label>
            <input style={inputStyle} type="email" value={email1} placeholder="Primary email (auto-filled from your account)"
              onChange={(e) => setEmail1(e.target.value)} />
            {errors.email1 && <span style={{ fontSize: 11.5, color: 'var(--bad)' }}>{errors.email1}</span>}
            <input style={{ ...inputStyle, marginTop: 4 }} type="email" value={email2}
              placeholder="Optional 2nd recipient"
              onChange={(e) => setEmail2(e.target.value)} />
          </div>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving ? <Spinner /> : null} Save schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Scheduled Tab ─────────────────────────────────────────────────────────────
function ScheduledTab() {
  const [rows, setRows] = useState<ScheduledReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await reportsApi.getScheduled();
    if (res.success && res.data) {
      setRows(res.data.scheduled_reports);
      setActiveCount(res.data.active_count);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(id: string, current: boolean) {
    setRows(r => r.map(x => x.id === id ? { ...x, is_enabled: !current } : x));
    await reportsApi.patchScheduled(id, { is_enabled: !current });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this scheduled report?')) return;
    const res = await reportsApi.deleteScheduled(id);
    if (res.success) setRows(r => r.filter(x => x.id !== id));
  }

  const [sending, setSending] = useState<string | null>(null);
  const [sendMsg, setSendMsg] = useState<string | null>(null);

  async function handleSendNow(id: string) {
    setSending(id);
    setSendMsg(null);
    const res = await reportsApi.sendScheduledNow(id);
    setSending(null);
    if (res.success && res.data) {
      setSendMsg(`Sent to ${res.data.sent} recipient(s).`);
      setTimeout(() => setSendMsg(null), 4000);
      load();
    } else {
      setSendMsg('Send failed. Check recipients.');
      setTimeout(() => setSendMsg(null), 4000);
    }
  }

  return (
    <>
      {showModal && <AddScheduleModal onClose={() => setShowModal(false)} onSaved={load} />}
      {sendMsg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500, padding: '10px 18px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--line)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', fontSize: 13, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--good)' }}>✓</span> {sendMsg}
        </div>
      )}
      <div className="surface" style={{ overflow: 'hidden' }}>
        <div className="card-head">
          <div>
            <span className="card-title">Scheduled reports</span>
            {!loading && <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginLeft: 8 }}>{activeCount} active</span>}
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}
            style={{ fontSize: 12.5, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.plus} Schedule report
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Spinner /></div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 8 }}>NO SCHEDULES</div>
            <div style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 16 }}>No reports are scheduled yet.</div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {Icons.plus} Add your first schedule
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Report name</th>
                  <th>Type</th>
                  <th>Frequency</th>
                  <th>Recipients</th>
                  <th>Last sent</th>
                  <th>Next send</th>
                  <th style={{ textAlign: 'center' }}>Active</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 13.5, fontWeight: 500 }}>{r.name}</td>
                    <td>
                      <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                        {TYPE_OPTIONS.find(t => t.value === r.report_type)?.label ?? r.report_type}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 999, fontSize: 11.5, background: freqSoft(r.frequency), color: freqColor(r.frequency), border: `1px solid ${freqLine(r.frequency)}` }}>
                        {r.frequency.charAt(0).toUpperCase() + r.frequency.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {r.recipients.slice(0, 2).map((email, i) => (
                          <span key={i} className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>{email}</span>
                        ))}
                        {r.recipients.length > 2 && (
                          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>+{r.recipients.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                      {r.last_sent_at ? fmtDate(new Date(r.last_sent_at)) : '—'}
                    </td>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>
                      {r.next_send_at ? fmtDate(new Date(r.next_send_at)) : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <ToggleSwitch enabled={r.is_enabled} onChange={() => handleToggle(r.id, r.is_enabled)} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" onClick={() => handleSendNow(r.id)}
                          disabled={sending === r.id}
                          title="Send report email now"
                          style={{ fontSize: 11, padding: '4px 7px', color: 'var(--accent)', opacity: sending === r.id ? 0.5 : 1 }}>
                          {sending === r.id ? '…' : 'Send'}
                        </button>
                        <button className="btn btn-ghost" onClick={() => handleDelete(r.id)}
                          style={{ fontSize: 11, padding: '4px 7px', color: 'var(--bad)' }}>
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab() {
  const [exports, setExports] = useState<ReportExportEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    reportsApi.getHistory('limit=50').then((res) => {
      if (res.success && res.data) { setExports(res.data.exports); setTotal(res.data.total); }
      setLoading(false);
    });
  }, []);

  async function handleDownload(ex: ReportExportEntry) {
    setDownloading(ex.id);
    await reportsApi.downloadExport(ex.id, ex.format);
    setDownloading(null);
  }

  return (
    <div className="surface" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <span className="card-title">Export history</span>
        {!loading && <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{total} file{total !== 1 ? 's' : ''}</span>}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}><Spinner /></div>
      ) : exports.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 8 }}>NO HISTORY</div>
          <div style={{ fontSize: 14, color: 'var(--fg-3)' }}>No reports have been generated yet. Use the Overview tab to export your first report.</div>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Report</th>
                <th>Period</th>
                <th>Format</th>
                <th>Generated by</th>
                <th>Generated at</th>
                <th className="num">Size</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {exports.map((ex) => (
                <tr key={ex.id}>
                  <td style={{ fontSize: 13.5, fontWeight: 500 }}>{ex.name}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{ex.period_label}</td>
                  <td>
                    <span className="pill" style={{
                      background: ex.format === 'csv' ? 'var(--good-soft)' : 'rgba(251,113,133,.09)',
                      color: ex.format === 'csv' ? 'var(--good)' : 'var(--bad)',
                      borderColor: ex.format === 'csv' ? 'rgba(52,211,153,.3)' : 'rgba(251,113,133,.3)',
                    }}>
                      {ex.format.toUpperCase()}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{ex.created_by_name}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{fmtDate(new Date(ex.created_at))}</td>
                  <td className="num mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{ex.file_size_display}</td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => handleDownload(ex)} disabled={downloading === ex.id}
                      style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {downloading === ex.id ? <Spinner /> : Icons.download} Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [tab, setTab] = useState<'overview' | 'scheduled' | 'history'>('overview');
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [exports, setExports] = useState<ReportExportEntry[]>([]);
  const [scheduledCount, setScheduledCount] = useState<{ total: number; active: number } | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    const [typesRes, histRes, schedRes] = await Promise.all([
      reportsApi.getTypes(),
      reportsApi.getHistory('limit=20'),
      reportsApi.getScheduled(),
    ]);
    if (typesRes.success && typesRes.data) setReportTypes(typesRes.data.report_types);
    if (histRes.success && histRes.data) setExports(histRes.data.exports);
    if (schedRes.success && schedRes.data) {
      setScheduledCount({ total: schedRes.data.total, active: schedRes.data.active_count });
    }
    setLoadingOverview(false);
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  // Compute last-run per report type from export history
  const lastRunByType: Record<string, string> = {};
  for (const ex of exports) {
    if (!lastRunByType[ex.report_type]) lastRunByType[ex.report_type] = ex.created_at;
  }

  const activeScheduled = scheduledCount?.active ?? 0;
  const totalFiles = exports.length;
  const totalSizeBytes = exports.reduce((s, e) => s + e.file_size_bytes, 0);
  function fmtBytes(b: number) {
    if (b < 1024) return `${b} B`;
    if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1_048_576).toFixed(1)} MB`;
  }

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Reports' }]}
      actions={
        <button className="btn btn-primary" onClick={() => setTab('overview')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.reports} Generate report
        </button>
      }
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Reports</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
            Export, schedule and review all business reports for Duka Kuu.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {(['overview', 'scheduled', 'history'] as const).map((t) => {
          const labels: Record<string, string> = { overview: 'Overview', scheduled: 'Scheduled', history: 'History' };
          return (
            <button key={t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>
              {labels[t]}
              {t === 'scheduled' && activeScheduled > 0 && (
                <span className="mono" style={{ marginLeft: 6, fontSize: 10, color: tab === t ? 'var(--accent)' : 'var(--fg-4)' }}>
                  {activeScheduled}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <>
          {/* Quick export grid */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-2)' }}>Quick export</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{reportTypes.length} report types</span>
            </div>
            {loadingOverview ? (
              <div style={{ padding: '48px', textAlign: 'center' }}><Spinner /></div>
            ) : reportTypes.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--fg-3)' }}>No report types available.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12 }}>
                {reportTypes.map((rt) => (
                  <QuickExportCard key={rt.id} rt={rt} lastRun={lastRunByType[rt.id] ?? null} onGenerated={loadOverview} />
                ))}
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-3)', gap: 12, marginTop: 18 }}>
            <div className="surface" style={{ padding: '16px 18px' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>EXPORTS THIS SESSION</div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>{totalFiles}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>recent exports loaded</div>
            </div>
            <div className="surface" style={{ padding: '16px 18px' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>SCHEDULED ACTIVE</div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>
                {activeScheduled}
                {scheduledCount && <span style={{ fontSize: 14, color: 'var(--fg-4)', fontWeight: 400 }}>/{scheduledCount.total}</span>}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>auto-delivered reports</div>
            </div>
            <div className="surface" style={{ padding: '16px 18px' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>HISTORY SIZE</div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>{fmtBytes(totalSizeBytes)}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>last {totalFiles} exports</div>
            </div>
          </div>
        </>
      )}

      {tab === 'scheduled' && <ScheduledTab />}
      {tab === 'history'   && <HistoryTab />}
    </AppShell>
  );
}
