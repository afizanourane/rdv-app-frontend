import { useState } from 'react';
import { User, Mail, Phone, Lock, Save, Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateMonProfil, changerMdp } from '../api/auth';
import { Btn, Input, Card, PageHeader, Badge } from '../components/common/UI';
import toast from 'react-hot-toast';


import { activer2FA } from '../api/auth';



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


  const [deux_fa, setDeuxFa] = useState(user?.deux_fa_active || false);
  const [toggling, setToggling] = useState(false);

  const handleToggle2FA = async () => {
    setToggling(true);
    try {
      const { data } = await activer2FA();
      setDeuxFa(data.deux_fa_active);
      toast.success(data.message);
    } catch { toast.error('Erreur'); }
    finally { setToggling(false); }
  };




  return (
    <div className="fade-up">
      <PageHeader title="Mon profil" subtitle="Gérez vos informations personnelles" />
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20 }}>
        {/* Carte profil */}

        
        <Card padding="card-p6">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} style={{ color: deux_fa ? '#10b981' : 'var(--text-4)' }} />
            Authentification à deux facteurs (2FA)
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>
                {deux_fa ? '✅ 2FA activée' : '⚪ 2FA désactivée'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                {deux_fa
                  ? 'Un code sera envoyé par email à chaque connexion.'
                  : 'Activez pour sécuriser davantage votre compte.'
                }
              </p>
            </div>

            <Btn
              variant={deux_fa ? 'danger' : 'success'}
              icon={deux_fa ? ShieldOff : ShieldCheck}
              loading={toggling}
              onClick={handleToggle2FA}>
              {deux_fa ? 'Désactiver' : 'Activer'}
            </Btn>
          </div>

          {deux_fa && (
            <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--text-2)' }}>
              🔐 À chaque connexion, vous recevrez un code à 6 chiffres valable 10 minutes sur <strong>{user?.email}</strong>.
            </div>
          )}
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
