import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageCircle, Send, Plus, X, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';
function getToken() { return localStorage.getItem('access_token') || ''; }
function authHeaders() { return { Authorization: `Bearer ${getToken()}` }; }

function formatDateMsg(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// =============================================================
//   MODAL — Nouvelle conversation
// =============================================================
function NouvelleConvModal({ onClose, onCreer, isClient, isAdmin, isPersonnel }) {
  const [type,       setType]       = useState(isClient ? 'client_personnel' : 'admin_personnel');
  const [rdvId,      setRdvId]      = useState('');
  const [rdvs,       setRdvs]       = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [personnelId,setPersonnelId]= useState('');
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    async function charger() {
      try {
        if (isClient) {
          // Client : charge ses RDV confirmés
          const r = await axios.get(`${API}/rendezvous/?statut=confirme`, { headers: authHeaders() });
          const rdvsData = Array.isArray(r.data) ? r.data : r.data.results || [];
          setRdvs(rdvsData);
        } else {
          // Admin : charge tous les personnels
          const r2 = await axios.get(`${API}/users/?role=personnel`, { headers: authHeaders() });
          setPersonnels(Array.isArray(r2.data) ? r2.data : r2.data.results || []);
        }
      } catch {}
    }
    charger();
  }, [isClient]);

  // Pour le client — récupère le personnel du RDV choisi
  const rdvChoisi = rdvs.find(r => String(r.id) === String(rdvId));

  async function creer() {
    setLoading(true);
    try {
      let body = {};

      if (isClient) {
        // Client : utilise le personnel_profil_id du RDV choisi
        if (!rdvId) { toast.error('Choisissez un RDV.'); setLoading(false); return; }
        const pid = rdvChoisi?.personnel_profil_id;
        if (!pid) { toast.error('Personnel introuvable pour ce RDV.'); setLoading(false); return; }
        body = { type: 'client_personnel', personnel_id: pid, rdv_id: rdvId };
      } else {
        // Admin : utilise le personnel choisi dans le select
        if (!personnelId) { toast.error('Choisissez un personnel.'); setLoading(false); return; }
        body = { type: 'admin_personnel', personnel_id: personnelId };
      }

      const r = await axios.post(`${API}/conversations/`, body, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });
      onCreer(r.data.id);
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Erreur lors de la création.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 24, width: 420, maxWidth: '90vw',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
            Nouvelle conversation
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Client — choisit un RDV confirmé */}
        {isClient && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
              Rendez-vous concerné <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={rdvId}
              onChange={e => setRdvId(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            >
              <option value="">Choisir un RDV confirmé…</option>
              {rdvs.map(r => (
                <option key={r.id} value={r.id}>
                  RDV #{r.id} — {r.personnel_nom || 'Personnel'} — {r.service_nom || r.description || ''}
                </option>
              ))}
            </select>
            {rdvs.length === 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                Aucun RDV confirmé. Faites confirmer un RDV d'abord.
              </p>
            )}

            {/* Affiche automatiquement le personnel du RDV choisi */}
            {rdvChoisi && (
              <div style={{
                marginTop: 12, background: 'var(--bg-hover)',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 4px' }}>
                  Vous allez discuter avec
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>
                  {rdvChoisi.personnel_nom}
                </p>
                {rdvChoisi.entreprise_nom && (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '2px 0 0' }}>
                    {rdvChoisi.entreprise_nom}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Admin — choisit un personnel */}
        {isAdmin && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
              Personnel <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={personnelId}
              onChange={e => setPersonnelId(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            >
              <option value="">Choisir un professionnel…</option>
              {personnels.map(p => (
                <option key={p.id} value={p.profil_personnel_id}>
                  {p.prenom} {p.nom}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            onClick={creer}
            disabled={loading}
            style={{
              flex: 1, padding: '10px', background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Création…' : 'Démarrer la conversation'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px', background: 'none',
              border: '1px solid var(--border)', borderRadius: 8,
              fontSize: 14, color: 'var(--text-2)', cursor: 'pointer',
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
//   ZONE DE MESSAGES
// =============================================================
function ZoneMessages({ convId, user }) {
  const [messages,  setMessages]  = useState([]);
  const [contenu,   setContenu]   = useState('');
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const intervalRef = useRef(null);

  const chargerMessages = useCallback(async () => {
    try {
      const r = await axios.get(
        `${API}/conversations/${convId}/messages/`,
        { headers: authHeaders() }
      );
      setMessages(Array.isArray(r.data) ? r.data : []);
    } catch {}
    finally { setLoading(false); }
  }, [convId]);

  useEffect(() => {
    setLoading(true);
    chargerMessages();
    intervalRef.current = setInterval(chargerMessages, 5000);
    return () => clearInterval(intervalRef.current);
  }, [convId, chargerMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function envoyer() {
    if (!contenu.trim()) return;
    setSending(true);
    try {
      const r = await axios.post(
        `${API}/conversations/${convId}/messages/`,
        { contenu: contenu.trim() },
        { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
      );
      setMessages(m => [...m, r.data]);
      setContenu('');
      inputRef.current?.focus();
    } catch {
      toast.error("Erreur lors de l'envoi.");
    } finally { setSending(false); }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, marginTop: 40 }}>
            <MessageCircle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p style={{ margin: 0 }}>Aucun message — démarrez la conversation !</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const estMoi  = msg.est_moi;
          const prevMsg = messages[i - 1];
          const memeExp = prevMsg && prevMsg.expediteur?.id === msg.expediteur?.id;

          return (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: estMoi ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: 8,
            }}>
              {!memeExp && !estMoi && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary-50)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {msg.expediteur?.nom?.[0] || '?'}
                </div>
              )}
              {memeExp && !estMoi && <div style={{ width: 32, flexShrink: 0 }} />}

              <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: estMoi ? 'flex-end' : 'flex-start' }}>
                {!memeExp && !estMoi && (
                  <span style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3, fontWeight: 600 }}>
                    {msg.expediteur?.nom}
                  </span>
                )}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: estMoi ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: estMoi ? 'var(--primary)' : 'var(--bg-hover)',
                  color: estMoi ? '#fff' : 'var(--text-1)',
                  fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                }}>
                  {msg.contenu}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                  {formatDateMsg(msg.date_envoi)}
                  {estMoi && <span style={{ marginLeft: 4 }}>{msg.est_lu ? '✓✓' : '✓'}</span>}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Saisie */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 10, alignItems: 'flex-end',
        background: 'var(--bg-card)',
      }}>
        <textarea
          ref={inputRef}
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez votre message… (Entrée pour envoyer)"
          rows={1}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 20,
            border: '1px solid var(--border)', background: 'var(--bg-main)',
            color: 'var(--text-1)', fontSize: 14, resize: 'none', outline: 'none',
            fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
            maxHeight: 120, overflowY: 'auto',
          }}
        />
        <button
          onClick={envoyer}
          disabled={sending || !contenu.trim()}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: contenu.trim() ? 'var(--primary)' : 'var(--bg-hover)',
            border: 'none', cursor: contenu.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          <Send size={16} color={contenu.trim() ? '#fff' : 'var(--text-3)'} />
        </button>
      </div>
    </div>
  );
}

// =============================================================
//   PAGE PRINCIPALE
// =============================================================
export default function ChatPage() {
  const { user, isClient, isAdmin, isPersonnel } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [convActive,    setConvActive]    = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [search,        setSearch]        = useState('');

  const chargerConvs = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/conversations/`, { headers: authHeaders() });
      setConversations(Array.isArray(r.data) ? r.data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    chargerConvs();
    const interval = setInterval(chargerConvs, 10000);
    return () => clearInterval(interval);
  }, [chargerConvs]);

  function handleConvCreee(convId) {
    setShowModal(false);
    chargerConvs();
    setConvActive(convId);
  }

  const convsFiltrees = conversations.filter(c => {
    if (!search.trim()) return true;
    return c.interlocuteur?.nom?.toLowerCase().includes(search.toLowerCase());
  });

  const convSelec = conversations.find(c => c.id === convActive);

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 120px)',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden',
    }}>

      {/* Sidebar */}
      <div style={{ width: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Messages</h2>
            {!isPersonnel && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--primary)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <Plus size={16} color="#fff" />
              </button>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{
                width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-main)',
                color: 'var(--text-1)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {!loading && convsFiltrees.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-3)' }}>
              <MessageCircle size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ fontSize: 13, margin: 0 }}>{search ? 'Aucun résultat' : 'Aucune conversation'}</p>
              {!search && !isPersonnel && (
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    marginTop: 12, padding: '8px 14px', background: 'var(--primary)',
                    color: '#fff', border: 'none', borderRadius: 8,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Nouvelle conversation
                </button>
              )}
            </div>
          )}

          {convsFiltrees.map(conv => (
            <button
              key={conv.id}
              onClick={() => setConvActive(conv.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 16px',
                background: convActive === conv.id ? 'var(--primary-bg)' : 'transparent',
                border: 'none',
                borderLeft: convActive === conv.id ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: convActive === conv.id ? 'var(--primary)' : 'var(--bg-hover)',
                color: convActive === conv.id ? '#fff' : 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
              }}>
                {conv.interlocuteur?.nom?.[0] || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.interlocuteur?.nom || 'Inconnu'}
                  </span>
                  {conv.dernier_message && (
                    <span style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0, marginLeft: 4 }}>
                      {formatDateMsg(conv.dernier_message.date)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {conv.dernier_message
                      ? `${conv.dernier_message.expediteur} : ${conv.dernier_message.contenu.slice(0, 30)}${conv.dernier_message.contenu.length > 30 ? '…' : ''}`
                      : conv.interlocuteur?.role || ''}
                  </span>
                  {conv.nb_non_lus > 0 && (
                    <span style={{
                      background: 'var(--primary)', color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '1px 6px',
                      borderRadius: 20, marginLeft: 6, flexShrink: 0,
                    }}>
                      {conv.nb_non_lus}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!convActive ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
            <MessageCircle size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px', color: 'var(--text-2)' }}>
              Sélectionnez une conversation
            </p>
            <p style={{ fontSize: 13, margin: 0 }}>ou créez-en une nouvelle avec le bouton +</p>
          </div>
        ) : (
          <>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--primary-50)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>
                {convSelec?.interlocuteur?.nom?.[0] || '?'}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                  {convSelec?.interlocuteur?.nom || 'Conversation'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>
                  {convSelec?.interlocuteur?.role}
                  {convSelec?.interlocuteur?.entreprise && ` · ${convSelec.interlocuteur.entreprise}`}
                  {convSelec?.rdv_id && ` · RDV #${convSelec.rdv_id}`}
                </p>
              </div>
            </div>
            <ZoneMessages convId={convActive} user={user} />
          </>
        )}
      </div>

      {showModal && (
        <NouvelleConvModal
          onClose={() => setShowModal(false)}
          onCreer={handleConvCreee}
          isClient={isClient}
          isAdmin={isAdmin}
          isPersonnel={isPersonnel}
        />
      )}
    </div>
  );
}
