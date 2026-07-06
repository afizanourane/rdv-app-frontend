import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { getNotifications, marquerLue, marquerToutesLues } from '../api/notifications';
import { extractData, formatDate } from '../utils/helpers';
import { Btn, Spinner, Empty, Card, PageHeader } from '../components/common/UI';
import toast from 'react-hot-toast';

const TYPE = {
  rendezvous: { bg:'var(--primary-50)',  color:'var(--primary)', emoji:'📅', label:'RDV' },
  paiement:   { bg:'#ecfdf5',            color:'#10b981',        emoji:'💳', label:'Paiement' },
  systeme:    { bg:'var(--bg-hover)',     color:'var(--text-3)',  emoji:'🔔', label:'Système' },
};

export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [nb,      setNb]      = useState(0);

  const fetch = async () => {
    setLoading(true);
    try { const r = await getNotifications(); setNotifs(r.data.notifications||[]); setNb(r.data.non_lues||0); }
    catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleLire = async id => {
    await marquerLue(id);
    setNotifs(n => n.map(x => x.id===id?{...x,est_lue:true}:x));
    setNb(n => Math.max(0,n-1));
  };

  const handleToutLire = async () => {
    await marquerToutesLues();
    setNotifs(n => n.map(x=>({...x,est_lue:true}))); setNb(0);
    toast.success('Toutes les notifications lues');
  };

  if (loading) return <Spinner text="Chargement…" />;

  return (
    <div className="fade-up">
      <PageHeader title="Notifications" subtitle={`${nb} non lue${nb>1?'s':''}`}
        action={nb>0 && <Btn icon={CheckCheck} variant="secondary" onClick={handleToutLire}>Tout marquer lu</Btn>}
      />
      <Card padding="card-p0" style={{ padding:0 }}>
        {notifs.length === 0 ? (
          <Empty icon={Bell} title="Aucune notification" desc="Vous n'avez aucune notification." />
        ) : notifs.map((n, i) => {
          const t = TYPE[n.type_notification] || TYPE.systeme;
          return (
            <div key={n.id} style={{
              display:'flex', alignItems:'flex-start', gap:14,
              padding:'16px 20px',
              borderBottom: i<notifs.length-1 ? '1px solid var(--border)' : 'none',
              background: n.est_lue ? 'transparent' : 'rgba(16,185,129,.03)',
              transition:'background .15s',
            }}>
              <div style={{ width:40, height:40, borderRadius:12, background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {t.emoji}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:4, flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {!n.est_lue && <span style={{ width:7, height:7, background:'var(--primary)', borderRadius:'50%', display:'inline-block' }} />}
                    <span style={{ fontSize:13.5, fontWeight:700, color:'var(--text-1)' }}>{n.titre}</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:50, background:t.bg, color:t.color }}>{t.label}</span>
                  </div>
                  <span style={{ fontSize:11, color:'var(--text-4)' }}>{formatDate(n.date_creation)}</span>
                </div>
                <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.5 }}>{n.message}</p>
              </div>
              {!n.est_lue && (
                <button onClick={() => handleLire(n.id)} style={{
                  width:28, height:28, borderRadius:8, border:'1.5px solid var(--border)',
                  color:'var(--text-4)', display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0, cursor:'pointer', background:'none', transition:'all .15s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.color='var(--primary)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-4)'; }}
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
