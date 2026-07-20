import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, User, Clock, ChevronRight, ArrowLeft, CheckCircle, Building2, Tag, Calendar } from 'lucide-react';

const API = 'http://localhost:8000/api';

// Récupère le token JWT stocké dans localStorage
// APRÈS — correct
function getToken() {
  return localStorage.getItem('access_token') || '';
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// =============================================================
//   ÉTAPE 1 — Recherche de service
// =============================================================
function EtapeRecherche({ onServiceChoisi }) {
  const [search, setSearch]       = useState('');
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(false);

  // Recherche automatique dès que l'utilisateur tape
  useEffect(() => {
    // Délai de 400ms pour ne pas lancer une requête à chaque lettre
    const timer = setTimeout(() => {
      if (search.trim().length >= 1) {
        rechercherServices(search.trim());
      } else {
        // Charger tous les services si champ vide
        rechercherServices('');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Charge tous les services au montage de la page
  useEffect(() => {
    rechercherServices('');
  }, []);

  async function rechercherServices(terme) {
    setLoading(true);
    try {
      const params = terme ? `?search=${encodeURIComponent(terme)}` : '';
      const res = await axios.get(`${API}/services/${params}`, {
        headers: authHeaders(),
      });
      setServices(res.data);
    } catch {
      toast.error('Impossible de charger les services.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.etapeContainer}>
      {/* En-tête étape */}
      <div style={styles.etapeHeader}>
        <div style={styles.etapeBadge}>Étape 1 sur 3</div>
        <h2 style={styles.etapeTitre}>Quel service recherchez-vous ?</h2>
        <p style={styles.etapeSousTitre}>
          Tapez le nom d'un service pour trouver les professionnels disponibles.
        </p>
      </div>

      {/* Champ de recherche */}
      <div style={styles.searchWrapper}>
        <Search size={18} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Ex : consultation, coiffure, nettoyage…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
          autoFocus
        />
        {loading && <div style={styles.searchSpinner} />}
      </div>

      {/* Liste des services */}
      <div style={styles.serviceGrid}>
        {services.length === 0 && !loading && (
          <div style={styles.empty}>
            <Search size={32} style={{ color: 'var(--text-3)', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-3)', margin: 0 }}>Aucun service trouvé</p>
          </div>
        )}
        {services.map(service => (
          <button
            key={service.id}
            style={styles.serviceCard}
            onClick={() => onServiceChoisi(service)}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.serviceCardTop}>
              <div style={styles.serviceNom}>{service.nom}</div>
              <ChevronRight size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            </div>
            <div style={styles.serviceInfos}>
              <span style={styles.serviceBadge}>
                <Building2 size={12} />
                {service.entreprise_nom}
              </span>
              <span style={styles.serviceBadge}>
                <Tag size={12} />
                {service.domaine_nom}
              </span>
              <span style={styles.serviceBadge}>
                <Clock size={12} />
                {service.duree_minutes} min
              </span>
            </div>
            <div style={styles.servicePrix}>
              {parseInt(service.prix).toLocaleString('fr-FR')} FCFA
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================
//   ÉTAPE 2 — Choisir un personnel et un créneau
// =============================================================
function EtapePersonnel({ service, onCreneauChoisi, onRetour }) {
  const [personnels, setPersonnels]     = useState([]);
  const [personnelActif, setPersonnelActif] = useState(null);
  const [creneaux, setCreneaux]         = useState([]);
  const [creneauChoisi, setCreneauChoisi] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [loadingCreneaux, setLoadingCreneaux] = useState(false);

  // Charger les personnels qui proposent ce service
  useEffect(() => {
    async function charger() {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/services/${service.id}/personnels/`, {
          headers: authHeaders(),
        });
        // La réponse a la forme { service: {...}, personnels: [...] }
        setPersonnels(res.data.personnels || []);
      } catch {
        toast.error('Impossible de charger les professionnels.');
      } finally {
        setLoading(false);
      }
    }
    charger();
  }, [service.id]);

  // Charger les créneaux quand un personnel est sélectionné
  async function choisirPersonnel(personnel) {
    setPersonnelActif(personnel);
    setCreneauChoisi(null);
    setLoadingCreneaux(true);
    try {
      const res = await axios.get(`${API}/personnels/${personnel.id}/creneaux/`, {
        headers: authHeaders(),
      });
      // La réponse a la forme { personnel: {...}, creneaux: [...] }
      setCreneaux(res.data.creneaux || []);
    } catch {
      toast.error('Impossible de charger les créneaux.');
    } finally {
      setLoadingCreneaux(false);
    }
  }

  function valider() {
    if (!personnelActif || !creneauChoisi) {
      toast.error('Choisissez un professionnel et un créneau.');
      return;
    }
    // On remonte les données choisies vers le parent
    onCreneauChoisi({ personnel: personnelActif, creneau: creneauChoisi });
  }

  return (
    <div style={styles.etapeContainer}>
      {/* En-tête */}
      <button style={styles.retourBtn} onClick={onRetour}>
        <ArrowLeft size={16} /> Retour
      </button>

      <div style={styles.etapeHeader}>
        <div style={styles.etapeBadge}>Étape 2 sur 3</div>
        <h2 style={styles.etapeTitre}>Choisissez un professionnel</h2>
        <div style={styles.serviceResume}>
          <strong>{service.nom}</strong>
          <span style={styles.dot} />
          {parseInt(service.prix).toLocaleString('fr-FR')} FCFA
          <span style={styles.dot} />
          {service.duree_minutes} min
        </div>
      </div>

      {loading && (
        <div style={styles.centrer}>
          <div style={styles.spinner} />
          <p style={{ color: 'var(--text-3)', marginTop: 12 }}>Recherche des professionnels…</p>
        </div>
      )}

      {!loading && personnels.length === 0 && (
        <div style={styles.empty}>
          <User size={32} style={{ color: 'var(--text-3)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-3)', margin: 0 }}>
            Aucun professionnel disponible pour ce service.
          </p>
        </div>
      )}

      {/* Liste des personnels */}
      {!loading && personnels.length > 0 && (
        <div style={styles.personnelGrid}>
          {personnels.map(p => {
            const actif = personnelActif?.id === p.id;
            return (
              <button
                key={p.id}
                style={{
                  ...styles.personnelCard,
                  borderColor: actif ? 'var(--primary)' : 'var(--border)',
                  background: actif ? 'var(--primary-bg)' : 'var(--bg-card)',
                }}
                onClick={() => choisirPersonnel(p)}
              >
                {/* Avatar initiales */}
                <div style={{
                  ...styles.avatar,
                  background: actif ? 'var(--primary)' : 'var(--bg-hover)',
                  color: actif ? '#fff' : 'var(--text-2)',
                }}>
                  {p.utilisateur.prenom[0]}{p.utilisateur.nom[0]}
                </div>
                <div style={styles.personnelInfos}>
                  <div style={styles.personnelNom}>
                    {p.utilisateur.prenom} {p.utilisateur.nom}
                  </div>
                  <div style={styles.personnelPoste}>{p.poste}</div>
                  {p.entreprise_nom && (
                    <div style={styles.personnelEntreprise}>
                      <Building2 size={12} />
                      {p.entreprise_nom}
                    </div>
                  )}
                </div>
                {actif && <CheckCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Créneaux du personnel sélectionné */}
      {personnelActif && (
        <div style={{ marginTop: 28 }}>
          <h3 style={styles.creneauxTitre}>
            <Calendar size={16} />
            Créneaux disponibles — {personnelActif.utilisateur.prenom}
          </h3>

          {loadingCreneaux && (
            <div style={styles.centrer}>
              <div style={styles.spinner} />
            </div>
          )}

          {!loadingCreneaux && creneaux.length === 0 && (
            <div style={styles.empty}>
              <p style={{ color: 'var(--text-3)', margin: 0 }}>
                Aucun créneau disponible pour ce professionnel.
              </p>
            </div>
          )}

          {!loadingCreneaux && creneaux.length > 0 && (
            <div style={styles.creneauxGrid}>
    {creneaux.map(c => {
      const choisi = creneauChoisi?.id === c.id;
      return (
        <button
          key={c.id}
          style={{
            ...styles.creneauBtn,
            borderColor:   choisi ? 'var(--primary)' : 'var(--border)',
            background:    choisi ? 'var(--primary)' : 'var(--bg-card)',
            color:         choisi ? '#fff' : 'var(--text-1)',
            flexDirection: 'column',
            alignItems:    'flex-start',
            gap:           2,
          }}
          onClick={() => setCreneauChoisi(c)}
        >
          {c.jour_semaine && (
            <span style={{ fontSize: 11, opacity: 0.75 }}>
              {c.jour_semaine}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} />
            {c.heure_debut.slice(0, 5)} – {c.heure_fin.slice(0, 5)}
          </span>
        </button>
      );
    })}
  </div>
             
          )}
        </div>
      )}

      {/* Bouton valider */}
      {creneauChoisi && (
        <button style={styles.btnPrimaire} onClick={valider}>
          Confirmer ce créneau →
        </button>
      )}
    </div>
  );
}

// =============================================================
//   ÉTAPE 3 — Récapitulatif et confirmation
// =============================================================
function EtapeConfirmation({ service, personnel, creneau, onRetour, onSuccess }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading]         = useState(false);

  async function soumettreRDV() {
    setLoading(true);
    try {
      await axios.post(`${API}/rendezvous/`, {
        creneau_id:  creneau.id,
        service_id:  service.id,
        description: description.trim(),
      }, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });

      toast.success('Rendez-vous créé ! Le professionnel va confirmer votre demande.');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.erreur || 'Erreur lors de la création du rendez-vous.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.etapeContainer}>
      <button style={styles.retourBtn} onClick={onRetour}>
        <ArrowLeft size={16} /> Retour
      </button>

      <div style={styles.etapeHeader}>
        <div style={styles.etapeBadge}>Étape 3 sur 3</div>
        <h2 style={styles.etapeTitre}>Récapitulatif de votre rendez-vous</h2>
        <p style={styles.etapeSousTitre}>
          Vérifiez les informations avant de valider.
        </p>
      </div>

      {/* Carte récapitulatif */}
      <div style={styles.recapCard}>
        <div style={styles.recapLigne}>
          <span style={styles.recapLabel}>Service</span>
          <span style={styles.recapValeur}>{service.nom}</span>
        </div>
        <div style={styles.recapSeparateur} />
        <div style={styles.recapLigne}>
          <span style={styles.recapLabel}>Professionnel</span>
          <span style={styles.recapValeur}>
            {personnel.utilisateur.prenom} {personnel.utilisateur.nom}
          </span>
        </div>
        <div style={styles.recapSeparateur} />
        <div style={styles.recapLigne}>
          <span style={styles.recapLabel}>Entreprise</span>
          <span style={styles.recapValeur}>{personnel.entreprise_nom || '—'}</span>
        </div>
        <div style={styles.recapSeparateur} />
        <div style={styles.recapLigne}>
          <span style={styles.recapLabel}>Créneau</span>
          <span style={styles.recapValeur}>
            {creneau.heure_debut.slice(0, 5)} – {creneau.heure_fin.slice(0, 5)}
          </span>
        </div>
        <div style={styles.recapSeparateur} />
        <div style={styles.recapLigne}>
          <span style={styles.recapLabel}>Durée estimée</span>
          <span style={styles.recapValeur}>{service.duree_minutes} minutes</span>
        </div>
        <div style={styles.recapSeparateur} />
        <div style={styles.recapLigne}>
          <span style={styles.recapLabel}>Prix</span>
          <span style={{ ...styles.recapValeur, color: 'var(--primary)', fontWeight: 700 }}>
            {parseInt(service.prix).toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>

      {/* Note importante sur le paiement */}
      <div style={styles.noteInfo}>
        <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
          Le paiement sera disponible <strong>uniquement après confirmation</strong> par le professionnel.
          Votre demande est en attente jusqu'à sa validation.
        </p>
      </div>

      {/* Description optionnelle */}
      <div style={{ marginTop: 20 }}>
        <label style={styles.label}>
          Note pour le professionnel <span style={{ color: 'var(--text-3)' }}>(optionnel)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Décrivez votre besoin, ajoutez des précisions…"
          rows={3}
          style={styles.textarea}
        />
      </div>

      {/* Bouton de confirmation */}
      <button
        style={{
          ...styles.btnPrimaire,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
        onClick={soumettreRDV}
        disabled={loading}
      >
        {loading ? 'Envoi en cours…' : 'Valider la demande de rendez-vous →'}
      </button>
    </div>
  );
}

// =============================================================
//   PAGE PRINCIPALE — Orchestre les 3 étapes
// =============================================================
export default function PriseRendezVousPage() {
  // etape : 1 | 2 | 3 | 'succes'
  const [etape, setEtape]           = useState(1);
  const [serviceChoisi, setServiceChoisi] = useState(null);
  const [personnelChoisi, setPersonnelChoisi] = useState(null);
  const [creneauChoisi, setCreneauChoisi] = useState(null);

  function handleServiceChoisi(service) {
    setServiceChoisi(service);
    setEtape(2);
  }

  function handleCreneauChoisi({ personnel, creneau }) {
    setPersonnelChoisi(personnel);
    setCreneauChoisi(creneau);
    setEtape(3);
  }

  function handleSuccess() {
    setEtape('succes');
  }

  function recommencer() {
    setEtape(1);
    setServiceChoisi(null);
    setPersonnelChoisi(null);
    setCreneauChoisi(null);
  }

  return (
    <div style={styles.page}>
      {/* Barre de progression */}
      {etape !== 'succes' && (
        <div style={styles.progressBar}>
          {[1, 2, 3].map(n => (
            <div key={n} style={styles.progressStep}>
              <div style={{
                ...styles.progressDot,
                background: etape >= n ? 'var(--primary)' : 'var(--border)',
              }}>
                {etape > n ? <CheckCircle size={14} color="#fff" /> : (
                  <span style={{ fontSize: 12, color: etape >= n ? '#fff' : 'var(--text-3)' }}>{n}</span>
                )}
              </div>
              <span style={{
                fontSize: 12,
                color: etape >= n ? 'var(--primary)' : 'var(--text-3)',
                fontWeight: etape === n ? 600 : 400,
              }}>
                {n === 1 ? 'Service' : n === 2 ? 'Professionnel' : 'Confirmation'}
              </span>
              {n < 3 && (
                <div style={{
                  ...styles.progressLine,
                  background: etape > n ? 'var(--primary)' : 'var(--border)',
                }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contenu selon l'étape */}
      {etape === 1 && (
        <EtapeRecherche onServiceChoisi={handleServiceChoisi} />
      )}

      {etape === 2 && serviceChoisi && (
        <EtapePersonnel
          service={serviceChoisi}
          onCreneauChoisi={handleCreneauChoisi}
          onRetour={() => setEtape(1)}
        />
      )}

      {etape === 3 && serviceChoisi && personnelChoisi && creneauChoisi && (
        <EtapeConfirmation
          service={serviceChoisi}
          personnel={personnelChoisi}
          creneau={creneauChoisi}
          onRetour={() => setEtape(2)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Écran de succès */}
      {etape === 'succes' && (
        <div style={styles.succes}>
          <div style={styles.succesIcone}>
            <CheckCircle size={48} color="#10b981" />
          </div>
          <h2 style={styles.succesTitre}>Demande envoyée !</h2>
          <p style={styles.succesTxt}>
            Votre demande de rendez-vous a été transmise au professionnel.
            Vous recevrez une notification par email dès qu'il aura confirmé ou refusé.
          </p>
          <p style={{ ...styles.succesTxt, fontWeight: 600, color: 'var(--text-2)' }}>
            Le paiement sera disponible uniquement après confirmation.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={styles.btnPrimaire} onClick={() => window.location.href = '/rendezvous'}>
              Voir mes rendez-vous
            </button>
            <button style={styles.btnSecondaire} onClick={recommencer}>
              Prendre un autre rendez-vous
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
//   STYLES
// =============================================================
const styles = {
  page: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '24px 16px 60px',
    fontFamily: 'Inter, sans-serif',
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: 36,
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s',
  },
  progressLine: {
    position: 'absolute',
    top: 16,
    left: '100%',
    width: 60,
    height: 2,
    transition: 'background 0.3s',
  },
  etapeContainer: {
    background: 'var(--bg-card)',
    borderRadius: 16,
    border: '1px solid var(--border)',
    padding: '28px 24px',
  },
  etapeHeader: {
    marginBottom: 24,
  },
  etapeBadge: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--primary)',
    background: 'var(--primary-bg)',
    padding: '3px 10px',
    borderRadius: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  etapeTitre: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text-1)',
    margin: '0 0 6px',
  },
  etapeSousTitre: {
    fontSize: 14,
    color: 'var(--text-3)',
    margin: 0,
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-3)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 14px 12px 44px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--bg-main)',
    color: 'var(--text-1)',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  searchSpinner: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid var(--border)',
    borderTopColor: 'var(--primary)',
    animation: 'spin 0.8s linear infinite',
  },
  serviceGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  serviceCard: {
    width: '100%',
    textAlign: 'left',
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
  },
  serviceCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceNom: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-1)',
  },
  serviceInfos: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  serviceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: 'var(--text-3)',
    background: 'var(--bg-hover)',
    padding: '2px 8px',
    borderRadius: 20,
  },
  servicePrix: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--primary)',
  },
  personnelGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  personnelCard: {
    width: '100%',
    textAlign: 'left',
    border: '2px solid',
    borderRadius: 12,
    padding: '14px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    transition: 'all 0.2s',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
    textTransform: 'uppercase',
  },
  personnelInfos: {
    flex: 1,
    minWidth: 0,
  },
  personnelNom: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-1)',
  },
  personnelPoste: {
    fontSize: 13,
    color: 'var(--text-3)',
    marginTop: 2,
  },
  personnelEntreprise: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: 'var(--text-3)',
    marginTop: 4,
  },
  creneauxTitre: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-1)',
    margin: '0 0 14px',
  },
  creneauxGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  creneauBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    border: '1.5px solid',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  recapCard: {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '4px 0',
    marginBottom: 16,
  },
  recapLigne: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 18px',
  },
  recapLabel: {
    fontSize: 13,
    color: 'var(--text-3)',
  },
  recapValeur: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-1)',
    textAlign: 'right',
  },
  recapSeparateur: {
    height: 1,
    background: 'var(--border)',
    margin: '0 18px',
  },
  noteInfo: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 4,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-2)',
    marginBottom: 8,
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--bg-main)',
    color: 'var(--text-1)',
    fontSize: 14,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
  },
  btnPrimaire: {
    display: 'block',
    width: '100%',
    marginTop: 20,
    padding: '14px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  btnSecondaire: {
    display: 'block',
    padding: '12px 24px',
    background: 'transparent',
    color: 'var(--text-2)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  retourBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--text-3)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 0 16px',
  },
  serviceResume: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: 'var(--text-2)',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'var(--text-3)',
    display: 'inline-block',
  },
  centrer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 0',
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--primary)',
    animation: 'spin 0.8s linear infinite',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 0',
    color: 'var(--text-3)',
  },
  succes: {
    textAlign: 'center',
    padding: '40px 24px',
    background: 'var(--bg-card)',
    borderRadius: 16,
    border: '1px solid var(--border)',
  },
  succesIcone: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  succesTitre: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-1)',
    margin: '0 0 12px',
  },
  succesTxt: {
    fontSize: 14,
    color: 'var(--text-3)',
    maxWidth: 440,
    margin: '0 auto 12px',
    lineHeight: 1.6,
  },
};
