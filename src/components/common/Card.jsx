// src/components/common/Card.jsx
import clsx from 'clsx';
import './Card.css';

export default function Card({ children, className, padding = 'md', hover = false, onClick }) {
  return (
    <div
      className={clsx('card', `card--${padding}`, hover && 'card--hover', onClick && 'card--clickable', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="card-header">
      <div className="card-header-left">
        {Icon && <div className="card-icon"><Icon size={20} /></div>}
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}
