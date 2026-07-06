import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Calendar, CreditCard,
  Users, CheckCircle, RefreshCw, BarChart2,
} from 'lucide-react';
import { getStatsAvancees } from '../api/statistiques';
import { Spinner }          from '../components/common/UI';
import { formatMontant }    from '../utils/helpers';
import toast from 'react-hot-toast';

// ── Tooltip personnalisé ──────────────────────────────────────
const TooltipCustom = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 12 }}>
      <p style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-2)' }}>{p.name} : </span>
          <span style={{ fontWeight: 600 }}>{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon: Icon, color, evolution }) {
  const isUp = evolution >= 0;
  return (
    <div className="card card-p5" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4 }}>{title}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '22', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} />
        </div>
      </div>
      {evolution !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: isUp ? '#10b981' : '#ef4444' }}>
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {isUp ? '+' : ''}{evolution}% vs mois précédent
        </div>
      )}
    </div>
  );
}

// ── Titre section ─────────────────────────────────────────────
function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{title}</h3>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

export default function StatistiquesPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    getStatsAvancees()
      .then(r => setData(r.data))
      .catch(() => toast.error('Erreur chargement statistiques'))
      .finally(() => setLoading(false));
  }, [refresh]);

  if (loading) return <Spinner text="Chargement des statistiques…" />;
  if (!data)   return null;

  const { kpis, rdv_par_mois, revenus_par_mois, repartition_statuts, modes_paiement, top_entreprises, rdv_semaine } = data;

  // Fusionner RDV et revenus par mois pour le graphique combiné
  const combineMois = rdv_par_mois.map(r => {
    const rev = revenus_par_mois.find(v => v.mois_iso === r.mois_iso);
    return { ...r, revenus: rev?.total || 0 };
  });

  return (
    <div className="fade-up">

      {/* En-tête */}
      <div className="page-hdr" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Statistiques</h1>
          <p className="page-sub">Tableau de bord analytique — 12 derniers mois</p>
        </div>
        <div className="page-acts">
          <button onClick={() => setRefresh(r => r + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="g4" style={{ marginBottom: 28 }}>
        <KpiCard title="Total RDV"           value={kpis.total_rdv}                          icon={Calendar}    color="#6366f1" sub={`${kpis.rdv_ce_mois} ce mois`}       evolution={kpis.evolution_rdv} />
        <KpiCard title="Revenus totaux"      value={formatMontant(kpis.total_revenus)}        icon={CreditCard}  color="#10b981" sub={`${formatMontant(kpis.revenus_ce_mois)} ce mois`} />
        <KpiCard title="Clients inscrits"    value={kpis.total_clients}                       icon={Users}       color="#f59e0b" sub={`+${kpis.clients_ce_mois} ce mois`} />
        <KpiCard title="Taux de confirmation" value={`${kpis.taux_confirmation}%`}            icon={CheckCircle} color="#10b981" sub="RDV confirmés ou terminés" />
      </div>

      {/* ── RDV des 7 derniers jours ─────────────────────────── */}
      <div className="card card-p6" style={{ marginBottom: 20 }}>
        <SectionTitle title="Activité de la semaine" sub="Rendez-vous créés ces 7 derniers jours" />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={rdv_semaine} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="jour" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<TooltipCustom />} />
            <Bar dataKey="count" name="RDV" fill="#6366f1" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Evolution RDV + Revenus ───────────────────────────── */}
      <div className="card card-p6" style={{ marginBottom: 20 }}>
        <SectionTitle title="Évolution sur 12 mois" sub="Rendez-vous créés et revenus par mois" />
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={combineMois} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRdv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="rdv"  tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis yAxisId="rev"  orientation="right" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<TooltipCustom formatter={v => typeof v === 'number' && v > 1000 ? formatMontant(v) : v} />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Area yAxisId="rdv" type="monotone" dataKey="total"   name="RDV"     stroke="#6366f1" strokeWidth={2} fill="url(#gradRdv)" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
            <Area yAxisId="rev" type="monotone" dataKey="revenus" name="Revenus" stroke="#10b981" strokeWidth={2} fill="url(#gradRev)" dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Ligne 3 : Pie charts ──────────────────────────────── */}
      <div className="g2" style={{ marginBottom: 20 }}>

        {/* Répartition des statuts */}
        <div className="card card-p6">
          <SectionTitle title="Répartition des RDV" sub="Par statut" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={repartition_statuts}
                dataKey="count"
                nameKey="label"
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {repartition_statuts.map((e, i) => (
                  <Cell key={i} fill={e.couleur} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<TooltipCustom />} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value, entry) => (
                  <span style={{ color: 'var(--text-2)' }}>
                    {value} ({entry.payload.count})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Modes de paiement */}
        <div className="card card-p6">
          <SectionTitle title="Modes de paiement" sub="Paiements confirmés" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={modes_paiement}
                dataKey="count"
                nameKey="label"
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {modes_paiement.map((e, i) => (
                  <Cell key={i} fill={e.couleur} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<TooltipCustom formatter={v => `${v} paiements`} />} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value, entry) => (
                  <span style={{ color: 'var(--text-2)' }}>
                    {value} ({entry.payload.count})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top entreprises ───────────────────────────────────── */}
      <div className="card card-p6" style={{ marginBottom: 20 }}>
        <SectionTitle title="Top 5 entreprises" sub="Par nombre de rendez-vous" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={top_entreprises}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="nom" tick={{ fontSize: 11, fill: 'var(--text-2)', fontWeight: 500 }} axisLine={false} tickLine={false} width={130} />
            <Tooltip content={<TooltipCustom />} />
            <Bar dataKey="count" name="RDV" fill="#10b981" radius={[0,6,6,0]}>
              {top_entreprises.map((_, i) => (
                <Cell key={i} fill={`hsl(${160 + i * 20}, 65%, ${45 + i * 4}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Détail RDV par mois ───────────────────────────────── */}
      <div className="card card-p6">
        <SectionTitle title="Détail RDV par mois" sub="Confirmés, refusés, annulés, terminés" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rdv_par_mois} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 10, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-4)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<TooltipCustom />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Bar dataKey="confirmes" name="Confirmés" stackId="a" fill="#10b981" />
            <Bar dataKey="termines"  name="Terminés"  stackId="a" fill="#6366f1" />
            <Bar dataKey="refuses"   name="Refusés"   stackId="a" fill="#ef4444" />
            <Bar dataKey="annules"   name="Annulés"   stackId="a" fill="#94a3b8" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}