import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Check } from 'lucide-react';
import { getNotifications, marquerLue, marquerToutesLues } from '../api/notifications';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const [notifs,   setNotifs]  = useState([]);
  const [loading,  setLoading] = useState(true);
  const [nbNonLues, setNb]     = useState(0);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const r = await getNotifications();
      setNotifs(r.data.notifications || []);
      setNb(r.data.non_lues || 0);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarquerLue = async (id) => {
    await marquerLue(id);
    setNotifs(n => n.map(x => x.id === id ? { ...x, est_lue: true } : x));
    setNb(n => Math.max(0, n - 1));
  };

  const handleToutLire = async () => {
    await marquerToutesLues();
    setNotifs(n => n.map(x => ({ ...x, est_lue: true })));
    setNb(0);
    toast.success('Toutes les notifications marquées comme lues');
  };

  const TYPE_COLORS = { rendezvous: 'primary', paiement: 'success', systeme: 'default' };

  if (loading) return <Spinner size="lg" text="Chargement..." />;

  return (
    <div className="notif-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{nbNonLues} non lue{nbNonLues > 1 ? 's' : ''}</p>
        </div>
        {nbNonLues > 0 && (
          <Button icon={CheckCheck} variant="secondary" onClick={handleToutLire}>
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Card padding="sm">
        {notifs.length === 0 ? (
          <EmptyState icon={Bell} title="Aucune notification" description="Vous n'avez pas encore de notifications." />
        ) : (
          <div className="notif-list">
            {notifs.map(n => (
              <div key={n.id} className={clsx('notif-item', !n.est_lue && 'notif-item--unread')}>
                <div className="notif-dot-wrap">
                  {!n.est_lue && <span className="notif-dot" />}
                </div>
                <div className="notif-content">
                  <div className="notif-header">
                    <h4 className="notif-title">{n.titre}</h4>
                    <div className="notif-meta">
                      <Badge variant={TYPE_COLORS[n.type_notification]} size="sm">{n.type_notification}</Badge>
                      <span className="notif-date">
                        {format(new Date(n.date_creation), 'd MMM à HH:mm', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  <p className="notif-message">{n.message}</p>
                </div>
                {!n.est_lue && (
                  <button className="notif-lire-btn" onClick={() => handleMarquerLue(n.id)} title="Marquer comme lu">
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
