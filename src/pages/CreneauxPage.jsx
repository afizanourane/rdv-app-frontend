import { useEffect, useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCreneaux, getDisponibles, creerCreneau } from '../api/creneaux';
import { formatHeure } from '../utils/helpers';
import { Btn, Badge, Modal, Spinner, Empty, Card, PageHeader, Input } from '../components/common/UI';
import toast from 'react-hot-toast';

export default function CreneauxPage() {
  const { isClient, isAdmin, isPersonnel } = useAuth();
  const [creneaux, setCreneaux] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modCreer, setModCreer] = useState(false);
  const [form,     setForm]     = useState({ heure_debut: '', heure_fin: '' });
  const [sub,      setSub]      = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const fetch = async () => {
    setLoading(true);
    try {
      const r = isClient ? await getDisponibles() : await getCreneaux();
      const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
      setCreneaux(data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleCreer = async () => {
    if (!form.heure_debut || !form.heure_fin) {
      toast.error('Heures obligatoires');
      return;
    }
    if (form.heure_debut >= form.heure_fin) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }
    setSub(true);
    try {
      await creerCreneau({ heure_debut: form.heure_debut, heure_fin: form.heure_fin });
      toast.success('✅ Créneau créé avec succès !');
      setModCreer(false);
      setForm({ heure_debut: '', heure_fin: '' });
      fetch();
    } catch(e) { toast.error(e.response?.data?.erreur || 'Erreur lors de la création'); }
    finally { setSub(false); }
  };

  if (loading) return (
    <div className="spin-wrap">
      <div className="spinner" />
      <p className="spin-txt">Chargement des créneaux…</p>
    </div>
  );

  return (
    <div className="fade-up">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">{isClient ? 'Créneaux disponibles' : 'Gestion des créneaux'}</h1>
          <p className="page-sub">{creneaux.length} créneau{creneaux.length > 1 ? 'x' : ''}</p>
        </div>
        {/* Bouton Créer — ADMIN ou PERSONNEL seulement */}
        {(isAdmin || isPersonnel) && (
          <div className="page-acts">
            <Btn icon={Plus} onClick={() => setModCreer(true)}>Créer un créneau</Btn>
          </div>
        )}
      </div>

      {creneaux.length === 0 ? (
        <Card>
          <Empty icon={Clock}
            title="Aucun créneau"
            desc={isClient ? "Aucun créneau disponible pour l'instant." : "Créez le premier créneau."}
            action={(isAdmin || isPersonnel) && (
              <Btn icon={Plus} onClick={() => setModCreer(true)}>Créer un créneau</Btn>
            )}
          />
        </Card>
      ) : (
        <div className="tbl-wrap card">
          <table className="data-tbl">
            <thead>
              <tr>
                {['#', 'Personnel', 'Heure début', 'Heure fin', 'Statut'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creneaux.map(c => (
                <tr key={c.id}>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {c.jour_semaine || '—'}
                  </td>
                  <td><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                      {c.personnel_nom || `Personnel #${c.personnel}`}
                    </div>
                    {c.entreprise_nom && (
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                        {c.entreprise_nom}
                      </div>
                    )}
                    {c.domaine_nom && (
                      <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 1 }}>
                        {c.domaine_nom}
                      </div>
                    )}
                  </td>
                  <td className="td-bold">{formatHeure(c.heure_debut)}</td>
                  <td className="td-bold">{formatHeure(c.heure_fin)}</td>
                  <td><Badge statut={c.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Créer — ADMIN / PERSONNEL seulement */}
      {(isAdmin || isPersonnel) && (
        <Modal open={modCreer} onClose={() => setModCreer(false)} size="sm"
          title="Créer un créneau">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="Heure de début *" type="time"
              value={form.heure_debut} onChange={set('heure_debut')} />
            <Input label="Heure de fin *" type="time"
              value={form.heure_fin} onChange={set('heure_fin')} />
          </div>

          <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--text-2)', marginTop: 14 }}>
            💡 {isPersonnel ? 'Le créneau sera assigné à votre profil.' : 'Le créneau sera assigné au premier personnel disponible.'}
          </div>

          <div className="modal-foot">
            <Btn variant="secondary" onClick={() => setModCreer(false)}>Annuler</Btn>
            <Btn icon={Plus} loading={sub} onClick={handleCreer}>Créer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
