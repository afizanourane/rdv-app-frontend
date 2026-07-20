import { useEffect, useState } from 'react';
import { Users, Search, Building2, Briefcase, Edit2, X, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:8000/api';
function getToken() { return localStorage.getItem('access_token') || ''; }
function authHeaders() { return { Authorization: `Bearer ${getToken()}` }; }

// Formulaire d'assignation entreprise + services
function FormulaireAssignation({ personnel, entreprises, services, onSave, onCancel }) {
  const [entrepriseId, setEntrepriseId] = useState(personnel.entreprise || '');
  const [poste,        setPoste]        = useState(personnel.poste || '');
  const [servicesIds,  setServicesIds]  = useState(
    (personnel.services_proposes || []).map(s => s.id)
  );
  const [submitting, setSubmitting] = useState(false);

  function toggleService(id) {
    setServicesIds(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  async function sauvegarder() {
    setSubmitting(true);
    try {
      const res = await axios.patch(
        `${API}/personnels/${personnel.id}/`,
        {
          entreprise_id: entrepriseId || null,
          poste:         poste,
          services_ids:  servicesIds,
        },
        { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
      );
      toast.success('Personnel mis à jour !');
      onSave(res.data);
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Erreur lors de la mise à jour.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      background: 'var(--bg-main)', border: '1px solid var(--border-accent)',
      borderRadius: 10, padding: '16px', marginTop: 12,
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 12px' }}>
        Modifier l'assignation
      </p>

      {/* Poste */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>
          Poste
        </label>
        <input
          type="text"
          value={poste}
          onChange={e => setPoste(e.target.value)}
          placeholder="Ex : Médecin généraliste, Coiffeur…"
          className="input-field"
          style={{ width: '100%' }}
        />
      </div>

      {/* Entreprise */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>
          Entreprise <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(laisser vide si indépendant)</span>
        </label>
        <select
          value={entrepriseId}
          onChange={e => setEntrepriseId(e.target.value)}
          className="input-field"
          style={{ width: '100%' }}
        >
          <option value="">— Indépendant (sans entreprise) —</option>
          {entreprises.map(e => (
            <option key={e.id} value={e.id}>{e.nom_entreprise} ({e.domaine_nom})</option>
          ))}
        </select>
      </div>

      {/* Services */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
          Services proposés
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {services.filter(s => !entrepriseId || s.entreprise === parseInt(entrepriseId)).map(s => {
            const selectionne = servicesIds.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleService(s.id)}
                style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', border: '1.5px solid',
                  borderColor: selectionne ? 'var(--primary)' : 'var(--border)',
                  background:  selectionne ? 'var(--primary)' : 'var(--bg-card)',
                  color:       selectionne ? '#fff' : 'var(--text-2)',
                  transition:  'all 0.15s',
                }}
              >
                {selectionne && <Check size={10} style={{ marginRight: 4 }} />}
                {s.nom} — {parseInt(s.prix).toLocaleString('fr-FR')} FCFA
              </button>
            );
          })}
          {services.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
              Aucun service disponible. Créez d'abord des services.
            </p>
          )}
        </div>
      </div>

      {/* Boutons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={sauvegarder}
          disabled={submitting}
          style={{
            padding: '8px 18px', background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px', background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, fontSize: 13, color: 'var(--text-2)', cursor: 'pointer',
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// Carte d'un personnel
function PersonnelCard({ utilisateur, entreprises, services, profilMap }) {
  const [enEdition, setEnEdition] = useState(false);
  const [profil,    setProfil]    = useState(profilMap[utilisateur.id] || null);

  const initiales = `${utilisateur.prenom?.[0] || ''}${utilisateur.nom?.[0] || ''}`.toUpperCase();

  function handleSave(nouveauProfil) {
    setProfil(nouveauProfil);
    setEnEdition(false);
  }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, overflow: 'hidden',
    }}>
      {/* Bandeau */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />

      <div style={{ padding: '18px 20px' }}>
        {/* En-tête carte */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 15, fontWeight: 700,
          }}>
            {initiales}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>
              {utilisateur.prenom} {utilisateur.nom}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              {utilisateur.email}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: utilisateur.is_active ? '#dcfce7' : '#fee2e2',
              color: utilisateur.is_active ? '#15803d' : '#991b1b',
            }}>
              {utilisateur.is_active ? 'Actif' : 'Inactif'}
            </div>
            <button
              onClick={() => setEnEdition(v => !v)}
              title="Modifier l'assignation"
              style={{
                width: 28, height: 28, borderRadius: 6, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: enEdition ? 'var(--bg-danger)' : 'var(--bg-hover)',
                border: '1px solid var(--border)', cursor: 'pointer',
                color: enEdition ? '#ef4444' : 'var(--text-2)',
              }}
            >
              {enEdition ? <X size={13} /> : <Edit2 size={13} />}
            </button>
          </div>
        </div>

        {/* Infos profil */}
        {profil && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profil.poste && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                <Briefcase size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{profil.poste}</span>
              </div>
            )}
            {profil.entreprise_nom ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                <Building2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                {profil.entreprise_nom}
                {profil.domaine_nom && (
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· {profil.domaine_nom}</span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                Indépendant
              </div>
            )}
            {profil.services_proposes?.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Services proposés
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {profil.services_proposes.map(s => (
                    <span key={s.id} style={{
                      fontSize: 11, padding: '3px 8px', borderRadius: 20,
                      background: 'var(--primary-50)', color: 'var(--primary)', fontWeight: 600,
                    }}>
                      {s.nom}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!profil && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0, fontStyle: 'italic' }}>
              Aucune assignation — cliquez sur ✏️ pour configurer.
            </p>
          </div>
        )}

        {/* Formulaire d'assignation */}
        {enEdition && (
          <FormulaireAssignation
            personnel={profil || { id: utilisateur.profil_personnel_id, poste: '', entreprise: '', services_proposes: [] }}
            entreprises={entreprises}
            services={services}
            onSave={handleSave}
            onCancel={() => setEnEdition(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function PersonnelsPage() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [profils,      setProfils]      = useState({});
  const [entreprises,  setEntreprises]  = useState([]);
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const [rUsers, rEntreprises, rServices] = await Promise.all([
          axios.get(`${API}/users/?role=personnel`,  { headers: authHeaders() }),
          axios.get(`${API}/entreprises/`,           { headers: authHeaders() }),
          axios.get(`${API}/services/`,              { headers: authHeaders() }),
        ]);

        const users = Array.isArray(rUsers.data) ? rUsers.data : rUsers.data.results || [];
        setUtilisateurs(users);
        setEntreprises(Array.isArray(rEntreprises.data) ? rEntreprises.data : rEntreprises.data.results || []);
        setServices(Array.isArray(rServices.data) ? rServices.data : rServices.data.results || []);

        // Charge les profils de chaque personnel via services/personnels
        // On cherche le profil complet pour chaque utilisateur
        const profilsMap = {};
        for (const service of (Array.isArray(rServices.data) ? rServices.data : [])) {
          try {
            const r = await axios.get(`${API}/services/${service.id}/personnels/`, { headers: authHeaders() });
            for (const p of (r.data.personnels || [])) {
              if (!profilsMap[p.utilisateur?.id]) {
                profilsMap[p.utilisateur?.id] = p;
              }
            }
          } catch {}
        }
        setProfils(profilsMap);
      } catch {
        toast.error('Erreur de chargement.');
      } finally {
        setLoading(false);
      }
    }
    charger();
  }, []);

  const filtres = utilisateurs.filter(u => {
    if (!search.trim()) return true;
    return `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-3)', marginTop: 12, fontSize: 14 }}>Chargement…</p>
    </div>
  );

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Personnels</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '4px 0 0' }}>
          {filtres.length} professionnel{filtres.length > 1 ? 's' : ''} — cliquez sur ✏️ pour assigner une entreprise et des services
        </p>
      </div>

      {/* Recherche */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="input-field"
          style={{ paddingLeft: 38, width: '100%' }}
        />
      </div>

      {filtres.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <Users size={36} style={{ color: 'var(--text-3)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-3)', margin: 0 }}>Aucun personnel trouvé.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtres.map(u => (
            <PersonnelCard
              key={u.id}
              utilisateur={u}
              entreprises={entreprises}
              services={services}
              profilMap={profils}
            />
          ))}
        </div>
      )}
    </div>
  );
}