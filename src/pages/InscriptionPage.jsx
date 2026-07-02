import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, CalendarCheck } from 'lucide-react';
import { inscrire } from '../api/auth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import './LoginPage.css';

export default function InscriptionPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '', password_confirm: '', role: 'client' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await inscrire(form);
      toast.success('Compte créé ! Connectez-vous.');
      navigate('/login');
    } catch (err) {
      const d = err.response?.data;
      setErrors(d?.details || {});
      toast.error(d?.erreur || 'Erreur lors de la création');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon"><CalendarCheck size={32} /></div>
          <h1 className="login-brand-name">RendezVous</h1>
        </div>
        <div className="login-hero">
          <h2>Rejoignez notre plateforme</h2>
          <p>Créez votre compte en quelques secondes et commencez à gérer vos rendez-vous dès aujourd'hui.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card animate-fadeIn">
          <div className="login-card-header">
            <h2>Créer un compte</h2>
            <p>Remplissez le formulaire ci-dessous</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="Prénom" icon={User} placeholder="Jean" value={form.prenom} onChange={set('prenom')} error={errors.prenom?.[0]} />
              <Input label="Nom"    icon={User} placeholder="Dupont" value={form.nom} onChange={set('nom')} error={errors.nom?.[0]} />
            </div>
            <Input label="Email"     type="email" icon={Mail}  placeholder="jean@exemple.com" value={form.email}     onChange={set('email')}     error={errors.email?.[0]} />
            <Input label="Téléphone" type="tel"   icon={Phone} placeholder="+237 6XX XXX XXX"  value={form.telephone} onChange={set('telephone')} error={errors.telephone?.[0]} />
            <div className="input-group">
              <label className="input-label">Rôle</label>
              <select className="modal-select" value={form.role} onChange={set('role')}>
                <option value="client">Client</option>
                <option value="personnel">Personnel</option>
              </select>
            </div>
            <Input label="Mot de passe"   type="password" icon={Lock} placeholder="Min. 8 caractères" value={form.password}         onChange={set('password')}         error={errors.password?.[0]} />
            <Input label="Confirmer MDP"  type="password" icon={Lock} placeholder="••••••••"            value={form.password_confirm} onChange={set('password_confirm')} />
            <Button type="submit" fullWidth loading={loading} size="lg">Créer mon compte</Button>
          </form>
          <p className="login-register">Déjà un compte ? <Link to="/login" className="login-register-link">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}
