import { useEffect, useState } from 'react';
import { Layers, Plus, X, ChevronRight, Building2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

function getToken() {
  return localStorage.getItem('access_token') || '';
}
function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export default function DomainesPage() {
  const { isAdmin } = useAuth();
  const [domaines, setDomaines]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ nom_domaine: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  async function charger() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/domaines/`, { headers: authHeaders() });
      setDomaines(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      toast.error('Impossible de charger les domaines.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { charger(); }, []);

  async function creerDomaine(e) {
    e.preventDefault();
    if (!form.nom_domaine.trim()) {
      toast.error('Le nom du domaine est obligatoire.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/domaines/`, form, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });
      toast.success(`Domaine "${form.nom_domaine}" créé !`);
      setForm({ nom_domaine: '', description: '' });
      setShowForm(false);
      charger();
    } catch (err) {
      toast.error(err.response?.data?.nom_domaine?.[0] || 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  }

  // Couleurs cycliques pour les cartes
  const COULEURS = [
    { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
    { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
    { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
    { bg: '#f0fdf4', text: '#166534', border: '#4ade80' },
    { bg: '#f0f9ff', text: '#0369a1', border: '#38bdf8' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-3)', marginTop: 12, fontSize: 14 }}>Chargement…</p>
    </div>
  );

  return (
    <div className="fade-up">

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Domaines</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '4px 0 0' }}>
            {domaines.length} domaine{domaines.length > 1 ? 's' : ''} disponible{domaines.length > 1 ? 's' : ''}
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
            {showForm ? <><X size={15} /> Annuler</> : <><Plus size={15} /> Nouveau domaine</>}
          </button>
        )}
      </div>

      {/* Formulaire de création */}
      {showForm && isAdmin && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 16px' }}>
            Nouveau domaine
          </h3>
          <form onSubmit={creerDomaine}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                  Nom du domaine <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.nom_domaine}
                  onChange={e => setForm(f => ({ ...f, nom_domaine: e.target.value }))}
                  placeholder="Ex : Santé, Coiffure, Informatique…"
                  className="input-field"
                  style={{ width: '100%' }}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                  Description <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Courte description du domaine…"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 24px', background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Création…' : 'Créer le domaine'}
            </button>
          </form>
        </div>
      )}

      {/* Liste des domaines */}
      {domaines.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <Layers size={36} style={{ color: 'var(--text-3)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-3)', margin: 0 }}>Aucun domaine créé pour l'instant.</p>
          {isAdmin && <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '8px 0 0' }}>Créez votre premier domaine avec le bouton ci-dessus.</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {domaines.map((d, i) => {
            const couleur = COULEURS[i % COULEURS.length];
            return (
              <div
                key={d.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '20px',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Icône colorée */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: couleur.bg, color: couleur.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14, fontSize: 18, fontWeight: 800,
                  border: `1px solid ${couleur.border}`,
                }}>
                  {d.nom_domaine[0].toUpperCase()}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
                  {d.nom_domaine}
                </h3>

                {d.description && (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {d.description}
                  </p>
                )}

                {/* Lien vers entreprises de ce domaine */}
                <a
                  href={`/entreprises?domaine=${d.id}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: couleur.text, fontWeight: 600,
                    textDecoration: 'none', marginTop: d.description ? 0 : 8,
                  }}
                >
                  <Building2 size={12} />
                  Voir les entreprises
                  <ChevronRight size={12} />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
