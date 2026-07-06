import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, CreditCard, Users, ArrowRight, BarChart2, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getRdvs, getDashboard } from '../api/rendezvous';
import { getStatistiques } from '../api/auth';
import { extractData, formatDate } from '../utils/helpers';
import { StatCard, Card, Badge, Spinner, PageHeader } from '../components/common/UI';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const nav = useNavigate();
  const [rdvs,    setRdvs]    = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const rdvRes = await getRdvs();
        setRdvs(extractData(rdvRes));
        if (isAdmin) {
          try {
            const [dashRes, statRes] = await Promise.all([getDashboard(), getStatistiques()]);
            setStats({ rdv: dashRes.data, users: statRes.data?.utilisateurs });
          } catch {}
        }
      } catch { toast.error('Erreur de chargement'); }
      finally { setLoading(false); }
    };
    load();
  }, [isAdmin]);

  if (loading) return <Spinner text="Chargement du tableau de bord…" />;

  const enAttente = rdvs.filter(r => r.statut === 'en_attente').length;
  const confirmes = rdvs.filter(r => r.statut === 'confirme').length;
  const termines  = rdvs.filter(r => r.statut === 'termine').length;
  const recents   = [...rdvs].sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)).slice(0, 7);

  const ACTIONS = [
    { label:'Prendre un RDV',   icon:Calendar,    to:'/rendezvous',    color:'si-green' },
    { label:'Créneaux dispo.',  icon:Clock,        to:'/creneaux',      color:'si-blue' },
    { label:'Mes paiements',    icon:CreditCard,   to:'/paiements',     color:'si-orange' },
    { label:'Notifications',    icon:AlertCircle,  to:'/notifications', color:'si-purple' },
  ];

  return (
    <div className="fade-up">
      <PageHeader
        title={`Bonjour, ${user?.prenom} 👋`}
        subtitle={new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
      />

      {/* Stats principales */}
      <div className="g4" style={{ marginBottom:24 }}>
        <div className="d1 fade-up"><StatCard title="Total RDV"   value={rdvs.length} icon={Calendar}    color="si-green"  sub="Tous statuts" /></div>
        <div className="d2 fade-up"><StatCard title="En attente"  value={enAttente}   icon={AlertCircle} color="si-orange" sub="À confirmer"  /></div>
        <div className="d3 fade-up"><StatCard title="Confirmés"   value={confirmes}   icon={CheckCircle} color="si-blue"   sub="Validés"      /></div>
        <div className="d4 fade-up"><StatCard title="Terminés"    value={termines}    icon={TrendingUp}  color="si-indigo" sub="Complétés"    /></div>
      </div>

      {/* Stats admin */}
      {isAdmin && stats?.users && (
        <div className="g3" style={{ marginBottom:24 }}>
          <StatCard title="Clients"   value={stats.users.client    || 0} icon={Users} color="si-green"  />
          <StatCard title="Personnel" value={stats.users.personnel || 0} icon={Users} color="si-purple" />
          <StatCard title="Admins"    value={stats.users.admin     || 0} icon={Users} color="si-indigo" />
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20 }}>

        {/* RDV récents */}
        <Card padding="card-p6">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'var(--primary-50)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Activity size={18} />
              </div>
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-1)' }}>Rendez-vous récents</h3>
                <p style={{ fontSize:12, color:'var(--text-4)' }}>{rdvs.length} au total</p>
              </div>
            </div>
            <button onClick={() => nav('/rendezvous')} style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--primary)', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Voir tout <ArrowRight size={13} />
            </button>
          </div>

          {recents.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-4)', fontSize:14 }}>
              <Calendar size={32} style={{ margin:'0 auto 12px', opacity:.3 }} />
              <p>Aucun rendez-vous pour l'instant</p>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['#','Client','Date','Statut'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recents.map((rdv, i) => (
                  <tr key={rdv.id} style={{ borderBottom: i < recents.length-1 ? '1px solid var(--border)' : 'none', transition:'background .15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding:'11px 12px', fontSize:13, fontWeight:700, color:'var(--primary)' }}>#{rdv.id}</td>
                    <td style={{ padding:'11px 12px', fontSize:13, fontWeight:500, color:'var(--text-1)' }}>{rdv.client_nom || `Client #${rdv.client}`}</td>
                    <td style={{ padding:'11px 12px', fontSize:12, color:'var(--text-3)' }}>{formatDate(rdv.date_creation)}</td>
                    <td style={{ padding:'11px 12px' }}><Badge statut={rdv.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Colonne droite */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Actions rapides */}
          <Card padding="card-p5">
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-1)', marginBottom:14 }}>Actions rapides</h3>
            {ACTIONS.map(a => (
              <button key={a.label} onClick={() => nav(a.to)}
                style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 10px', borderRadius:10, border:'none', background:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'background .15s', marginBottom:2 }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                <div className={`stat-icon ${a.color}`} style={{ width:34, height:34, borderRadius:9 }}>
                  <a.icon size={16} />
                </div>
                <span style={{ fontSize:13, fontWeight:500, color:'var(--text-2)', flex:1, textAlign:'left' }}>{a.label}</span>
                <ArrowRight size={13} style={{ color:'var(--text-4)' }} />
              </button>
            ))}
          </Card>

          {/* Répartition RDV admin */}
          {isAdmin && stats?.rdv && (
            <Card padding="card-p5">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <BarChart2 size={16} style={{ color:'var(--primary)' }} />
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-1)' }}>Répartition RDV</h3>
              </div>
              {['en_attente','confirme','refuse','annule','termine'].map(s => {
                const count = stats.rdv[s] || 0;
                const total = stats.rdv.total || 1;
                const pct   = Math.round((count/total)*100);
                return (
                  <div key={s} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                      <Badge statut={s} />
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text-1)' }}>{count}</span>
                    </div>
                    <div style={{ height:5, background:'var(--bg-hover)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:'var(--primary)', borderRadius:3, transition:'width .7s ease' }} />
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
