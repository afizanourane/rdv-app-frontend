import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CalendarCheck, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { validerToken, resetPassword } from '../api/auth';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token }  = useParams();
  const navigate   = useNavigate();

  const [etat,    setEtat]    = useState('verification'); // verification | valide | expire | succes
  const [prenom,  setPrenom]  = useState('');
  const [form,    setForm]    = useState({ nouveau: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ nouveau: false, confirm: false });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) { setEtat('expire'); return; }
    validerToken(token)
      .then(r => {
        if (r.data.valide) {
          setPrenom(r.data.prenom || '');
          setEtat('valide');
        } else {
          setEtat('expire');
        }
      })
      .catch(() => setEtat('expire'));
  }, [token]);

  // Règles de complexité
  const regles = [
    { test: v => v.length >= 8,          label: 'Au moins 8 caractères'  },
    { test: v => /[A-Z]/.test(v),        label: 'Une majuscule'           },
    { test: v => /[0-9]/.test(v),        label: 'Un chiffre'              },
    { test: v => /[^A-Za-z0-9]/.test(v), label: 'Un caractère spécial (recommandé)', optional: true },
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.nouveau)                          errs.nouveau  = 'Obligatoire';
    else if (form.nouveau.length < 8)           errs.nouveau  = 'Au moins 8 caractères';
    else if (!/[A-Z]/.test(form.nouveau))       errs.nouveau  = 'Au moins une majuscule';
    else if (!/[0-9]/.test(form.nouveau))       errs.nouveau  = 'Au moins un chiffre';
    if (form.nouveau !== form.confirm)          errs.confirm  = 'Les mots de passe ne correspondent pas';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await resetPassword({
        token:                token,
        nouveau_mot_de_passe: form.nouveau,
        confirmation:         form.confirm,
      });
      setEtat('succes');
    } catch(err) {
      const msg = err.response?.data?.erreur || 'Erreur lors de la réinitialisation';
      toast.error(msg);
      if (err.response?.data?.code === 'TOKEN_EXPIRE') setEtat('expire');
    } finally { setLoading(false); }
  };

  const CARD_STYLE = {
    width: '100%', maxWidth: 440,
  };

  const PAGE = {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 24,
    background: 'var(--bg-main)', fontFamily: 'Inter, sans-serif',
  };

  /* ── Vérification en cours ─────────────────────────────── */
  if (etat === 'verification') return (
    <div style={PAGE}>
      <div style={{ textAlign: 'center', ...CARD_STYLE }}>
        <Loader size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Vérification du lien…</p>
      </div>
    </div>
  );

  /* ── Token expiré ──────────────────────────────────────── */
  if (etat === 'expire') return (
    <div style={PAGE}>
      <div style={{ ...CARD_STYLE }} className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, justifyContent: 'center' }}>
          <div style={{ width: 34, height: 34, background: '#6366f1', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={17} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>RendezVous Pro</span>
        </div>
        <div className="card card-p6" style={{ textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, background: '#fef2f2', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertCircle size={30} style={{ color: '#ef4444' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', marginBottom: 10 }}>
            Lien invalide ou expiré
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 22 }}>
            Ce lien de réinitialisation est invalide, a expiré (durée : 1 heure) ou a déjà été utilisé.
          </p>
          <Link to="/mot-de-passe-oublie"
            className="btn btn-accent btn-md btn-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Faire une nouvelle demande
          </Link>
          <p style={{ marginTop: 16 }}>
            <Link to="/login" style={{ fontSize: 12, color: 'var(--text-4)' }}>
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  /* ── Succès ────────────────────────────────────────────── */
  if (etat === 'succes') return (
    <div style={PAGE}>
      <div style={{ ...CARD_STYLE }} className="fade-up">
        <div className="card card-p6" style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: '#ecfdf5', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={32} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', marginBottom: 10 }}>
            Mot de passe réinitialisé !
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 24 }}>
            Votre mot de passe a été mis à jour avec succès.
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary btn-lg btn-full">
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Formulaire reset ──────────────────────────────────── */
  return (
    <div style={PAGE}>
      <div style={{ ...CARD_STYLE }} className="fade-up">

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, justifyContent: 'center' }}>
          <div style={{ width: 34, height: 34, background: '#6366f1', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={17} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>RendezVous Pro</span>
        </div>

        <div className="card card-p6">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, background: '#eef2ff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Lock size={24} style={{ color: '#6366f1' }} />
            </div>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>
              Nouveau mot de passe
            </h2>
            {prenom && (
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 5 }}>
                Bonjour <strong>{prenom}</strong>, choisissez un nouveau mot de passe sécurisé.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Nouveau mot de passe */}
            <div>
              <label className="input-label">Nouveau mot de passe *</label>
              <div className="input-wrap">
                <span className="input-ico"><Lock size={15} /></span>
                <input
                  type={showPwd.nouveau ? 'text' : 'password'}
                  className={`input-field input-icon-field${errors.nouveau ? ' input-field-error' : ''}`}
                  style={{ paddingRight: 40 }}
                  placeholder="Votre nouveau mot de passe"
                  value={form.nouveau}
                  onChange={set('nouveau')}
                  autoComplete="new-password"
                />
                <button type="button"
                  onClick={() => setShowPwd(s => ({ ...s, nouveau: !s.nouveau }))}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', display: 'flex' }}>
                  {showPwd.nouveau ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.nouveau && <span className="input-err">{errors.nouveau}</span>}

              {/* Indicateurs de force */}
              {form.nouveau && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {regles.map(r => {
                    const ok = r.test(form.nouveau);
                    return (
                      <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 14, height: 14, borderRadius: '50%', background: ok ? '#10b981' : r.optional ? 'var(--border)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .2s' }}>
                          {ok && <CheckCircle size={10} color="#fff" />}
                        </span>
                        <span style={{ fontSize: 11, color: ok ? '#10b981' : 'var(--text-4)' }}>
                          {r.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirmer */}
            <div>
              <label className="input-label">Confirmer le mot de passe *</label>
              <div className="input-wrap">
                <span className="input-ico"><Lock size={15} /></span>
                <input
                  type={showPwd.confirm ? 'text' : 'password'}
                  className={`input-field input-icon-field${errors.confirm ? ' input-field-error' : ''}`}
                  style={{ paddingRight: 40 }}
                  placeholder="Répétez votre mot de passe"
                  value={form.confirm}
                  onChange={set('confirm')}
                  autoComplete="new-password"
                />
                <button type="button"
                  onClick={() => setShowPwd(s => ({ ...s, confirm: !s.confirm }))}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', display: 'flex' }}>
                  {showPwd.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm && <span className="input-err">{errors.confirm}</span>}
              {/* Indicateur correspondance */}
              {form.confirm && form.nouveau && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: form.nouveau === form.confirm ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={10} color="#fff" />
                  </span>
                  <span style={{ fontSize: 11, color: form.nouveau === form.confirm ? '#10b981' : '#ef4444' }}>
                    {form.nouveau === form.confirm ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn btn-accent btn-lg btn-full"
              style={{ marginTop: 4, opacity: loading ? .7 : 1 }}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Réinitialisation…
                </>
              ) : 'Réinitialiser mon mot de passe'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18 }}>
            <Link to="/login" style={{ fontSize: 12, color: 'var(--text-4)' }}>
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}