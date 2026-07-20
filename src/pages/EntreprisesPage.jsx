import { useEffect, useState } from 'react';
import { Building2, Star, MapPin, Phone, Mail, Users, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

function getToken() { return localStorage.getItem('access_token') || ''; }
function authHeaders() { return { Authorization: `Bearer ${getToken()}` }; }

export default function EntreprisesPage() {
  const { isAdmin } = useAuth();
  const [entreprises, setEntreprises] = useState([]);
  const [domaines,    setDomaines]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [domaineFiltreId, setDomaineFiltreId] = useState('');
  // Garde l'ID de la carte ouverte (personnels visibles)
  const [ouvert, setOuvert]           = useState(null);
  const [personnelsCache, setPersonnelsCache] = useState({});
  const [loadingPersonnels, setLoadingPersonnels] = useState(false);
  // Formulaire création entreprise
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ nom_entreprise: '', adresse: '', telephone: '', email: '', description: '', domaine: '' });
  const [submitting, setSubmitting]   = useState(false);

  async function charger(domaineId) {
    setLoading(true);
    try {
      const params = domaineId ? `?domaine=${domaineId}` : '';
      const res = await axios.get(`${API}/entreprises/${params}`, { headers: authHeaders() });
      setEntreprises(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch { toast.error('Erreur de chargement.'); }
    finally  { setLoading(false); }
  }

  async function chargerDomaines() {
    try {
      const res = await axios.get(`${API}/domaines/`, { headers: authHeaders() });
      setDomaines(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {}
  }

  useEffect(() => {
    chargerDomaines();
    // Lire domaine depuis l'URL si présent
    const params = new URLSearchParams(window.location.search);
    const d = params.get('domaine') || '';
    setDomaineFiltreId(d);
    charger(d);
  }, []);

 async function togglePersonnels(entrepriseId) {
    if (ouvert === entrepriseId) { setOuvert(null); return; }
    setOuvert(entrepriseId);
    if (personnelsCache[entrepriseId]) return;
    setLoadingPersonnels(true);
    try {
        // Appel vers le bon endpoint filtré par entreprise
        const res = await axios.get(
            `${API}/entreprises/${entrepriseId}/personnels/`,
            { headers: authHeaders() }
        );
        const personnels = res.data.personnels || [];
        setPersonnelsCache(c => ({ ...c, [entrepriseId]: personnels }));
    } catch {
        toast.error('Impossible de charger les personnels.');
    } finally {
        setLoadingPersonnels(false);
    }
  }
  async function creerEntreprise(e) {
    e.preventDefault();
    if (!form.nom_entreprise.trim() || !form.domaine) {
      toast.error('Nom et domaine sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/entreprises/`, form, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });
      toast.success(`Entreprise "${form.nom_entreprise}" créée !`);
      setForm({ nom_entreprise: '', adresse: '', telephone: '', email: '', description: '', domaine: '' });
      setShowForm(false);
      charger(domaineFiltreId);
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || err.response?.data?.nom_entreprise?.[0] || 'Erreur lors de la création.');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="fade-up">

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Entreprises</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '4px 0 0' }}>
            {entreprises.length} partenaire{entreprises.length > 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 10,
              background: showForm ? 'var(--bg-hover)' : 'var(--primary)',
              color: showForm ? 'var(--text-2)' : '#fff',
              border: showForm ? '1px solid var(--border)' : 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {showForm ? <><X size={15} /> Annuler</> : <><Plus size={15} /> Nouvelle entreprise</>}
          </button>
        )}
      </div>

      {/* Formulaire création */}
      {showForm && isAdmin && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 16px' }}>Nouvelle entreprise</h3>
          <form onSubmit={creerEntreprise}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                  Nom <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" value={form.nom_entreprise}
                  onChange={e => setForm(f => ({ ...f, nom_entreprise: e.target.value }))}
                  placeholder="Nom de l'entreprise" className="input-field" style={{ width: '100%' }} autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                  Domaine <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select value={form.domaine} onChange={e => setForm(f => ({ ...f, domaine: e.target.value }))}
                  className="input-field" style={{ width: '100%' }}>
                  <option value="">Choisir un domaine…</option>
                  {domaines.map(d => <option key={d.id} value={d.id}>{d.nom_domaine}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Adresse</label>
                <input type="text" value={form.adresse}
                  onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))}
                  placeholder="Adresse" className="input-field" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Téléphone</label>
                <input type="text" value={form.telephone}
                  onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  placeholder="6XXXXXXXX" className="input-field" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="contact@entreprise.cm" className="input-field" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Description</label>
                <input type="text" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Courte description…" className="input-field" style={{ width: '100%' }} />
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{
              padding: '10px 24px', background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Création…' : 'Créer l\'entreprise'}
            </button>
          </form>
        </div>
      )}

      {/* Filtre par domaine */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => { setDomaineFiltreId(''); charger(''); }}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: !domaineFiltreId ? 'var(--primary)' : 'var(--bg-hover)',
            color: !domaineFiltreId ? '#fff' : 'var(--text-2)',
            border: !domaineFiltreId ? 'none' : '1px solid var(--border)',
          }}
        >Tous</button>
        {domaines.map(d => (
          <button key={d.id}
            onClick={() => { setDomaineFiltreId(String(d.id)); charger(d.id); }}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: domaineFiltreId === String(d.id) ? 'var(--primary)' : 'var(--bg-hover)',
              color: domaineFiltreId === String(d.id) ? '#fff' : 'var(--text-2)',
              border: domaineFiltreId === String(d.id) ? 'none' : '1px solid var(--border)',
            }}
          >{d.nom_domaine}</button>
        ))}
      </div>

      {/* Liste entreprises */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : entreprises.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <Building2 size={36} style={{ color: 'var(--text-3)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-3)', margin: 0 }}>Aucune entreprise trouvée.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entreprises.map(e => (
            <div key={e.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>

              {/* Barre colorée en haut */}
              <div style={{ height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />

              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>

                  {/* Infos principales */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {/* Avatar lettre */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                      background: 'var(--primary-50)', color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 800,
                    }}>
                      {e.nom_entreprise?.[0]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 2px' }}>{e.nom_entreprise}</h3>
                      <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-50)', padding: '2px 8px', borderRadius: 20 }}>
                        {e.domaine_nom}
                      </span>
                      {e.description && (
                        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '8px 0 0', lineHeight: 1.5 }}>{e.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Contacts + note */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    {e.note_moyenne && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fffbeb', padding: '4px 10px', borderRadius: 8, marginBottom: 6 }}>
                        <Star size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{e.note_moyenne}/5</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
                      <MapPin size={12} /> {e.adresse}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
                      <Phone size={12} /> {e.telephone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
                      <Mail size={12} /> {e.email}
                    </div>
                  </div>
                </div>

                {/* Bouton voir personnels */}
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <button
                    onClick={() => togglePersonnels(e.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'none', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '7px 14px', fontSize: 13,
                      fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer',
                    }}
                  >
                    <Users size={14} />
                    {ouvert === e.id ? 'Masquer les personnels' : 'Voir les personnels'}
                    {ouvert === e.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Liste des personnels */}
                  {ouvert === e.id && (
                    <div style={{ marginTop: 14 }}>
                      {loadingPersonnels ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
                        </div>
                      ) : (() => {
                        // Filtrer les personnels de cette entreprise depuis le cache
                        const tous = personnelsCache[e.id] || [];
                        // Note : ici on affiche tous car l'API /users/ ne filtre pas par entreprise
                        // On va plutôt chercher via le shell — à améliorer avec un endpoint dédié
                        return tous.length === 0 ? (
                          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 16 }}>
                            Aucun personnel associé à cette entreprise.
                          </p>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                            {ouvert === e.id && (
                            <div style={{ marginTop: 14 }}>
                              {loadingPersonnels ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
                                </div>
                              ) : (personnelsCache[e.id] || []).length === 0 ? (
                                <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 16 }}>
                                  Aucun personnel associé à cette entreprise.
                                </p>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                                  {(personnelsCache[e.id] || []).map(p => (
                                    <div key={p.id} style={{
                                      background: 'var(--bg-main)', border: '1px solid var(--border)',
                                      borderRadius: 10, padding: '12px 14px',
                                      display: 'flex', alignItems: 'center', gap: 10,
                                    }}>
                                      <div style={{
                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                        background: 'var(--primary-50)', color: 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 13, fontWeight: 700,
                                      }}>
                                        {p.utilisateur?.prenom?.[0]}{p.utilisateur?.nom?.[0]}
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                                          {p.utilisateur?.prenom} {p.utilisateur?.nom}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.poste}</div>
                                        {p.services_proposes?.length > 0 && (
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                            {p.services_proposes.map(s => (
                                              <span key={s.id} style={{
                                                fontSize: 10, padding: '2px 6px', borderRadius: 20,
                                                background: 'var(--primary-50)', color: 'var(--primary)', fontWeight: 600,
                                              }}>
                                                {s.nom}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
