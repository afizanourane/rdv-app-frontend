export function extractData(r) {
  const d = r?.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (d.results && Array.isArray(d.results)) return d.results;
  return [];
}
export function formatDate(s) {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }); }
  catch { return s; }
}
export function formatHeure(s) { return s ? s.substring(0, 5) : '—'; }
export function formatMontant(m) { return new Intl.NumberFormat('fr-FR').format(Number(m)) + ' FCFA'; }
