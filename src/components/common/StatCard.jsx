// src/components/common/StatCard.jsx
import clsx from 'clsx';
import './StatCard.css';

export default function StatCard({ title, value, icon: Icon, color = 'primary', trend }) {
  return (
    <div className={clsx('stat-card', `stat-card--${color}`)}>
      <div className="stat-card-body">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value ?? '—'}</p>
          {trend !== undefined && (
            <p className={clsx('stat-trend', trend >= 0 ? 'stat-trend--up' : 'stat-trend--down')}>
              {trend >= 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        <div className="stat-icon-wrap">
          {Icon && <Icon size={24} />}
        </div>
      </div>
    </div>
  );
}
