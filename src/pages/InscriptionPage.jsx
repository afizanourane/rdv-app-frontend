import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, CalendarCheck, ArrowRight } from 'lucide-react';
import { inscrire } from '../api/auth';
import { Btn, Input, Card } from '../components/common/UI';
import toast from 'react-hot-toast';

export default function InscriptionPage() {
  const nav = useNavigate();
  const [form, setForm]     = useState({ nom:'', prenom:'', email:'', telephone:'', password:'', password_confirm:'', role:'client' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const handle = async e => {
    e.preventDefault(); setErrors({}); setLoading(true);
    try { await inscrire(form); toast.success('Compte créé ! Connectez-vous.'); nav('/login'); }
    catch(err) {
      const d = err.response?.data;
      setErrors(d?.details || {});
      toast.error(d?.erreur || 'Erreur lors de la création du compte');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'var(--bg-main)' }}>
      <div style={{ width:'100%', maxWidth:520 }} className="fade-up">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, justifyContent:'center' }}>
          <div style={{ width:36, height:36, background:'var(--primary)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <CalendarCheck size={18} color="#fff" />
          </div>
          <span style={{ fontSize:17, fontWeight:800, color:'var(--text-1)' }}>RendezVous Pro</span>
        </div>

        <Card padding="card-p6">
          <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-1)', marginBottom:4 }}>Créer un compte</h2>
          <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:22 }}>Rejoignez la plateforme en quelques secondes</p>

          <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Input label="Prénom" icon={User} placeholder="Jean"   value={form.prenom} onChange={set('prenom')} error={errors.prenom?.[0]} />
              <Input label="Nom"    icon={User} placeholder="Dupont" value={form.nom}    onChange={set('nom')}    error={errors.nom?.[0]} />
            </div>
            <Input label="Email" type="email" icon={Mail} placeholder="jean@exemple.com" value={form.email} onChange={set('email')} error={errors.email?.[0]} />
            <Input label="Téléphone" type="tel" icon={Phone} placeholder="+237 6XX XXX XXX" value={form.telephone} onChange={set('telephone')} error={errors.telephone?.[0]} />

            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label className="input-label">Je suis un(e)</label>
              <select className="select-field" value={form.role} onChange={set('role')}>
                <option value="client">Client — Je prends des rendez-vous</option>
                <option value="personnel">Personnel — Je gère des créneaux</option>
              </select>
            </div>

            <Input label="Mot de passe" type="password" icon={Lock} placeholder="Min. 8 car., 1 majuscule, 1 chiffre" value={form.password} onChange={set('password')} error={errors.password?.[0]} />
            <Input label="Confirmer le mot de passe" type="password" icon={Lock} placeholder="••••••••" value={form.password_confirm} onChange={set('password_confirm')} />

            <Btn type="submit" variant="primary" full size="lg" loading={loading}>
              Créer mon compte <ArrowRight size={15}/>
            </Btn>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'var(--text-3)', marginTop:18 }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Se connecter</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
