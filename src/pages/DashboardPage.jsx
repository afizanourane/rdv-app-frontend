// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, CreditCard, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import Card, { CardHeader } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import { getTableauDeBord, getRendezVous } from '../api/rendezvous';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, isAdmin, isClient } = useAuth();
  const [stats, setStats]   = useState(null);
  const [rdvs,  setRdvs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rdvRes] = await Promise.all([
          getRendezVous(),
          isAdmin ? getTableauDeBord().then(r => setStats(r.data)) : Promise.resolve(),
        ]);
        setRdvs(rdvRes.data.results || rdvRes.data || []);
      } catch { } finally { setLoading(false); }
    };
    fetchData();
  }, [isAdmin]);

  if (loading) return <Spinner size="lg" text="Chargement du tableau de bord..." />;

  const rdvEnAttente = rdvs.filter(r => r.statut === 'en_attente').length;
  const rdvConfirmes = rdvs.filter(r => r.statut === 'confirme').length;
  const rdvTermines  = rdvs.filter(r => r.statut === 'termine').length;
  const rdvRecents   = [...rdvs].sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)).slice(0, 5);

  return (
    <div className="dashboard animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">
            Bienvenue, {user?.prenom} — {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="dashboard-stats">
        <StatCard title="Total rendez-vous"    value={rdvs.length}     icon={Calendar}     color="primary" />
        <StatCard title="En attente"           value={rdvEnAttente}    icon={AlertCircle}  color="warning" />
        <StatCard title="Confirmés"            value={rdvConfirmes}    icon={CheckCircle}  color="success" />
        <StatCard title="Terminés"             value={rdvTermines}     icon={TrendingUp}   color="info"    />
        {isAdmin && stats && (
          <>
            <StatCard title="Total utilisateurs" value={stats.utilisateurs?.client + stats.utilisateurs?.admin + stats.utilisateurs?.personnel || 0} icon={Users} color="primary" />
            <StatCard title="RDV refusés" value={stats.rendezvous?.refuse || 0} icon={XCircle} color="danger" />
          </>
        )}
      </div>

      {/* Rendez-vous récents */}
      <div className="dashboard-grid">
        <Card>
          <CardHeader title="Rendez-vous récents" icon={Calendar} subtitle={`${rdvs.length} au total`} />
          {rdvRecents.length === 0 ? (
            <p className="dashboard-empty">Aucun rendez-vous pour l'instant.</p>
          ) : (
            <div className="rdv-list">
              {rdvRecents.map(rdv => (
                <div key={rdv.id} className="rdv-item">
                  <div className="rdv-item-left">
                    <div className="rdv-item-id">#{rdv.id}</div>
                    <div>
                      <p className="rdv-item-client">{rdv.client_nom}</p>
                      <p className="rdv-item-date">
                        {format(new Date(rdv.date_creation), 'd MMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <Badge statut={rdv.statut} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {isAdmin && stats && (
          <Card>
            <CardHeader title="Répartition par statut" icon={TrendingUp} />
            <div className="stats-breakdown">
              {Object.entries(stats.rendezvous || {}).filter(([k]) => k !== 'total').map(([statut, count]) => (
                <div key={statut} className="stats-breakdown-item">
                  <div className="stats-breakdown-left">
                    <Badge statut={statut} />
                    <span className="stats-breakdown-count">{count}</span>
                  </div>
                  <div className="stats-breakdown-bar">
                    <div
                      className="stats-breakdown-fill"
                      style={{ width: `${stats.rendezvous.total ? (count / stats.rendezvous.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
