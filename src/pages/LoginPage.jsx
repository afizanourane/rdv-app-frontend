// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, CalendarCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email requis';
    if (!form.password) e.password = 'Mot de passe requis';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Bienvenue, ${user.nom_complet} !`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Identifiants incorrects';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon"><CalendarCheck size={32} /></div>
          <h1 className="login-brand-name">RendezVous</h1>
        </div>
        <div className="login-hero">
          <h2>Gérez vos rendez-vous simplement</h2>
          <p>Plateforme professionnelle de gestion de rendez-vous pour clients, personnel et administrateurs.</p>
          <div className="login-features">
            {['Prise de RDV en ligne', 'Validation instantanée', 'Notifications automatiques', 'Paiement sécurisé'].map(f => (
              <div key={f} className="login-feature">
                <div className="login-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card animate-fadeIn">
          <div className="login-card-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace personnel</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="Adresse email"
              type="email"
              icon={Mail}
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              error={errors.email}
              autoComplete="email"
            />
            <div className="login-pwd-group">
              <Input
                label="Mot de passe"
                type={showPwd ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                error={errors.password}
                autoComplete="current-password"
              />
              <button type="button" className="login-toggle-pwd" onClick={() => setShowPwd(s => !s)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.general && <p className="login-error">{errors.general}</p>}

            <Button type="submit" fullWidth loading={loading} size="lg">
              Se connecter
            </Button>
          </form>

          <p className="login-register">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="login-register-link">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
