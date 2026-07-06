import { useEffect, useState, useCallback } from 'react';
import {
  Calendar, Plus, CheckCircle, XCircle,
  Ban, Search, Filter, Download, X,
} from 'lucide-react';
import { useAuth }   from '../context/AuthContext';
import { getRdvs, traiterRdv, annulerRdv, creerRdv, exportRdvsCsv } from '../api/rendezvous';
import { getDisponibles } from '../api/creneaux';
import { formatDate, formatHeure } from '../utils/helpers';
import {
  Btn, Badge, Modal, Spinner, Empty,
  Card, PageHeader, Select, Textarea, Input,
} from '../components/common/UI';
import toast from 'react-hot-toast';

const STATUTS = ['tous','en_attente','confirme','refuse','annule','termine'];
const LABELS  = {
  tous:'Tous', en_attente:'En attente', confirme:'Confirmé',
  refuse:'Refusé', annule:'Annulé', termine:'Terminé',
};

const FILTRES_VIDES = {
  search:     '',
  statut:     '',
  date_debut: '',
  date_fin:   '',
  client:     '',
  entreprise: '',
};

export default function RendezVousPage() {
  const { isAdmin, isClient, isPersonnel } = useAuth();

  const [rdvs,        setRdvs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filtres,     setFiltres]     = useState(FILTRES_VIDES);
  const [filtrePaneau,setFiltrePaneau]= useState(false);
  const [selected,    setSelected]    = useState(null);
  const [modTraiter,  setModTraiter]  = useState(false);
  const [modCreer,    setModCreer]    = useState(false);
  const [action,      setAction]      = useState('confirmer');
  const [motif,       setMotif]       = useState('');
  const [creneaux,    setCreneaux]    = useState([]);
  const [newRdv,      setNewRdv]      = useState({ creneau_id: '', description: '' });
  const [sub,         setSub]         = useState(false);
  const [exporting,   setExporting]   = useState(false);

  const setF = k => e => setFiltres(f => ({ ...f, [k]: e.target.value }));

  // Compter les filtres actifs
  const nbFiltresActifs = Object.entries(filtres).filter(
    ([k, v]) => v !== '' && k !== 'search'
  ).length;

  const fetchRdvs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtres.statut)     params.statut     = filtres.statut;
      if (filtres.date_debut) params.date_debut = filtres.date_debut;
      if (filtres.date_fin)   params.date_fin   = filtres.date_fin;
      if (filtres.client)     params.client     = filtres.client;
      if (filtres.entreprise) params.entreprise = filtres.entreprise;
      if (filtres.search)     params.search     = filtres.search;

      const r    = await getRdvs(params);
      const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
      setRdvs(data);
    } catch { toast.error('Erreur de chargement'); }
    finally  { setLoading(false); }
  }, [filtres]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRdvs(), 400); // debounce
    return () => clearTimeout(timer);
  }, [fetchRdvs]);

  const handleTraiter = async () => {
    if (action === 'refuser' && !motif.trim()) {
      toast.error('Le motif de refus est obligatoire'); return;
    }
    setSub(true);
    try {
      await traiterRdv(selected.id, { action, motif_refus: motif });
      toast.success(action === 'confirmer' ? '✅ RDV confirmé !' : '❌ RDV refusé');
      setModTraiter(false); fetchRdvs();
    } catch(e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
    finally { setSub(false); }
  };

  const handleAnnuler = async rdv => {
    if (!window.confirm(`Annuler le RDV #${rdv.id} ?`)) return;
    try { await annulerRdv(rdv.id); toast.success('RDV annulé'); fetchRdvs(); }
    catch(e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
  };

  const openCreer = async () => {
    setModCreer(true);
    try {
      const r = await getDisponibles();
      setCreneaux(Array.isArray(r.data) ? r.data : []);
    } catch { toast.error('Impossible de charger les créneaux'); }
  };

  const handleCreer = async () => {
    if (!newRdv.creneau_id) { toast.error('Choisissez un créneau'); return; }
    setSub(true);
    try {
      await creerRdv({ creneau_id: parseInt(newRdv.creneau_id), description: newRdv.description });
      toast.success('🎉 RDV créé ! Email de confirmation envoyé.', { duration: 5000 });
      setModCreer(false); setNewRdv({ creneau_id: '', description: '' }); fetchRdvs();
    } catch(e) {
      if (e.response?.status === 500) {
        toast('⚠️ RDV possiblement créé. Vérifiez la liste.', { icon: '⚠️', duration: 5000 });
        setModCreer(false); fetchRdvs();
      } else {
        toast.error(e.response?.data?.erreur || 'Erreur');
      }
    } finally { setSub(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (filtres.statut)     params.statut     = filtres.statut;
      if (filtres.date_debut) params.date_debut = filtres.date_debut;
      if (filtres.date_fin)   params.date_fin   = filtres.date_fin;
      if (filtres.client)     params.client     = filtres.client;
      if (filtres.entreprise) params.entreprise = filtres.entreprise;
      if (filtres.search)     params.search     = filtres.search;

      await exportRdvsCsv(params);
      toast.success('📥 Export CSV téléchargé !');
    } catch { toast.error('Erreur lors de l\'export'); }
    finally { setExporting(false); }
  };

  const resetFiltres = () => setFiltres(FILTRES_VIDES);

  if (loading) return (
    <div className="spin-wrap">
      <div className="spinner" />
      <p className="spin-txt">Chargement…</p>
    </div>
  );

  return (
    <div className="fade-up">

      {/* En-tête */}
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Rendez-vous</h1>
          <p className="page-sub">{rdvs.length} résultat{rdvs.length > 1 ? 's' : ''}</p>
        </div>
        <div className="page-acts">
          {/* Export CSV — admin seulement */}
          {isAdmin && (
            <Btn variant="secondary" icon={Download} loading={exporting} onClick={handleExport}>
              Export CSV
            </Btn>
          )}
          {/* Prendre un RDV — client seulement */}
          {isClient && (
            <Btn icon={Plus} onClick={openCreer}>Prendre un RDV</Btn>
          )}
        </div>
      </div>

      {/* Barre de recherche + bouton filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>

        {/* Recherche globale */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
          <input
            value={filtres.search}
            onChange={setF('search')}
            placeholder="Rechercher par nom, email, description, #ID…"
            className="input-field"
            style={{ paddingLeft: 38, width: '100%' }}
          />
          {filtres.search && (
            <button onClick={() => setFiltres(f => ({ ...f, search: '' }))}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtre rapide par statut */}
        <div className="filter-tabs">
          {STATUTS.map(s => (
            <button key={s}
              className={`filter-tab${filtres.statut === s || (s === 'tous' && !filtres.statut) ? ' active' : ''}`}
              onClick={() => setFiltres(f => ({ ...f, statut: s === 'tous' ? '' : s }))}>
              {LABELS[s]}
            </button>
          ))}
        </div>

        {/* Bouton filtres avancés */}
        <button
          onClick={() => setFiltrePaneau(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 'var(--r-md)',
            border: `1.5px solid ${nbFiltresActifs > 0 ? 'var(--primary)' : 'var(--border)'}`,
            background: nbFiltresActifs > 0 ? 'var(--primary-50)' : 'var(--bg-card)',
            color: nbFiltresActifs > 0 ? 'var(--primary)' : 'var(--text-2)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
          }}>
          <Filter size={15} />
          Filtres
          {nbFiltresActifs > 0 && (
            <span style={{ background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 50, minWidth: 18, textAlign: 'center' }}>
              {nbFiltresActifs}
            </span>
          )}
        </button>

        {/* Reset filtres */}
        {nbFiltresActifs > 0 && (
          <button onClick={resetFiltres}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)', background: 'none', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            <X size={13} /> Effacer
          </button>
        )}
      </div>

      {/* Panneau filtres avancés */}
      {filtrePaneau && (
        <div className="card card-p5 fade-up" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>
            Filtres avancés
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>

            <div>
              <label className="input-label">Date début</label>
              <input type="date" className="input-field"
                value={filtres.date_debut} onChange={setF('date_debut')} />
            </div>

            <div>
              <label className="input-label">Date fin</label>
              <input type="date" className="input-field"
                value={filtres.date_fin} onChange={setF('date_fin')} />
            </div>

            {isAdmin && (
              <div>
                <label className="input-label">Client</label>
                <input type="text" className="input-field"
                  placeholder="Nom, prénom ou email…"
                  value={filtres.client} onChange={setF('client')} />
              </div>
            )}

            {isAdmin && (
              <div>
                <label className="input-label">Entreprise</label>
                <input type="text" className="input-field"
                  placeholder="Nom de l'entreprise…"
                  value={filtres.entreprise} onChange={setF('entreprise')} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Résumé des filtres actifs */}
      {(nbFiltresActifs > 0 || filtres.search) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Filtres actifs :</span>
          {filtres.statut && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--primary-50)', color: 'var(--primary)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
              {LABELS[filtres.statut]}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => setFiltres(f => ({ ...f, statut: '' }))} />
            </span>
          )}
          {filtres.date_debut && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e0f2fe', color: '#075985', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
              Depuis {filtres.date_debut}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => setFiltres(f => ({ ...f, date_debut: '' }))} />
            </span>
          )}
          {filtres.date_fin && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e0f2fe', color: '#075985', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
              Jusqu'au {filtres.date_fin}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => setFiltres(f => ({ ...f, date_fin: '' }))} />
            </span>
          )}
          {filtres.client && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f3e8ff', color: '#6b21a8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
              Client : {filtres.client}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => setFiltres(f => ({ ...f, client: '' }))} />
            </span>
          )}
          {filtres.entreprise && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
              Entreprise : {filtres.entreprise}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => setFiltres(f => ({ ...f, entreprise: '' }))} />
            </span>
          )}
          {filtres.search && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', color: '#475569', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
              Recherche : "{filtres.search}"
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => setFiltres(f => ({ ...f, search: '' }))} />
            </span>
          )}
        </div>
      )}

      {/* Tableau */}
      {rdvs.length === 0 ? (
        <Card>
          <Empty icon={Calendar}
            title="Aucun résultat"
            desc={nbFiltresActifs > 0 ? "Aucun RDV ne correspond à vos filtres." : "Aucun rendez-vous trouvé."}
            action={
              nbFiltresActifs > 0
                ? <Btn variant="secondary" icon={X} onClick={resetFiltres}>Effacer les filtres</Btn>
                : isClient && <Btn icon={Plus} onClick={openCreer}>Prendre un RDV</Btn>
            }
          />
        </Card>
      ) : (
        <div className="tbl-wrap card">
          <table className="data-tbl">
            <thead>
              <tr>
                {['#', 'Client', 'Description', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rdvs.map(rdv => (
                <tr key={rdv.id}>
                  <td className="td-bold" style={{ color: 'var(--primary)' }}>#{rdv.id}</td>
                  <td className="td-bold">{rdv.client_nom || `Client #${rdv.client}`}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-3)' }}>
                    {rdv.description || '—'}
                  </td>
                  <td><Badge statut={rdv.statut} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{formatDate(rdv.date_creation)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isAdmin && rdv.statut === 'en_attente' && (
                        <>
                          <Btn size="sm" variant="success" icon={CheckCircle}
                            onClick={() => { setSelected(rdv); setAction('confirmer'); setMotif(''); setModTraiter(true); }}>
                            Confirmer
                          </Btn>
                          <Btn size="sm" variant="danger" icon={XCircle}
                            onClick={() => { setSelected(rdv); setAction('refuser'); setMotif(''); setModTraiter(true); }}>
                            Refuser
                          </Btn>
                        </>
                      )}
                      {isClient && rdv.statut === 'en_attente' && (
                        <Btn size="sm" variant="ghost" icon={Ban} onClick={() => handleAnnuler(rdv)}>
                          Annuler
                        </Btn>
                      )}
                      {rdv.statut === 'refuse' && rdv.motif_refus && (
                        <span title={rdv.motif_refus} style={{ fontSize: 11, color: '#ef4444', cursor: 'help', textDecoration: 'underline dotted' }}>
                          Voir motif
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer tableau */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {rdvs.length} rendez-vous affiché{rdvs.length > 1 ? 's' : ''}
            </span>
            {isAdmin && (
              <Btn size="sm" variant="secondary" icon={Download} loading={exporting} onClick={handleExport}>
                Exporter ces résultats en CSV
              </Btn>
            )}
          </div>
        </div>
      )}

      {/* Modal Traiter */}
      <Modal open={modTraiter} onClose={() => setModTraiter(false)} size="sm"
        title={action === 'confirmer' ? '✅ Confirmer le rendez-vous' : '❌ Refuser le rendez-vous'}>
        <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
          RDV <strong>#{selected?.id}</strong> — {selected?.client_nom}
          {selected?.description && <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-3)' }}>{selected.description}</p>}
        </div>
        {action === 'refuser' && (
          <Textarea label="Motif du refus *" rows={4}
            value={motif} onChange={e => setMotif(e.target.value)}
            placeholder="Expliquez la raison du refus…" />
        )}
        <div className="modal-foot">
          <Btn variant="secondary" onClick={() => setModTraiter(false)}>Annuler</Btn>
          <Btn variant={action === 'confirmer' ? 'success' : 'danger'} loading={sub} onClick={handleTraiter}>
            {action === 'confirmer' ? 'Confirmer' : 'Refuser'}
          </Btn>
        </div>
      </Modal>

      {/* Modal Créer */}
      <Modal open={modCreer} onClose={() => setModCreer(false)} title="📅 Prendre un rendez-vous">
        <Select label="Créneau disponible *"
          value={newRdv.creneau_id}
          onChange={e => setNewRdv(f => ({ ...f, creneau_id: e.target.value }))}>
          <option value="">— Sélectionner un créneau —</option>
          {creneaux.map(c => (
            <option key={c.id} value={c.id}>
              #{c.id} — {formatHeure(c.heure_debut)} à {formatHeure(c.heure_fin)}
            </option>
          ))}
        </Select>
        <div style={{ marginTop: 14 }}>
          <Textarea label="Description (optionnel)" rows={3}
            value={newRdv.description}
            onChange={e => setNewRdv(f => ({ ...f, description: e.target.value }))}
            placeholder="Décrivez votre besoin…" />
        </div>
        <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--text-2)', marginTop: 14 }}>
          📧 Un email de confirmation sera envoyé après validation.
        </div>
        <div className="modal-foot">
          <Btn variant="secondary" onClick={() => setModCreer(false)}>Annuler</Btn>
          <Btn icon={Plus} loading={sub} onClick={handleCreer}>Confirmer</Btn>
        </div>
      </Modal>
    </div>
  );
}