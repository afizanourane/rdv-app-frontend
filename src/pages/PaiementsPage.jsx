

import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, RotateCcw, Plus,   Download, Send  } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPaiements, confirmerPaiement, rembourserPaiement, initierPaiement } from '../api/paiements';
import { getRdvs } from '../api/rendezvous';
import { extractData, formatDate, formatMontant } from '../utils/helpers';
import { Btn, Badge, Modal, Spinner, Empty, Card, PageHeader, Input, Select } from '../components/common/UI';
import toast from 'react-hot-toast';


import { telechargerRecu, envoyerRecu } from '../api/auth';


const MODES = {
  carte:        'Carte bancaire',
  mobile_money: 'Mobile Money',
  virement:     'Virement',
  especes:      'Espèces',
};

export default function PaiementsPage() {
  const { isAdmin, isClient } = useAuth();
  const [paiements, setPaiements] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [modConf,   setModConf]   = useState(false);
  const [modPayer,  setModPayer]  = useState(false);
  const [ref,       setRef]       = useState('');
  const [rdvs,      setRdvs]      = useState([]);
  const [newPaie,   setNewPaie]   = useState({ rendezvous_id: '', montant: '', mode_paiement: 'mobile_money' });
  const [sub,       setSub]       = useState(false);
  const setP = k => e => setNewPaie(f => ({ ...f, [k]: e.target.value }));

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await getPaiements();
      const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
      setPaiements(data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetch();
    if (isClient) {
      getRdvs({ statut: 'confirme' }).then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
        setRdvs(data);
      }).catch(() => {});
    }
  }, [isClient]);

  const handleConf = async () => {
    if (!ref.trim()) { toast.error('Référence obligatoire'); return; }
    setSub(true);
    try {
      await confirmerPaiement(selected.id, { reference_transaction: ref });
      toast.success('✅ Paiement confirmé ! Email envoyé.');
      setModConf(false); setRef(''); fetch();
    } catch(e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
    finally { setSub(false); }
  };

  const handleRembourser = async p => {
    if (!window.confirm('Confirmer le remboursement ?')) return;
    try { await rembourserPaiement(p.id); toast.success('Remboursement effectué'); fetch(); }
    catch(e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
  };

  const handlePayer = async () => {
    if (!newPaie.rendezvous_id) { toast.error('Choisissez un RDV'); return; }
    if (!newPaie.montant || isNaN(newPaie.montant)) { toast.error('Montant invalide'); return; }
    setSub(true);
    try {
      await initierPaiement({
        rendezvous_id: parseInt(newPaie.rendezvous_id),
        montant:       parseFloat(newPaie.montant),
        mode_paiement: newPaie.mode_paiement,
      });
      toast.success('💳 Paiement initié ! En attente de confirmation.');
      setModPayer(false);
      setNewPaie({ rendezvous_id: '', montant: '', mode_paiement: 'mobile_money' });
      fetch();
    } catch(e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
    finally { setSub(false); }
  };

  if (loading) return (
    <div className="spin-wrap">
      <div className="spinner" />
      <p className="spin-txt">Chargement des paiements…</p>
    </div>
  );

  return (
    <div className="fade-up">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Paiements</h1>
          <p className="page-sub">{paiements.length} paiement{paiements.length > 1 ? 's' : ''}</p>
        </div>
        {/* Bouton "Initier paiement" visible CLIENT seulement */}
        {isClient && (
          <div className="page-acts">
            <Btn icon={Plus} onClick={() => setModPayer(true)}>
              Initier un paiement
            </Btn>
          </div>
        )}
      </div>

      {paiements.length === 0 ? (
        <Card>
          <div className="empty-wrap">
            <div className="empty-icon"><CreditCard size={30} /></div>
            <h3 className="empty-title">Aucun paiement</h3>
            <p className="empty-desc">Les paiements apparaîtront ici après confirmation d'un RDV.</p>
            {isClient && <Btn icon={Plus} onClick={() => setModPayer(true)}>Initier un paiement</Btn>}
          </div>
        </Card>
      ) : (
        <div className="tbl-wrap card">
          <table className="data-tbl">
            <thead>
              <tr>
                {['#', 'RDV', 'Montant', 'Mode', 'Statut', 'Référence', 'Date', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paiements.map(p => (
                <tr key={p.id}>
                  <td className="td-bold" style={{ color: 'var(--primary)' }}>#{p.id}</td>
                  <td>RDV #{p.rendezvous}</td>
                  <td className="td-bold">{formatMontant(p.montant)}</td>
                  <td style={{ fontSize: 12 }}>{MODES[p.mode_paiement] || p.mode_paiement}</td>
                  <td><Badge statut={p.statut} /></td>
                  <td className="td-mono">{p.reference_transaction || <span style={{ color: 'var(--text-4)' }}>—</span>}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{formatDate(p.date_paiement)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* Boutons admin seulement */}
                      {isAdmin && p.statut === 'en_attente' && (
                        <Btn size="sm" variant="success" icon={CheckCircle}
                          onClick={() => { setSelected(p); setRef(''); setModConf(true); }}>
                          Confirmer
                        </Btn>
                      )}
                      {isAdmin && p.statut === 'paye' && (
                        <Btn size="sm" variant="secondary" icon={RotateCcw}
                          onClick={() => handleRembourser(p)}>
                          Rembourser
                        </Btn>
                      )}

                      {/* Button pour le telechargement d'un recu */}
                      {(p.statut === 'paye' || p.statut === 'rembourse') && (
                        <>
                          <Btn size="sm" variant="secondary" icon={Download}
                            onClick={() => { telechargerRecu(p.id); toast.success('Téléchargement en cours…'); }}>
                            PDF
                          </Btn>
                          {isAdmin && (
                            <Btn size="sm" variant="ghost" icon={Send}
                              onClick={async () => {
                                try {
                                  await envoyerRecu(p.id);
                                  toast.success('Reçu envoyé par email !');
                                } catch(e) {
                                  toast.error(e.response?.data?.erreur || 'Erreur envoi');
                                }
                              }}>
                              Email
                            </Btn>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Confirmer — ADMIN */}
      <Modal open={modConf} onClose={() => setModConf(false)} title="Confirmer le paiement">
        <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
          Paiement <strong>#{selected?.id}</strong> — {formatMontant(selected?.montant || 0)}
        </div>
        <Input label="Référence de transaction *" value={ref}
          onChange={e => setRef(e.target.value)} placeholder="Ex: REF-2026-001" />
        <div className="modal-foot">
          <Btn variant="secondary" onClick={() => setModConf(false)}>Annuler</Btn>
          <Btn variant="success" icon={CheckCircle} loading={sub} onClick={handleConf}>Confirmer</Btn>
        </div>
      </Modal>

      {/* Modal Initier paiement — CLIENT */}
      <Modal open={modPayer} onClose={() => setModPayer(false)} title="Initier un paiement">
        <Select label="Rendez-vous confirmé *"
          value={newPaie.rendezvous_id}
          onChange={setP('rendezvous_id')}>
          <option value="">— Sélectionner un RDV confirmé —</option>
          {rdvs.map(r => (
            <option key={r.id} value={r.id}>
              RDV #{r.id} — {r.description || 'Sans description'}
            </option>
          ))}
        </Select>

        <div style={{ marginTop: 14 }}>
          <Input label="Montant (FCFA) *" type="number" min="0"
            placeholder="Ex: 15000"
            value={newPaie.montant} onChange={setP('montant')} />
        </div>

        <div style={{ marginTop: 14 }}>
          <Select label="Mode de paiement *"
            value={newPaie.mode_paiement}
            onChange={setP('mode_paiement')}>
            <option value="mobile_money">Mobile Money</option>
            <option value="carte">Carte bancaire</option>
            <option value="virement">Virement bancaire</option>
            <option value="especes">Espèces</option>
          </Select>
        </div>

        <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--text-2)', marginTop: 14 }}>
          💡 Votre paiement sera en attente de confirmation par un administrateur.
        </div>

        <div className="modal-foot">
          <Btn variant="secondary" onClick={() => setModPayer(false)}>Annuler</Btn>
          <Btn icon={CreditCard} loading={sub} onClick={handlePayer}>Initier le paiement</Btn>
        </div>
      </Modal>
    </div>
  );
}
