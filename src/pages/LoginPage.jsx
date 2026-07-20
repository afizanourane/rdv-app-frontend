import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CalendarCheck, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { verifierOtp } from '../api/auth';
import { Input, Btn } from '../components/common/UI';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // État 2FA
  const [etape2FA, setEtape2FA] = useState(false);
  const [userId,   setUserId]   = useState(null);
  const [emailMasque, setEmailMasque] = useState('');
  const [otp,      setOtp]      = useState('');
  const [loadOtp,  setLoadOtp]  = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // ── Étape 1 : Login ──────────────────────────────────────
  const handleLogin = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.email)    errs.email    = 'Email requis';
    if (!form.password) errs.password = 'Mot de passe requis';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const u = await login(form.email.trim().toLowerCase(), form.password);

      // Vérifier si 2FA requis
      if (u?.deux_fa_requis) {
        setUserId(u.user_id);
        setEmailMasque(u.email_masque);
        setEtape2FA(true);
        toast('📧 Code envoyé par email !', { icon: '🔐', duration: 4000 });
        return;
      }

      toast.success(`Bienvenue, ${u.prenom} !`);
      nav('/dashboard');
    } catch(err) {
      const data = err.response?.data;
      const msg  = data?.erreur || 'Identifiant ou mot de passe incorrect.';
      toast.error(msg, { duration: 5000 });
      setErrors({ general: msg });
    } finally { setLoading(false); }
  };

  // ── Étape 2 : Vérifier OTP ───────────────────────────────
  const handleVerifierOtp = async e => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Code à 6 chiffres requis'); return; }
    setLoadOtp(true);
    try {
      const { data } = await verifierOtp({ user_id: userId, code: otp });
      // Stocker les tokens et charger le profil
      localStorage.setItem('access_token',  data.access);
      localStorage.setItem('refresh_token', data.refresh);
      window.location.href = '/dashboard'; // Rechargement complet pour rafraîchir le contexte
    } catch(err) {
      const msg = err.response?.data?.erreur || 'Code incorrect.';
      toast.error(msg);
    } finally { setLoadOtp(false); }
  };

  // ── Rendu 2FA ─────────────────────────────────────────────
  if (etape2FA) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-main)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }} className="fade-up">

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, background: '#6366f1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>RendezVous Pro</span>
        </div>

        <div className="card card-p6">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, background: '#eef2ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Shield size={28} style={{ color: '#6366f1' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>
              Vérification en deux étapes
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.6 }}>
              Un code à 6 chiffres a été envoyé à<br />
              <strong style={{ color: 'var(--text-1)' }}>{emailMasque}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifierOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="input-label" style={{ textAlign: 'center', display: 'block' }}>
                Code de vérification
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoFocus
                style={{
                  width: '100%', padding: '14px', fontSize: 28, fontWeight: 800,
                  textAlign: 'center', letterSpacing: 14,
                  border: '2px solid var(--border)', borderRadius: 12,
                  background: 'var(--bg-input)', color: 'var(--text-1)',
                  outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
                  transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Indicateur de progression */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: otp.length > i ? '#6366f1' : 'var(--border)', transition: 'background .15s' }} />
              ))}
            </div>

            <Btn type="submit" variant="accent" full size="lg" loading={loadOtp}
              disabled={otp.length !== 6}>
              Vérifier le code
            </Btn>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 8 }}>
              ⏰ Code valable 10 minutes
            </p>
            <button
              onClick={() => { setEtape2FA(false); setOtp(''); }}
              style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>
              ← Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Rendu Login normal ────────────────────────────────────
  return (
    <div className="auth-page">
      {/* Gauche */}
      <div className="auth-left">
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <CalendarCheck size={22} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>RendezVous Pro</span>
        </div>
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Gérez vos rendez-vous simplement.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.75)', lineHeight: 1.7 }}>
            Plateforme complète pour clients, personnel et administrateurs.
          </p>
        </div>
        <p style={{ position: 'relative', fontSize: 12, color: 'rgba(255,255,255,.4)' }}>
          © {new Date().getFullYear()} RendezVous Pro.
        </p>
      </div>

      {/* Droite */}
      <div className="auth-right">
        <div className="auth-card fade-up">
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>Bon retour </h2>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 28 }}>Connectez-vous à votre espace</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Adresse email" type="email" icon={Mail}
              placeholder="vous@exemple.com" value={form.email}
              onChange={set('email')} error={errors.email} autoComplete="email" />

            <div style={{ position: 'relative' }}>
              <Input label="Mot de passe" type={showPwd ? 'text' : 'password'}
                icon={Lock} placeholder="••••••••" value={form.password}
                onChange={set('password')} error={errors.password}
                autoComplete="current-password" />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                style={{ position: 'absolute', right: 12, top: 32, background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <Link to="/mot-de-passe-oublie"
                style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                Mot de passe oublié ?
              </Link>
            </div>

            {errors.general && (
              <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', textAlign: 'center' }}>
                {errors.general}
              </div>
            )}

            <Btn type="submit" variant="primary" full size="lg" loading={loading}>
              Se connecter <ArrowRight size={15} />
            </Btn>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 20 }}>
            Pas de compte ?{' '}
            <Link to="/inscription" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Créer un compte
            </Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 10 }}>
            <Link to="/" style={{ fontSize: 12, color: 'var(--text-4)' }}>← Retour à l'accueil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}