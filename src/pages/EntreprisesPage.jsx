import { useEffect, useState } from 'react';
import { Building2, Star, MapPin, Phone, Mail } from 'lucide-react';
import { getEntreprises } from '../api/entreprises';
import { extractData } from '../utils/helpers';
import { Spinner, Empty, Card, PageHeader } from '../components/common/UI';
import toast from 'react-hot-toast';

export default function EntreprisesPage() {
  const [entreprises, setEntreprises] = useState([]);
  const [loading,     setLoading]     = useState(true);
  useEffect(() => {
    getEntreprises().then(r => setEntreprises(extractData(r))).catch(() => toast.error('Erreur')).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner text="Chargement des entreprises…" />;
  return (
    <div className="fade-up">
      <PageHeader title="Entreprises" subtitle={`${entreprises.length} partenaire${entreprises.length>1?'s':''}`} />
      {entreprises.length === 0 ? (
        <Card><Empty icon={Building2} title="Aucune entreprise" desc="Aucune entreprise partenaire." /></Card>
      ) : (
        <div className="g3">
          {entreprises.map(e => (
            <div key={e.id} className="card card-p5" style={{ cursor:'default' }}>
              <div style={{ height:4, background:'linear-gradient(90deg,var(--primary),var(--accent))', margin:'-20px -20px 16px', borderRadius:'var(--r-lg) var(--r-lg) 0 0' }} />
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'var(--primary-50)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800 }}>
                  {e.nom_entreprise?.[0]}
                </div>
                {e.note_moyenne && (
                  <div style={{ display:'flex', alignItems:'center', gap:4, background:'#fffbeb', padding:'4px 8px', borderRadius:8 }}>
                    <Star size={12} style={{ color:'#f59e0b', fill:'#f59e0b' }} />
                    <span style={{ fontSize:12, fontWeight:700, color:'#92400e' }}>{e.note_moyenne}</span>
                  </div>
                )}
              </div>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>{e.nom_entreprise}</h3>
              <p style={{ fontSize:12, color:'var(--primary)', marginBottom:12, fontWeight:500 }}>{e.domaine_nom}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-3)' }}><MapPin size={12}/> {e.adresse}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-3)' }}><Phone size={12}/> {e.telephone}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-3)' }}><Mail size={12}/> {e.email}</div>
              </div>
              {e.description && <p style={{ fontSize:12, color:'var(--text-4)', marginTop:10, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{e.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
