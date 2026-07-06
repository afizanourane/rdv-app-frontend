import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin     from '@fullcalendar/daygrid';
import timeGridPlugin    from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin        from '@fullcalendar/list';
import {
  Clock, User, FileText, CheckCircle,
  X, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { useAuth }       from '../context/AuthContext';
import { getEvenements } from '../api/calendrier';
import { Badge }         from '../components/common/UI';
import toast from 'react-hot-toast';

export default function CalendrierPage() {
  const calRef = useRef(null);
  const [evs,      setEvs]      = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sel,      setSel]      = useState(null);
  const [stats,    setStats]    = useState({ total_rdv: 0, total_creneaux: 0 });
  const [vue,      setVue]      = useState('dayGridMonth');
  const [showCrn,  setShowCrn]  = useState(true);
  const [refresh,  setRefresh]  = useState(0);

  useEffect(() => {
    setLoading(true);
    getEvenements()
      .then(r => {
        setEvs(r.data.evenements || []);
        setStats({
          total_rdv:      r.data.total_rdv      || 0,
          total_creneaux: r.data.total_creneaux || 0,
        });
      })
      .catch(() => toast.error('Erreur chargement calendrier'))
      .finally(() => setLoading(false));
  }, [refresh]);

  const evsFiltres = showCrn
    ? evs
    : evs.filter(e => e.extendedProps?.type !== 'creneau');

  const handleEventClick = ({ event }) => {
    setSel({
      id:    event.id,
      title: event.title,
      start: event.start,
      end:   event.end,
      color: event.backgroundColor,
      ...event.extendedProps,
    });
  };

  const formatDateHeure = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatHeure = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const VUES = [
    { id: 'dayGridMonth', label: 'Mois'    },
    { id: 'timeGridWeek', label: 'Semaine' },
    { id: 'timeGridDay',  label: 'Jour'    },
    { id: 'listWeek',     label: 'Liste'   },
  ];

  const changeVue = (id) => {
    setVue(id);
    calRef.current?.getApi().changeView(id);
  };

  return (
    <div className="fade-up">

      {/* ── En-tête ─────────────────────────────────────────── */}
      <div className="page-hdr" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Calendrier</h1>
          <p className="page-sub">
            {stats.total_rdv} RDV · {stats.total_creneaux} créneaux
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Rafraîchir */}
          <button onClick={() => setRefresh(r => r + 1)}
            disabled={loading}
            style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>

          {/* Toggle créneaux */}
          <button onClick={() => setShowCrn(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${showCrn ? 'var(--primary)' : 'var(--border)'}`, background: showCrn ? 'var(--primary-50)' : 'var(--bg-card)', color: showCrn ? 'var(--primary)' : 'var(--text-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            {showCrn ? <Eye size={14} /> : <EyeOff size={14} />}
            {showCrn ? 'Créneaux visibles' : 'Créneaux masqués'}
          </button>

          {/* Sélecteur de vue */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 9, padding: 3, gap: 2 }}>
            {VUES.map(v => (
              <button key={v.id} onClick={() => changeVue(v.id)}
                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: vue === v.id ? 'var(--primary)' : 'none', color: vue === v.id ? '#fff' : 'var(--text-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all .15s' }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Légende ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { dot: '#f59e0b', label: 'En attente' },
          { dot: '#10b981', label: 'Confirmé'   },
          { dot: '#6366f1', label: 'Terminé'    },
          { dot: '#0ea5e9', label: 'Créneau dispo.' },
          { dot: '#eab308', label: 'Créneau réservé' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: l.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* ── Calendrier ──────────────────────────────────────── */}
      <div className="card card-p5" style={{ overflow: 'hidden' }}>
        <style>{`
          .fc { font-family: 'Inter', sans-serif !important; }
          .fc-toolbar-title { font-size: 17px !important; font-weight: 800 !important; color: var(--text-1) !important; text-transform: capitalize; }
          .fc-button-primary {
            background: var(--bg-card) !important;
            border: 1.5px solid var(--border) !important;
            color: var(--text-2) !important;
            border-radius: 8px !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            padding: 6px 14px !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          .fc-button-primary:hover:not(:disabled) {
            background: var(--bg-hover) !important;
            border-color: var(--border-strong) !important;
            color: var(--text-1) !important;
          }
          .fc-button-primary:not(:disabled).fc-button-active,
          .fc-button-primary:not(:disabled):active {
            background: var(--primary) !important;
            border-color: var(--primary) !important;
            color: #fff !important;
          }
          .fc-button-primary:disabled { opacity: .5 !important; }
          .fc-button-group .fc-button-primary { border-radius: 0 !important; }
          .fc-button-group .fc-button-primary:first-child { border-radius: 8px 0 0 8px !important; }
          .fc-button-group .fc-button-primary:last-child  { border-radius: 0 8px 8px 0 !important; }
          .fc-today-button { border-radius: 8px !important; }
          .fc-day-today { background: rgba(16,185,129,.05) !important; }
          .fc-day-today .fc-daygrid-day-number {
            background: var(--primary) !important;
            color: #fff !important;
            border-radius: 50% !important;
            width: 26px; height: 26px;
            display: flex; align-items: center; justify-content: center;
            font-weight: 800 !important;
          }
          .fc-event {
            cursor: pointer !important;
            border-radius: 6px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            padding: 2px 6px !important;
            border-width: 1.5px !important;
            transition: opacity .15s !important;
          }
          .fc-event:hover { opacity: .85 !important; }
          .fc-col-header-cell {
            background: var(--bg-hover) !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            color: var(--text-4) !important;
            text-transform: uppercase !important;
            letter-spacing: .06em !important;
            padding: 10px 0 !important;
          }
          .fc-scrollgrid, .fc td, .fc th { border-color: var(--border) !important; }
          .fc-daygrid-day-number { font-size: 13px !important; color: var(--text-2) !important; padding: 6px 8px !important; }
          .fc-list-event:hover td { background: var(--bg-hover) !important; cursor: pointer !important; }
          .fc-list-event-dot { border-color: currentColor !important; }
          .fc-timegrid-slot { height: 44px !important; }
          .fc-timegrid-slot-label { font-size: 11px !important; color: var(--text-4) !important; }
          .fc-toolbar { margin-bottom: 18px !important; flex-wrap: wrap !important; gap: 8px !important; }
          .fc-more-link { font-size: 10px !important; font-weight: 700 !important; color: var(--primary) !important; }
          .fc-popover { border-radius: 12px !important; border: 1px solid var(--border) !important; box-shadow: var(--shadow-md) !important; background: var(--bg-card) !important; }
          .fc-popover-header { background: var(--bg-hover) !important; border-radius: 12px 12px 0 0 !important; font-size: 12px !important; font-weight: 700 !important; }
          .fc-list-sticky .fc-list-day-cushion { background: var(--bg-hover) !important; font-size: 12px !important; font-weight: 700 !important; color: var(--text-2) !important; }
          .fc-now-indicator-line { border-color: #ef4444 !important; border-width: 2px !important; }
          .fc-now-indicator-arrow { border-top-color: #ef4444 !important; }
        `}</style>

        {loading ? (
          <div className="spin-wrap" style={{ padding: 48 }}>
            <div className="spinner" />
            <p className="spin-txt">Chargement…</p>
          </div>
        ) : (
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale="fr"
            events={evsFiltres}
            eventClick={handleEventClick}
            headerToolbar={{
              left:   'prev,next today',
              center: 'title',
              right:  '',
            }}
            height="auto"
            dayMaxEvents={4}
            moreLinkText={n => `+${n} autres`}
            moreLinkClick="popover"
            nowIndicator={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: '08:00',
              endTime:   '19:00',
            }}
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            weekNumbers={false}
            firstDay={1}
            buttonText={{
              today:    "Aujourd'hui",
              month:    'Mois',
              week:     'Semaine',
              day:      'Jour',
              list:     'Liste',
            }}
            noEventsText="Aucun événement"
            eventTimeFormat={{
              hour:   '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
          />
        )}
      </div>

      {/* ── Modal détail événement ───────────────────────────── */}
      {sel && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setSel(null)}>
          <div
            className="card scale-in"
            style={{ width: '100%', maxWidth: 420, padding: 0, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{
              padding: '18px 22px',
              background: sel.type === 'rdv'
                ? (sel.statut === 'confirme' ? '#10b981' : sel.statut === 'en_attente' ? '#f59e0b' : '#6366f1')
                : (sel.statut === 'reserve' ? '#fef3c7' : '#e0f2fe'),
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: sel.type === 'rdv' ? 'rgba(255,255,255,.8)' : '#075985', margin: 0 }}>
                  {sel.type === 'rdv' ? 'Rendez-vous' : 'Créneau'}
                </p>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: sel.type === 'rdv' ? '#fff' : '#0c4a6e', margin: '4px 0 0' }}>
                  {sel.type === 'rdv' ? `RDV #${sel.rdv_id}` : `Créneau #${sel.creneau_id}`}
                </h3>
              </div>
              <button onClick={() => setSel(null)}
                style={{ padding: 7, borderRadius: 8, border: 'none', background: 'rgba(0,0,0,.15)', color: sel.type === 'rdv' ? '#fff' : '#075985', cursor: 'pointer', display: 'flex' }}>
                <X size={15} />
              </button>
            </div>

            {/* Infos */}
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>

              {sel.type === 'rdv' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={15} style={{ color: 'var(--text-4)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-3)', minWidth: 80 }}>Statut</span>
                  <Badge statut={sel.statut} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Clock size={15} style={{ color: 'var(--text-4)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Horaire</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>
                    {formatDateHeure(sel.start)}
                  </p>
                  {sel.end && (
                    <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
                      Fin : {formatHeure(sel.end)}
                    </p>
                  )}
                </div>
              </div>

              {sel.client && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <User size={15} style={{ color: 'var(--text-4)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Client</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{sel.client}</p>
                  </div>
                </div>
              )}

              {sel.personnel && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <User size={15} style={{ color: 'var(--text-4)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Personnel</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{sel.personnel}</p>
                  </div>
                </div>
              )}

              {sel.description && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <FileText size={15} style={{ color: 'var(--text-4)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Description</p>
                    <p style={{ fontSize: 13, color: 'var(--text-1)', margin: 0, lineHeight: 1.5 }}>{sel.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSel(null)}
                style={{ padding: '8px 20px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg-hover)', color: 'var(--text-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
