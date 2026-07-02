// src/pages/RendezVousPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { Calendar, Plus, CheckCircle, XCircle, Ban, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRendezVous, traiterRendezVous, annulerRendezVous, creerRendezVous } from '../api/rendezvous';
import { getCreneauxDisponibles } from '../api/creneaux';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './RendezVousPage.css';

const STATUTS = ['tous', 'en_attente', 'confirme', 'refuse', 'annule', 'termine'];

export default function RendezVousPage() {
  const { isAdmin, isClient } = useAuth();
  const [rdvs,     setRdvs]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [filtre,   setFiltre]  = useState('tous');
  const [selected, setSelected] = useState(null);
  const [modalTraiter, setModalTraiter] = useState(false);
  const [modalCreer,   setModalCreer]   = useState(false);
  const [action,   setAction]  = useState('confirmer');
  const [motif,    setMotif]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [creneaux, setCreneaux] = useState([]);
  const [newRdv,   setNewRdv]   = useState({ creneau_id: '', description: '' });

  const fetchRdvs = useCallback(async () => {
    setLoading(true);
    try {
      const params = filtre !== 'tous' ? { statut: filtre } : {};
      const r = await getRendezVous(params);
      setRdvs(r.data.results || r.data || []);
    } catch { toast.error('Erreur lors du chargement'); }
    finally { setLoading(false); }
  }, [filtre]);

  useEffect(() => { fetchRdvs(); }, [fetchRdvs]);

  const openTraiter = (rdv, act) => { setSelected(rdv); setAction(act); setMotif(''); setModalTraiter(true); };

  const handleTraiter = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await traiterRendezVous(selected.id, { action, motif_refus: motif });
      toast.success(action === 'confirmer' ? 'RDV confirmé !' : 'RDV refusé');
      setModalTraiter(false);
      fetchRdvs();
    } catch (e) {
      toast.error(e.response?.data?.erreur || 'Erreur');
    } finally { setSubmitting(false); }
  };

  const handleAnnuler = async (rdv) => {
    if (!window.confirm(`Annuler le RDV #${rdv.id} ?`)) return;
    try {
      await annulerRendezVous(rdv.id);
      toast.success('RDV annulé');
      fetchRdvs();
    } catch (e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
  };

  const handleCreer = async () => {
    if (!newRdv.creneau_id) { toast.error('Choisissez un créneau'); return; }
    setSubmitting(true);
    try {
      await creerRendezVous({ creneau_id: parseInt(newRdv.creneau_id), description: newRdv.description });
      toast.success('Rendez-vous créé ! Un email de confirmation a été envoyé.');
      setModalCreer(false);
      setNewRdv({ creneau_id: '', description: '' });
      fetchRdvs();
    } catch (e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  const ouvrirModalCreer = async () => {
    setModalCreer(true);
    try {
      const r = await getCreneauxDisponibles();
      setCreneaux(r.data.results || r.data || []);
    } catch { toast.error('Impossible de charger les créneaux'); }
  };

  if (loading) return <Spinner size="lg" text="Chargement des rendez-vous..." />;

  return (
    <div className="rdv-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rendez-vous</h1>
          <p className="page-subtitle">{rdvs.length} rendez-vous trouvé{rdvs.length > 1 ? 's' : ''}</p>
        </div>
        {isClient && (
          <Button icon={Plus} onClick={ouvrirModalCreer}>Prendre un RDV</Button>
        )}
      </div>

      {/* Filtres */}
      <div className="rdv-filtres">
        {STATUTS.map(s => (
          <button
            key={s}
            className={`rdv-filtre-btn ${filtre === s ? 'rdv-filtre-btn--active' : ''}`}
            onClick={() => setFiltre(s)}
          >
            {s === 'tous' ? 'Tous' : <Badge statut={s} />}
          </button>
        ))}
      </div>

      {/* Liste */}
      {rdvs.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucun rendez-vous"
          description="Prenez votre premier rendez-vous en cliquant sur le bouton ci-dessus."
          action={isClient && <Button icon={Plus} onClick={ouvrirModalCreer}>Prendre un RDV</Button>}
        />
      ) : (
        <div className="rdv-grid">
          {rdvs.map(rdv => (
            <Card key={rdv.id} hover>
              <div className="rdv-card-header">
                <span className="rdv-card-id">RDV #{rdv.id}</span>
                <Badge statut={rdv.statut} />
              </div>
              <div className="rdv-card-info">
                <div className="rdv-card-row">
                  <span className="rdv-card-label">Client</span>
                  <span className="rdv-card-value">{rdv.client_nom}</span>
                </div>
                <div className="rdv-card-row">
                  <span className="rdv-card-label">Créneau</span>
                  <span className="rdv-card-value">#{rdv.creneau}</span>
                </div>
                {rdv.description && (
                  <div className="rdv-card-row">
                    <span className="rdv-card-label">Description</span>
                    <span className="rdv-card-value rdv-card-desc">{rdv.description}</span>
                  </div>
                )}
                <div className="rdv-card-row">
                  <span className="rdv-card-label">Créé le</span>
                  <span className="rdv-card-value">
                    {format(new Date(rdv.date_creation), 'd MMM yyyy', { locale: fr })}
                  </span>
                </div>
                {rdv.motif_refus && (
                  <div className="rdv-card-motif">
                    <span className="rdv-card-label">Motif refus :</span>
                    <span>{rdv.motif_refus}</span>
                  </div>
                )}
              </div>

              {/* Actions admin */}
              {isAdmin && rdv.statut === 'en_attente' && (
                <div className="rdv-card-actions">
                  <Button size="sm" variant="success" icon={CheckCircle} onClick={() => openTraiter(rdv, 'confirmer')}>Confirmer</Button>
                  <Button size="sm" variant="danger"  icon={XCircle}    onClick={() => openTraiter(rdv, 'refuser')}>Refuser</Button>
                </div>
              )}
              {/* Actions client */}
              {isClient && rdv.statut === 'en_attente' && (
                <div className="rdv-card-actions">
                  <Button size="sm" variant="secondary" icon={Ban} onClick={() => handleAnnuler(rdv)}>Annuler</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal Traiter */}
      <Modal isOpen={modalTraiter} onClose={() => setModalTraiter(false)}
        title={action === 'confirmer' ? 'Confirmer le rendez-vous' : 'Refuser le rendez-vous'}>
        <p className="modal-info">RDV <strong>#{selected?.id}</strong> — {selected?.client_nom}</p>
        {action === 'refuser' && (
          <div className="modal-field">
            <label className="modal-label">Motif du refus <span className="required">*</span></label>
            <textarea
              className="modal-textarea"
              placeholder="Expliquez la raison du refus..."
              value={motif}
              onChange={e => setMotif(e.target.value)}
              rows={4}
            />
          </div>
        )}
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setModalTraiter(false)}>Annuler</Button>
          <Button
            variant={action === 'confirmer' ? 'success' : 'danger'}
            loading={submitting}
            onClick={handleTraiter}
          >
            {action === 'confirmer' ? 'Confirmer' : 'Refuser'}
          </Button>
        </div>
      </Modal>

      {/* Modal Créer RDV */}
      <Modal isOpen={modalCreer} onClose={() => setModalCreer(false)} title="Prendre un rendez-vous">
        <div className="modal-field">
          <label className="modal-label">Créneau disponible <span className="required">*</span></label>
          <select className="modal-select" value={newRdv.creneau_id} onChange={e => setNewRdv(f => ({ ...f, creneau_id: e.target.value }))}>
            <option value="">— Choisir un créneau —</option>
            {creneaux.map(c => (
              <option key={c.id} value={c.id}>
                Créneau #{c.id} — {c.heure_debut} à {c.heure_fin}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-field">
          <label className="modal-label">Description (optionnel)</label>
          <textarea
            className="modal-textarea"
            placeholder="Décrivez votre besoin..."
            value={newRdv.description}
            onChange={e => setNewRdv(f => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setModalCreer(false)}>Annuler</Button>
          <Button icon={Plus} loading={submitting} onClick={handleCreer}>Confirmer la demande</Button>
        </div>
      </Modal>
    </div>
  );
}
