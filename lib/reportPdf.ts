/**
 * lib/reportPdf.ts
 * Generates a high-quality, print-ready HTML document for each Ziada report type.
 * Opens in a new window and triggers window.print().
 */

// ── Formatting ────────────────────────────────────────────────────────────────

function fmtTZS(n: number | null | undefined): string {
  if (n == null) return '—';
  const v = Math.round(n);
  if (v >= 1_000_000) return `TZS ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 100_000)   return `TZS ${(v / 1_000).toFixed(0)}K`;
  return `TZS ${v.toLocaleString()}`;
}

function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${n.toFixed(1)}%`;
}

function fmtN(n: number | null | undefined): string {
  if (n == null) return '—';
  return Math.round(n).toLocaleString();
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ── Color themes per report type ──────────────────────────────────────────────

const THEME: Record<string, { primary: string; soft: string; label: string; desc: string }> = {
  sales: {
    primary: '#6366f1',
    soft: '#eef2ff',
    label: 'Sales Summary',
    desc: 'Daily sales totals, top products, payment breakdown, and revenue by category. Use this report to understand store performance, identify best-sellers, and review payment channel usage for the selected period.',
  },
  inventory: {
    primary: '#10b981',
    soft: '#ecfdf5',
    label: 'Inventory Valuation',
    desc: 'Current stock on hand valued at both cost price and retail price, grouped by category. Use this report to understand your inventory investment, identify overstocked lines, and calculate potential gross margin before any sales occur.',
  },
  tax: {
    primary: '#f59e0b',
    soft: '#fffbeb',
    label: 'Tax Statement',
    desc: 'TRA-compliant VAT summary covering gross sales, tax collected at 18%, and net taxable revenue. Only paid (cash-settled) transactions are included. Use this report when preparing monthly VAT returns for the Tanzania Revenue Authority.',
  },
  credit: {
    primary: '#ef4444',
    soft: '#fef2f2',
    label: 'Credit Aged Debtors',
    desc: 'Outstanding customer credit balances categorised by overdue days (Current, 1–7 d, 8–30 d, 31–60 d, 60+ d). Use this report to prioritise collections, identify high-risk debtors, and monitor your accounts receivable position.',
  },
};

// ── SVG bar chart ─────────────────────────────────────────────────────────────

interface BarPoint { label: string; value: number; value2?: number }

function svgBarChart(
  points: BarPoint[],
  primary: string,
  secondary: string = '#e5e7eb',
  twoSeries = false,
): string {
  if (!points.length) return '<p style="color:#999;font-size:12px;padding:24px 0">No data for this period.</p>';
  const W = 560, H = 160;
  const pl = 56, pr = 8, pt = 10, pb = 28;
  const innerW = W - pl - pr;
  const innerH = H - pt - pb;

  const maxV = Math.max(...points.map(d => Math.max(d.value, d.value2 ?? 0)), 1);

  // Nice axis max
  const mag  = Math.pow(10, Math.floor(Math.log10(maxV)));
  const norm = maxV / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  const axMax = nice * mag;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(axMax * f));
  const yScale = (v: number) => pt + innerH - (v / axMax) * innerH;
  const xScale = (i: number) => pl + (i / (points.length - 1 || 1)) * innerW;

  const barW   = Math.max(4, Math.floor(innerW / points.length) - (twoSeries ? 3 : 2));
  const bStep  = Math.floor(innerW / points.length);
  const step   = Math.max(1, Math.ceil(points.length / 8));

  function fmtAxis(v: number): string {
    if (v === 0) return '0';
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
    return String(v);
  }

  const gridLines = yTicks.map(t => `
    <line x1="${pl}" y1="${yScale(t)}" x2="${W - pr}" y2="${yScale(t)}" stroke="#f0f0f0" stroke-width="1"/>
    <text x="${pl - 6}" y="${yScale(t) + 4}" text-anchor="end" font-size="9" fill="#aaa" font-family="system-ui">${fmtAxis(t)}</text>
  `).join('');

  const bars = points.map((d, i) => {
    const x = pl + i * bStep;
    const bh1 = Math.max(1, (d.value  / axMax) * innerH);
    const bh2 = Math.max(1, ((d.value2 ?? 0) / axMax) * innerH);
    const y1  = yScale(d.value);
    const y2  = yScale(d.value2 ?? 0);
    const label = i % step === 0 ? `<text x="${x + barW / 2}" y="${H - 8}" text-anchor="middle" font-size="8.5" fill="#aaa" font-family="system-ui">${d.label}</text>` : '';

    if (twoSeries && d.value2 !== undefined) {
      return `
        <rect x="${x}" y="${y1}" width="${Math.floor(barW * 0.48)}" height="${bh1}" fill="${primary}" rx="2" opacity="0.9"/>
        <rect x="${x + Math.ceil(barW * 0.52)}" y="${y2}" width="${Math.floor(barW * 0.48)}" height="${bh2}" fill="${secondary}" rx="2" opacity="0.85"/>
        ${label}`;
    }
    return `<rect x="${x}" y="${y1}" width="${barW}" height="${bh1}" fill="${primary}" rx="2" opacity="0.9"/>${label}`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">${gridLines}${bars}</svg>`;
}

// ── SVG horizontal bar (payment mix / aging) ──────────────────────────────────

function hBar(label: string, value: number, total: number, color: string, fmt = fmtTZS): string {
  if (total <= 0) return '';
  const pct = Math.max(0, Math.min(100, (value / total) * 100));
  return `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:12px;color:#333">${label}</span>
        <span style="font-size:12px;font-weight:600;color:#111">${fmt(value)} <span style="color:#aaa;font-weight:400">${pct.toFixed(1)}%</span></span>
      </div>
      <div style="height:7px;background:#f3f4f6;border-radius:4px;overflow:hidden">
        <div style="width:${pct.toFixed(1)}%;height:100%;background:${color};border-radius:4px;transition:width 0.3s"></div>
      </div>
    </div>`;
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function kpiCard(label: string, value: string, sub: string, accent: string): string {
  return `
    <div style="flex:1;min-width:120px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;border-top:3px solid ${accent}">
      <div style="font-size:9.5px;letter-spacing:0.08em;color:#9ca3af;text-transform:uppercase;font-family:monospace;margin-bottom:6px">${label}</div>
      <div style="font-size:22px;font-weight:700;color:#111;letter-spacing:-0.02em;line-height:1.1">${value}</div>
      ${sub ? `<div style="font-size:11px;color:#6b7280;margin-top:4px;font-family:monospace">${sub}</div>` : ''}
    </div>`;
}

// ── Table builder ─────────────────────────────────────────────────────────────

interface ColDef { head: string; key: string; fmt?: (v: unknown) => string; align?: string; width?: string }

function buildTable(rows: Record<string, unknown>[], cols: ColDef[], accent: string): string {
  if (!rows.length) return '<p style="color:#999;font-size:12px;padding:16px 0">No data available.</p>';
  const thead = cols.map(c =>
    `<th style="padding:8px 10px;text-align:${c.align ?? 'left'};font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;border-bottom:2px solid ${accent};white-space:nowrap;${c.width ? `width:${c.width}` : ''}">${c.head}</th>`
  ).join('');

  const tbody = rows.map((row, ri) =>
    `<tr style="background:${ri % 2 === 0 ? '#fff' : '#fafafa'}">` +
    cols.map(c => {
      const v = row[c.key];
      const text = c.fmt ? c.fmt(v) : (v == null ? '—' : String(v));
      return `<td style="padding:7px 10px;font-size:12px;text-align:${c.align ?? 'left'};border-bottom:1px solid #f3f4f6;white-space:nowrap">${text}</td>`;
    }).join('') + '</tr>'
  ).join('');

  return `<table style="width:100%;border-collapse:collapse;font-family:system-ui">${thead}${tbody}</table>`;
}

// ── Shared base CSS ───────────────────────────────────────────────────────────

function baseCSS(primary: string): string {
  return `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;color:#111;background:#f8f9fa;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{max-width:900px;margin:0 auto;padding:32px 28px;background:#f8f9fa}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px}
    .card-head{padding:14px 18px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center}
    .card-title{font-size:13px;font-weight:600;color:#374151;letter-spacing:-0.01em}
    .card-sub{font-size:11px;color:#9ca3af;font-family:monospace}
    .card-body{padding:16px 18px}
    .section-label{font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;font-family:monospace;margin-bottom:10px}
    .legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:8px}
    .legend-item{display:flex;align-items:center;gap:5px;font-size:11px;color:#6b7280}
    .legend-dot{width:8px;height:8px;border-radius:2px;flex-shrink:0}
    .info-box{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;font-size:12px;color:#92400e;line-height:1.5;margin-bottom:16px}
    @page{size:A4;margin:16mm 12mm}
    @media print{
      body{background:#fff}
      .page{background:#fff;padding:0}
      .card{page-break-inside:avoid;box-shadow:none}
      .no-break{page-break-inside:avoid}
    }`;
}

// ── Shared header HTML ────────────────────────────────────────────────────────

function reportHeader(meta: ReportMeta, theme: typeof THEME[string], logoUrl: string): string {
  return `
    <div style="background:linear-gradient(135deg,${theme.primary} 0%,${theme.primary}dd 100%);padding:28px;border-radius:14px;margin-bottom:20px;color:#fff;display:flex;align-items:flex-start;justify-content:space-between;gap:20px">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <img src="${logoUrl}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.4)" onerror="this.style.display='none'" />
          <div>
            <div style="font-size:15px;font-weight:900;letter-spacing:-0.04em">Ziada POS</div>
            <div style="font-size:11px;opacity:0.75">${meta.store_name}</div>
          </div>
        </div>
        <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.03em;margin-bottom:6px">${theme.label}</h1>
        <div style="font-size:13px;opacity:0.85;font-weight:500">${meta.period_label}</div>
        ${meta.date_from ? `<div style="font-size:11px;opacity:0.65;margin-top:3px;font-family:monospace">${meta.date_from} → ${meta.date_to}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:9.5px;opacity:0.6;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Generated</div>
        <div style="font-size:11px;opacity:0.85">${new Date().toLocaleDateString('en-TZ', {day:'2-digit',month:'long',year:'numeric'})}</div>
        <div style="font-size:10px;opacity:0.6;margin-top:2px">${new Date().toLocaleTimeString('en-TZ',{hour:'2-digit',minute:'2-digit'})}</div>
      </div>
    </div>

    <div style="background:#fff;border:1px solid #e5e7eb;border-left:4px solid ${theme.primary};border-radius:0 10px 10px 0;padding:12px 16px;margin-bottom:20px;font-size:12.5px;color:#374151;line-height:1.6">
      <strong style="color:${theme.primary}">About this report · </strong>${theme.desc}
    </div>`;
}

// ── Report footer ─────────────────────────────────────────────────────────────

function reportFooter(): string {
  return `
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:8px;display:flex;justify-content:space-between;align-items:center;font-size:10.5px;color:#9ca3af;font-family:monospace">
      <span>Powered by Ziada POS · ziada.co.tz</span>
      <span>Generated ${new Date().toISOString().slice(0,19).replace('T',' ')} UTC</span>
    </div>`;
}

// ── Interface ─────────────────────────────────────────────────────────────────

interface ReportMeta {
  report_name: string;
  store_name: string;
  period_label: string;
  date_from: string;
  date_to: string;
}

// ── Sales Summary ─────────────────────────────────────────────────────────────

function buildSalesHTML(data: Record<string, unknown>, meta: ReportMeta, theme: typeof THEME[string], logoUrl: string): string {
  const kpis = (data.kpis ?? {}) as Record<string, number>;
  const daily = (data.daily_trend ?? []) as Array<Record<string, unknown>>;
  const products = (data.top_products ?? []) as Array<Record<string, unknown>>;
  const payMix = (data.payment_mix ?? []) as Array<Record<string, unknown>>;
  const cats = (data.category_breakdown ?? []) as Array<Record<string, unknown>>;

  const revPoints: BarPoint[] = daily.map(d => ({
    label: String(d.label ?? d.date ?? ''),
    value: Number(d.revenue ?? 0),
    value2: Number(d.profit ?? 0),
  }));

  const payTotal = (payMix as Array<{ amount: number }>).reduce((s, p) => s + (p.amount ?? 0), 0);

  const PMCOLORS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#8b5cf6'];

  const kpiRow = [
    kpiCard('Revenue',       fmtTZS(kpis.revenue),     `${kpis.transaction_count ?? 0} transactions`,   theme.primary),
    kpiCard('Gross Profit',  fmtTZS(kpis.profit),      `${fmtPct(kpis.margin_pct)} margin`,              '#10b981'),
    kpiCard('Avg Ticket',    fmtTZS(kpis.avg_ticket),  'per transaction',                                '#f59e0b'),
    kpiCard('Transactions',  fmtN(kpis.transaction_count), 'completed sales',                            '#3b82f6'),
  ].join('');

  const prodCols: ColDef[] = [
    { head: '#',         key: '__rank',    align: 'center', width: '32px' },
    { head: 'Product',   key: 'product_name' },
    { head: 'Category',  key: 'category' },
    { head: 'Qty Sold',  key: 'qty_sold',  align: 'right', fmt: (v) => fmtN(v as number) },
    { head: 'Revenue',   key: 'revenue',   align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Profit',    key: 'profit',    align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Margin',    key: 'margin_pct', align: 'right', fmt: (v) => fmtPct(v as number) },
  ];
  const prodRows = products.slice(0, 25).map((p, i) => ({ ...p, __rank: i + 1 })) as Record<string, unknown>[];

  const catCols: ColDef[] = [
    { head: 'Category',  key: 'category' },
    { head: 'Revenue',   key: 'revenue',  align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Share',     key: 'pct',      align: 'right', fmt: (v) => fmtPct(v as number) },
    { head: 'vs Prior',  key: 'delta_pct', align: 'right', fmt: (v) => v == null ? '—' : `${(v as number) >= 0 ? '+' : ''}${fmtPct(v as number)}` },
  ];

  return `
    ${kpiRow && `<div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">${kpiRow}</div>`}

    ${revPoints.length > 1 ? `
    <div class="card">
      <div class="card-head">
        <span class="card-title">Revenue vs Profit — daily trend</span>
        <div class="legend">
          <div class="legend-item"><div class="legend-dot" style="background:${theme.primary}"></div> Revenue</div>
          <div class="legend-item"><div class="legend-dot" style="background:#10b981"></div> Profit</div>
        </div>
      </div>
      <div class="card-body">${svgBarChart(revPoints, theme.primary, '#10b981', true)}</div>
    </div>` : ''}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      ${payMix.length ? `
      <div class="card">
        <div class="card-head"><span class="card-title">Payment mix</span><span class="card-sub">by revenue</span></div>
        <div class="card-body">
          ${payMix.map((p, i) => hBar(String(p.method), Number(p.amount), payTotal, PMCOLORS[i % PMCOLORS.length])).join('')}
        </div>
      </div>` : ''}

      ${cats.length ? `
      <div class="card">
        <div class="card-head"><span class="card-title">Revenue by category</span></div>
        <div class="card-body">
          ${cats.map((c, i) => hBar(String(c.category), Number(c.revenue), kpis.revenue ?? 1, PMCOLORS[i % PMCOLORS.length])).join('')}
        </div>
      </div>` : ''}
    </div>

    ${prodRows.length ? `
    <div class="card">
      <div class="card-head">
        <span class="card-title">Top products by revenue</span>
        <span class="card-sub">${prodRows.length} products</span>
      </div>
      <div class="card-body" style="padding:0">${buildTable(prodRows, prodCols, theme.primary)}</div>
    </div>` : ''}`;
}

// ── Inventory Valuation ───────────────────────────────────────────────────────

function buildInventoryHTML(data: Record<string, unknown>, theme: typeof THEME[string]): string {
  const products = (data.products ?? []) as Array<Record<string, unknown>>;
  const catTotals = (data.category_subtotals ?? []) as Array<Record<string, unknown>>;
  const totals = (data.totals ?? {}) as Record<string, number>;

  const grandRetail = totals.retail_value ?? 1;

  const kpiRow = [
    kpiCard('Total SKUs',     fmtN(totals.sku_count),     'active products',                    theme.primary),
    kpiCard('Retail Value',   fmtTZS(totals.retail_value), 'at current selling price',           '#6366f1'),
    kpiCard('Cost Value',     fmtTZS(totals.cost_value),   'at current cost price',              '#f59e0b'),
    kpiCard('Gross Margin',   fmtPct(totals.margin_pct),   'retail − cost ÷ retail',             '#10b981'),
  ].join('');

  const catPoints: BarPoint[] = catTotals.map(c => ({
    label: String(c.category ?? '').split(' ')[0] ?? '',
    value: Number(c.retail_value ?? 0),
    value2: Number(c.cost_value ?? 0),
  }));

  const PMCOLORS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#14b8a6'];

  const catCols: ColDef[] = [
    { head: 'Category',      key: 'category' },
    { head: 'SKUs',          key: 'sku_count',    align: 'right', fmt: (v) => fmtN(v as number) },
    { head: 'Cost Value',    key: 'cost_value',   align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Retail Value',  key: 'retail_value', align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Margin',        key: 'margin_pct',   align: 'right', fmt: (v) => fmtPct(v as number) },
  ];

  const prodCols: ColDef[] = [
    { head: 'Product',       key: 'name' },
    { head: 'SKU',           key: 'sku',          fmt: (v) => `<span style="font-family:monospace;font-size:11px;color:#6b7280">${v}</span>` },
    { head: 'Category',      key: 'category' },
    { head: 'Stock',         key: 'stock',        align: 'right', fmt: (v) => fmtN(v as number) },
    { head: 'Unit Cost',     key: 'unit_cost',    align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Unit Price',    key: 'unit_price',   align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Cost Value',    key: 'cost_value',   align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Retail Value',  key: 'retail_value', align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Margin',        key: 'margin_pct',   align: 'right', fmt: (v) => fmtPct(v as number) },
  ];

  return `
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">${kpiRow}</div>

    ${catTotals.length ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div class="card">
        <div class="card-head"><span class="card-title">Retail value by category</span></div>
        <div class="card-body">${svgBarChart(catPoints, theme.primary, '#f59e0b', true)}</div>
        <div class="card-body" style="padding-top:0">
          <div class="legend">
            <div class="legend-item"><div class="legend-dot" style="background:${theme.primary}"></div> Retail value</div>
            <div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div> Cost value</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><span class="card-title">Share of retail value</span></div>
        <div class="card-body">
          ${catTotals.map((c, i) => hBar(String(c.category), Number(c.retail_value), grandRetail, PMCOLORS[i % PMCOLORS.length])).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-head"><span class="card-title">Category subtotals</span></div>
      <div class="card-body" style="padding:0">${buildTable(catTotals as Record<string, unknown>[], catCols, theme.primary)}</div>
    </div>` : ''}

    <div class="card">
      <div class="card-head">
        <span class="card-title">Full product list</span>
        <span class="card-sub">${products.length} products</span>
      </div>
      <div class="card-body" style="padding:0">${buildTable(products as Record<string, unknown>[], prodCols, theme.primary)}</div>
    </div>`;
}

// ── Tax Statement ─────────────────────────────────────────────────────────────

function buildTaxHTML(data: Record<string, unknown>, theme: typeof THEME[string]): string {
  const summary = (data.summary ?? {}) as Record<string, number>;
  const daily   = (data.daily   ?? []) as Array<Record<string, unknown>>;
  const vatRate = Number(data.vat_rate ?? 0.18) * 100;
  const note    = String(data.note ?? '');

  const kpiRow = [
    kpiCard('Gross Sales',    fmtTZS(summary.gross_sales),        `${summary.taxable_transactions ?? 0} paid transactions`, theme.primary),
    kpiCard('VAT Collected',  fmtTZS(summary.tax_collected),      `at ${vatRate.toFixed(0)}% TRA rate`,                      '#ef4444'),
    kpiCard('Net Sales',      fmtTZS(summary.net_sales_excl_tax), 'excl. VAT (taxable base)',                                '#6366f1'),
    kpiCard('Refunds',        fmtTZS(summary.refunds),            'credited back',                                           '#9ca3af'),
  ].join('');

  const taxPoints: BarPoint[] = daily.filter(d => Number(d.gross_sales) > 0).map(d => ({
    label: String(d.label ?? ''),
    value: Number(d.tax_collected ?? 0),
  }));

  const grossPoints: BarPoint[] = daily.filter(d => Number(d.gross_sales) > 0).map(d => ({
    label: String(d.label ?? ''),
    value: Number(d.gross_sales ?? 0),
  }));

  const dailyCols: ColDef[] = [
    { head: 'Date',         key: 'date',          fmt: (v) => `<span style="font-family:monospace;font-size:11px">${v}</span>` },
    { head: 'Gross Sales',  key: 'gross_sales',   align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'VAT (18%)',    key: 'tax_collected', align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Net (excl VAT)',key:'net_sales',     align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Refunds',      key: 'refunds',       align: 'right', fmt: (v) => fmtTZS(v as number) },
  ];
  const dailyRows = daily.filter(d => Number(d.gross_sales) > 0) as Record<string, unknown>[];

  return `
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">${kpiRow}</div>

    ${note ? `<div class="info-box"><strong>⚠ TRA Note:</strong> ${note}</div>` : ''}

    ${grossPoints.length > 1 ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div class="card">
        <div class="card-head"><span class="card-title">Daily gross sales</span></div>
        <div class="card-body">${svgBarChart(grossPoints, theme.primary)}</div>
      </div>
      <div class="card">
        <div class="card-head"><span class="card-title">Daily VAT collected</span></div>
        <div class="card-body">${svgBarChart(taxPoints, '#ef4444')}</div>
      </div>
    </div>` : ''}

    ${dailyRows.length ? `
    <div class="card">
      <div class="card-head">
        <span class="card-title">Day-by-day breakdown</span>
        <span class="card-sub">${dailyRows.length} days with transactions</span>
      </div>
      <div class="card-body" style="padding:0">${buildTable(dailyRows, dailyCols, theme.primary)}</div>
    </div>` : ''}`;
}

// ── Credit Aged Debtors ───────────────────────────────────────────────────────

function buildCreditHTML(data: Record<string, unknown>, theme: typeof THEME[string]): string {
  const customers   = (data.customers    ?? []) as Array<Record<string, unknown>>;
  const agingSummary= (data.aging_summary ?? []) as Array<Record<string, unknown>>;
  const totals      = (data.totals       ?? {}) as Record<string, number>;

  const grand = totals.total ?? 1;

  const BUCKET_COLORS: Record<string, string> = {
    current: '#10b981', '1_7d': '#f59e0b', '8_30d': '#fb923c', '31_60d': '#ef4444', '60plus': '#7c3aed',
  };

  const kpiRow = [
    kpiCard('Total Outstanding', fmtTZS(totals.total),          `${totals.customer_count ?? 0} customers`, theme.primary),
    kpiCard('Current (not due)', fmtTZS(agingSummary.find(a => a.bucket === 'current')?.amount as number), 'not yet due', '#10b981'),
    kpiCard('Overdue',           String(totals.overdue_count ?? 0) + ' customers', 'require follow-up', '#ef4444'),
    kpiCard('60+ Days',          fmtTZS(agingSummary.find(a => a.bucket === '60plus')?.amount as number), 'critical overdue', '#7c3aed'),
  ].join('');

  const agingPoints: BarPoint[] = agingSummary.map(a => ({
    label: String(a.label ?? a.bucket ?? '').replace(' days overdue','').replace(' (not yet due)',''),
    value: Number(a.amount ?? 0),
  }));

  const custCols: ColDef[] = [
    { head: '#',         key: '__rank',    align: 'center', width: '32px' },
    { head: 'Customer',  key: 'name' },
    { head: 'Phone',     key: 'phone',     fmt: (v) => `<span style="font-family:monospace;font-size:11px">${v || '—'}</span>` },
    { head: 'Total Owed',key: 'total_balance', align: 'right', fmt: (v) => fmtTZS(v as number) },
    { head: 'Current',   key: 'current',   align: 'right', fmt: (v) => Number(v) > 0 ? `<span style="color:#10b981">${fmtTZS(v as number)}</span>` : '—' },
    { head: '1–7 d',     key: '1_7d',      align: 'right', fmt: (v) => Number(v) > 0 ? `<span style="color:#f59e0b">${fmtTZS(v as number)}</span>` : '—' },
    { head: '8–30 d',    key: '8_30d',     align: 'right', fmt: (v) => Number(v) > 0 ? `<span style="color:#fb923c">${fmtTZS(v as number)}</span>` : '—' },
    { head: '31–60 d',   key: '31_60d',    align: 'right', fmt: (v) => Number(v) > 0 ? `<span style="color:#ef4444">${fmtTZS(v as number)}</span>` : '—' },
    { head: '60+ d',     key: '60plus',    align: 'right', fmt: (v) => Number(v) > 0 ? `<span style="color:#7c3aed;font-weight:600">${fmtTZS(v as number)}</span>` : '—' },
  ];
  const custRows = customers.map((c, i) => ({ ...c, __rank: i + 1 })) as Record<string, unknown>[];

  return `
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">${kpiRow}</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div class="card">
        <div class="card-head"><span class="card-title">Outstanding by aging bucket</span></div>
        <div class="card-body">${svgBarChart(agingPoints, theme.primary)}</div>
      </div>
      <div class="card">
        <div class="card-head"><span class="card-title">Aging breakdown</span><span class="card-sub">share of total</span></div>
        <div class="card-body">
          ${agingSummary.map(a => hBar(
            String(a.label ?? a.bucket),
            Number(a.amount),
            grand,
            BUCKET_COLORS[String(a.bucket)] ?? '#6b7280',
          )).join('')}
          <div style="border-top:1px solid #f3f4f6;margin-top:12px;padding-top:10px;display:flex;justify-content:space-between;font-size:12px;font-weight:600">
            <span>Grand Total</span><span>${fmtTZS(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>

    ${custRows.length ? `
    <div class="card">
      <div class="card-head">
        <span class="card-title">Customer aging detail</span>
        <span class="card-sub">${custRows.length} customers with open credit</span>
      </div>
      <div class="card-body" style="padding:0">${buildTable(custRows, custCols, theme.primary)}</div>
    </div>` : ''}`;
}

// ── Main entry point ──────────────────────────────────────────────────────────

export function openReportPrintWindow(
  reportType: string,
  data: Record<string, unknown>,
  meta: ReportMeta,
  logoUrl: string,
): void {
  const theme = THEME[reportType] ?? THEME.sales;
  let body = '';

  if (reportType === 'sales')     body = buildSalesHTML(data, meta, theme, logoUrl);
  else if (reportType === 'inventory') body = buildInventoryHTML(data, theme);
  else if (reportType === 'tax')   body = buildTaxHTML(data, theme);
  else if (reportType === 'credit') body = buildCreditHTML(data, theme);
  else {
    // Generic fallback
    body = `<pre style="font-size:11px;white-space:pre-wrap;word-break:break-all">${JSON.stringify(data, null, 2)}</pre>`;
  }

  const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${theme.label} — ${meta.period_label}</title>
<style>${baseCSS(theme.primary)}</style>
</head><body>
<div class="page">
  ${reportHeader(meta, theme, logoUrl)}
  ${body}
  ${reportFooter()}
</div>
</body></html>`;

  const w = window.open('', '_blank', 'width=960,height=720,scrollbars=yes');
  if (!w) { alert('Pop-up blocked. Please allow pop-ups for this site.'); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 600);
}
