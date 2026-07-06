import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { Mail, ArrowLeft, CalendarCheck, CheckCircle } from 'lucide-react';
import { demanderReset } from '../api/auth';
import toast from 'react-hot-toast';

export default function MotDePasseOubliePage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [envoye,  setEnvoye]  = useState(false);

  const handle = async e => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Email obligatoire'); return; }
    setLoading(true);
    try {
      await demanderReset(email.trim().toLowerCase());
      setEnvoye(true);
    } catch {
      // On affiche toujours le succès pour éviter l'énumération d'emails
      setEnvoye(true);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-main)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-up">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, background: '#6366f1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>RendezVous Pro</span>
        </div>

        <div className="card card-p6">
          {!envoye ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, background: '#eef2ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Mail size={26} style={{ color: '#6366f1' }} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>
                  Mot de passe oublié ?
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
                  Entrez votre email — nous vous enverrons un lien de réinitialisation valable 1 heure.
                </p>
              </div>

              <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="input-label">Adresse email</label>
                  <div className="input-wrap">
                    <span className="input-ico"><Mail size={15} /></span>
                    <input
                      type="email"
                      className="input-field input-icon-field"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-accent btn-lg btn-full"
                  style={{ marginTop: 4 }}>
                  {loading ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Envoi en cours…
                    </>
                  ) : 'Envoyer le lien de réinitialisation'}
                </button>
              </form>
            </>
          ) : (
            /* ── État succès ─────────────────────────────────── */
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 64, height: 64, background: '#ecfdf5', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={32} style={{ color: '#10b981' }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', marginBottom: 10 }}>
                Email envoyé !
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 20 }}>
                Si <strong>{email}</strong> est associé à un compte, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: 'var(--text-3)', marginBottom: 20, textAlign: 'left' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600 }}>💡 Conseils :</p>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Vérifiez vos spams si l'email n'arrive pas</li>
                  <li>Le lien expire dans <strong>1 heure</strong></li>
                  <li>Vous ne pouvez utiliser le lien qu'une seule fois</li>
                </ul>
              </div>
              <button
                onClick={() => { setEnvoye(false); setEmail(''); }}
                style={{ fontSize: 13, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>
                Réessayer avec un autre email
              </button>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ArrowLeft size={13} />
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}