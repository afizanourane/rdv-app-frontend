import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CalendarCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input, Btn } from '../components/common/UI';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm]     = useState({ email:'', password:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const handle = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.email)    errs.email    = 'Email requis';
    if (!form.password) errs.password = 'Mot de passe requis';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const u = await login(form.email.trim().toLowerCase(), form.password);
      toast.success(`Bienvenue, ${u.prenom} !`);
      nav('/dashboard');
    } catch(err) {
      const d = err.response?.data;
      const msg = d?.detail || d?.erreur || d?.non_field_errors?.[0] || 'Identifiants incorrects';
      toast.error(msg); setErrors({ general: msg });
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Gauche */}
      <div className="auth-left">
        <div style={{ position:'absolute', top:'-10%', right:'-10%', width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,.06)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-10%', left:'-10%', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }} />
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, background:'rgba(255,255,255,.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
            <CalendarCheck size={22} color="#fff" />
          </div>
          <span style={{ fontSize:20, fontWeight:800, color:'#fff' }}>RendezVous Pro</span>
        </div>
        <div style={{ position:'relative' }}>
          <h2 style={{ fontSize:40, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:16 }}>
            Gérez vos rendez-vous simplement.
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.75)', lineHeight:1.7, marginBottom:32 }}>
            Plateforme complète pour clients, personnel et administrateurs.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {['Confirmation instantanée par email','Paiements Mobile Money & Carte','Notifications temps réel','Sécurité JWT enterprise'].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:22, height:22, borderRadius:6, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ color:'#fff', fontSize:12 }}>✓</span>
                </div>
                <span style={{ fontSize:14, color:'rgba(255,255,255,.85)', fontWeight:500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ position:'relative', fontSize:12, color:'rgba(255,255,255,.4)' }}>
          © {new Date().getFullYear()} RendezVous Pro. Tous les droits réservés.
        </p>
      </div>

      {/* Droite */}
      <div className="auth-right">
        <div className="auth-card fade-up">
          <h2 style={{ fontSize:26, fontWeight:800, color:'var(--text-1)', marginBottom:6 }}>Bon retour 👋</h2>
          <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:28 }}>Connectez-vous à votre espace</p>

          <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Input label="Adresse email" type="email" icon={Mail} placeholder="vous@exemple.com"
              value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />

            <div style={{ position:'relative' }}>
              <Input label="Mot de passe" type={showPwd?'text':'password'} icon={Lock}
                placeholder="••••••••" value={form.password} onChange={set('password')}
                error={errors.password} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPwd(s=>!s)}
                style={{ position:'absolute', right:12, top:32, background:'none', border:'none', color:'var(--text-4)', cursor:'pointer', display:'flex', padding:2 }}>
                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>

            {errors.general && (
              <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#ef4444', textAlign:'center' }}>
                {errors.general}
              </div>
            )}

            {/* Juste après le champ password, avant le bouton submit */}
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <Link to="/mot-de-passe-oublie"
                style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                Mot de passe oublié ?
              </Link>
            </div>

            <Btn type="submit" variant="primary" full size="lg" loading={loading}>
              Se connecter <ArrowRight size={15}/>
            </Btn>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'var(--text-3)', marginTop:20 }}>
            Pas de compte ?{' '}
            <Link to="/inscription" style={{ color:'var(--primary)', fontWeight:600 }}>Créer un compte</Link>
          </p>
          <p style={{ textAlign:'center', marginTop:10 }}>
            <Link to="/" style={{ fontSize:12, color:'var(--text-4)' }}>← Retour à l'accueil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
