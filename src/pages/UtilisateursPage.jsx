import { useEffect, useState } from 'react';
import {
  Users, Search, Plus, Edit2, Trash2,
  Power, Mail, Phone, Shield, Eye, EyeOff,
} from 'lucide-react';
import {
  getUtilisateurs, creerUtilisateur,
  modifierUtilisateur, supprimerUtilisateur,
  activerUtilisateur,
} from '../api/auth';
import { extractData, formatDate } from '../utils/helpers';
import {
  Btn, Badge, Modal, Spinner, Empty,
  Card, PageHeader, Input, Select,
} from '../components/common/UI';
import toast from 'react-hot-toast';

const ROLES   = ['client', 'personnel', 'admin'];
const FORM_VIDE = {
  nom: '', prenom: '', email: '', telephone: '',
  role: 'client', password: '', poste: '', is_active: true,
};

export default function UtilisateursPage() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filtreRole, setFiltreRole] = useState('');

  // Modals
  const [modCreer,    setModCreer]    = useState(false);
  const [modModifier, setModModifier] = useState(false);
  const [modSuppr,    setModSuppr]    = useState(false);
  const [selected,    setSelected]    = useState(null);
  const [form,        setForm]        = useState(FORM_VIDE);
  const [showPwd,     setShowPwd]     = useState(false);
  const [sub,         setSub]         = useState(false);
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const fetch = async () => {
    setLoading(true);
    try {
      const r    = await getUtilisateurs(filtreRole ? { role: filtreRole } : {});
      const data = extractData(r);
      setUsers(data);
    } catch { toast.error('Erreur de chargement'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filtreRole]);

  const filtered = users.filter(u =>
    !search || `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  // ── Créer ────────────────────────────────────────────────
  const handleCreer = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.password) {
      toast.error('Nom, prénom, email et mot de passe obligatoires'); return;
    }
    setSub(true);
    try {
      await creerUtilisateur(form);
      toast.success(`✅ ${form.prenom} ${form.nom} créé !`);
      setModCreer(false); setForm(FORM_VIDE); fetch();
    } catch(e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
    finally { setSub(false); }
  };

  // ── Modifier ─────────────────────────────────────────────
  const openModifier = u => {
    setSelected(u);
    setForm({
      nom:       u.nom       || '',
      prenom:    u.prenom    || '',
      email:     u.email     || '',
      telephone: u.telephone || '',
      role:      u.role      || 'client',
      password:  '',
      is_active: u.is_active,
    });
    setModModifier(true);
  };

  const handleModifier = async () => {
    if (!form.nom || !form.prenom || !form.email) {
      toast.error('Nom, prénom et email obligatoires'); return;
    }
    setSub(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      else data.nouveau_mot_de_passe = data.password;
      delete data.password;

      await modifierUtilisateur(selected.id, data);
      toast.success('✅ Utilisateur mis à jour !');
      setModModifier(false); fetch();
    } catch(e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
    finally { setSub(false); }
  };

  // ── Supprimer ────────────────────────────────────────────
  const handleSupprimer = async () => {
    setSub(true);
    try {
      await supprimerUtilisateur(selected.id);
      toast.success(`🗑️ ${selected.prenom} ${selected.nom} supprimé.`);
      setModSuppr(false); fetch();
    } catch(e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
    finally { setSub(false); }
  };

  // ── Activer/Désactiver ───────────────────────────────────
  const handleActiver = async u => {
    const action = u.is_active ? 'désactiver' : 'activer';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} le compte de ${u.prenom} ${u.nom} ?`)) return;
    try {
      await activerUtilisateur(u.id);
      toast.success(`Compte ${action === 'activer' ? 'activé' : 'désactivé'} !`);
      fetch();
    } catch(e) { toast.error(e.response?.data?.erreur || 'Erreur'); }
  };

  if (loading) return <Spinner text="Chargement des utilisateurs…" />;

  const FormUtilisateur = ({ isCreation = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Prénom *" value={form.prenom} onChange={setF('prenom')} placeholder="Jean" />
        <Input label="Nom *"    value={form.nom}    onChange={setF('nom')}    placeholder="Dupont" />
      </div>
      <Input label="Email *" type="email" value={form.email} onChange={setF('email')} placeholder="jean@exemple.com" />
      <Input label="Téléphone" type="tel" value={form.telephone} onChange={setF('telephone')} placeholder="+237 6XX XXX XXX" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Rôle *" value={form.role} onChange={setF('role')}>
          <option value="client">Client</option>
          <option value="personnel">Personnel</option>
          <option value="admin">Admin</option>
        </Select>
        {form.role === 'personnel' && (
          <Input label="Poste" value={form.poste} onChange={setF('poste')} placeholder="Agent, Coordinateur…" />
        )}
      </div>

      <div>
        <label className="input-label">
          {isCreation ? 'Mot de passe *' : 'Nouveau mot de passe (laisser vide = inchangé)'}
        </label>
        <div className="input-wrap">
          <input
            type={showPwd ? 'text' : 'password'}
            className="input-field"
            style={{ paddingRight: 40 }}
            value={form.password}
            onChange={setF('password')}
            placeholder={isCreation ? 'Min. 8 caractères' : 'Laisser vide pour ne pas changer'}
          />
          <button type="button" onClick={() => setShowPwd(s => !s)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', display: 'flex' }}>
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {!isCreation && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label className="input-label" style={{ margin: 0 }}>Compte actif</label>
          <input type="checkbox" checked={form.is_active}
            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
            style={{ width: 16, height: 16, cursor: 'pointer' }} />
        </div>
      )}
    </div>
  );

  return (
    <div className="fade-up">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-sub">{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
        </div>
        <div className="page-acts">
          <Btn icon={Plus} onClick={() => { setForm(FORM_VIDE); setModCreer(true); }}>
            Ajouter un utilisateur
          </Btn>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field" style={{ paddingLeft: 36, width: '100%' }}
            placeholder="Rechercher par nom, prénom ou email…" />
        </div>
        <div className="filter-tabs">
          {['', 'client', 'personnel', 'admin'].map(r => (
            <button key={r} className={`filter-tab${filtreRole === r ? ' active' : ''}`}
              onClick={() => setFiltreRole(r)}>
              {r === '' ? 'Tous' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <Card>
          <Empty icon={Users} title="Aucun utilisateur"
            action={<Btn icon={Plus} onClick={() => setModCreer(true)}>Ajouter</Btn>} />
        </Card>
      ) : (
        <div className="tbl-wrap card">
          <table className="data-tbl">
            <thead>
              <tr>
                {['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Inscrit le', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                      <div>
                        <p className="td-bold" style={{ margin: 0 }}>{u.prenom} {u.nom}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-4)', margin: 0 }}>#{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{u.email}</td>
                  <td style={{ fontSize: 12 }}>{u.telephone || '—'}</td>
                  <td><Badge statut={u.role} /></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: u.is_active ? '#10b981' : '#ef4444' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.is_active ? '#10b981' : '#ef4444' }} />
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{formatDate(u.date_joined)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      
                      <Btn size="sm" variant="ghost" icon={Power}
                        onClick={() => handleActiver(u)}>
                        {u.is_active ? 'Désactiver' : 'Activer'}
                      </Btn>
                      <Btn size="sm" variant="danger" icon={Trash2}
                        onClick={() => { setSelected(u); setModSuppr(true); }}>
                        Suppr.
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Créer */}
      <Modal open={modCreer} onClose={() => setModCreer(false)}
        title="➕ Ajouter un utilisateur" size="md">
        <FormUtilisateur isCreation={true} />
        <div className="modal-foot">
          <Btn variant="secondary" onClick={() => setModCreer(false)}>Annuler</Btn>
          <Btn icon={Plus} loading={sub} onClick={handleCreer}>Créer l'utilisateur</Btn>
        </div>
      </Modal>

      {/* Modal Modifier */}
      <Modal open={modModifier} onClose={() => setModModifier(false)}
        title={`✏️ Modifier — ${selected?.prenom} ${selected?.nom}`} size="md">
        <FormUtilisateur isCreation={false} />
        <div className="modal-foot">
          <Btn variant="secondary" onClick={() => setModModifier(false)}>Annuler</Btn>
          <Btn icon={Edit2} loading={sub} onClick={handleModifier}>Enregistrer</Btn>
        </div>
      </Modal>

      {/* Modal Supprimer */}
      <Modal open={modSuppr} onClose={() => setModSuppr(false)}
        title="🗑️ Supprimer l'utilisateur" size="sm">
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#991b1b', fontWeight: 600, margin: 0 }}>
            ⚠️ Cette action est irréversible !
          </p>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
          Vous allez supprimer définitivement le compte de <strong>{selected?.prenom} {selected?.nom}</strong> ({selected?.email}).
          Tous ses rendez-vous, paiements et données associées seront perdus.
        </p>
        <div className="modal-foot">
          <Btn variant="secondary" onClick={() => setModSuppr(false)}>Annuler</Btn>
          <Btn variant="danger" icon={Trash2} loading={sub} onClick={handleSupprimer}>
            Supprimer définitivement
          </Btn>
        </div>
      </Modal>
    </div>
  );
}