import { useState } from 'react';
import { User, Mail, Phone, Lock, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateMonProfil, changerMdp } from '../api/auth';
import { Btn, Input, Card, PageHeader, Badge } from '../components/common/UI';
import toast from 'react-hot-toast';

export default function ProfilPage() {
  const { user } = useAuth();
  const [form,  setForm]  = useState({ nom:user?.nom||'', prenom:user?.prenom||'', telephone:user?.telephone||'' });
  const [mdp,   setMdp]   = useState({ ancien:'', nouveau:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [savMdp, setSavMdp] = useState(false);
  const setF = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const setM = k => e => setMdp(m=>({...m,[k]:e.target.value}));

  const handleProfil = async e => {
    e.preventDefault(); setSaving(true);
    try { await updateMonProfil(form); toast.success('Profil mis à jour !'); }
    catch(err) { toast.error(err.response?.data?.erreur||'Erreur'); }
    finally { setSaving(false); }
  };
  const handleMdp = async e => {
    e.preventDefault();
    if (mdp.nouveau !== mdp.confirm) { toast.error('Les mots de passe ne correspondent pas'); return; }
    setSavMdp(true);
    try {
      await changerMdp({ ancien_mot_de_passe:mdp.ancien, nouveau_mot_de_passe:mdp.nouveau, confirmation:mdp.confirm });
      toast.success('Mot de passe changé ! Reconnectez-vous.');
      setMdp({ ancien:'', nouveau:'', confirm:'' });
    } catch(err) { toast.error(err.response?.data?.erreur||'Erreur'); }
    finally { setSavMdp(false); }
  };

  const initials = user ? `${user.prenom?.[0]||''}${user.nom?.[0]||''}`.toUpperCase() : '?';

  return (
    <div className="fade-up">
      <PageHeader title="Mon profil" subtitle="Gérez vos informations personnelles" />
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20 }}>
        {/* Carte profil */}
        <Card padding="card-p6">
          <div style={{ textAlign:'center' }}>
            <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,var(--primary),var(--accent))', color:'#fff', fontSize:28, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              {initials}
            </div>
            <h3 style={{ fontSize:17, fontWeight:700, color:'var(--text-1)' }}>{user?.prenom} {user?.nom}</h3>
            <p style={{ fontSize:13, color:'var(--text-3)', margin:'4px 0 12px' }}>{user?.email}</p>
            <Badge statut={user?.role} />
          </div>
          <div style={{ marginTop:24, borderTop:'1px solid var(--border)', paddingTop:16 }}>
            {[
              { icon:Mail,  label:'Email',     val:user?.email },
              { icon:Phone, label:'Téléphone', val:user?.telephone||'—' },
              { icon:Shield,label:'Rôle',      val:user?.role },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <r.icon size={14} style={{ color:'var(--text-4)', flexShrink:0 }} />
                <div>
                  <p style={{ fontSize:10, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'.06em' }}>{r.label}</p>
                  <p style={{ fontSize:13, fontWeight:500, color:'var(--text-1)', textTransform:'capitalize' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Formulaires */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <Card padding="card-p6">
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
              <User size={16} style={{ color:'var(--primary)' }} /> Informations personnelles
            </h3>
            <form onSubmit={handleProfil} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Input label="Prénom" icon={User} value={form.prenom} onChange={setF('prenom')} />
                <Input label="Nom"    icon={User} value={form.nom}    onChange={setF('nom')} />
              </div>
              <Input label="Téléphone" icon={Phone} type="tel" value={form.telephone} onChange={setF('telephone')} />
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <Btn type="submit" icon={Save} loading={saving}>Sauvegarder</Btn>
              </div>
            </form>
          </Card>

          <Card padding="card-p6">
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
              <Lock size={16} style={{ color:'var(--primary)' }} /> Changer le mot de passe
            </h3>
            <form onSubmit={handleMdp} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Input label="Mot de passe actuel"   type="password" icon={Lock} value={mdp.ancien}  onChange={setM('ancien')}  placeholder="••••••••" />
              <Input label="Nouveau mot de passe"  type="password" icon={Lock} value={mdp.nouveau} onChange={setM('nouveau')} placeholder="Min. 8 caractères" hint="1 majuscule, 1 chiffre, 1 caractère spécial" />
              <Input label="Confirmer"             type="password" icon={Lock} value={mdp.confirm} onChange={setM('confirm')} placeholder="••••••••" />
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <Btn type="submit" icon={Lock} loading={savMdp}>Changer le mot de passe</Btn>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
