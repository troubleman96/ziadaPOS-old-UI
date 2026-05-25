export const fmt = (n: number) => 'TZS ' + Math.abs(n).toLocaleString('en-US');

export const fmtShort = (n: number): string => {
  const abs = Math.abs(n);
  if (abs >= 1e9) return 'TZS ' + (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return 'TZS ' + (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return 'TZS ' + (n / 1e3).toFixed(1) + 'K';
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
};

export const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtDT = (d: Date) =>
  d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) +
  ' · ' + fmtTime(d);

function seeded(s: number) {
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
}
export { seeded };
