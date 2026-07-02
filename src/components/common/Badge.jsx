// src/components/common/Badge.jsx
import clsx from 'clsx';
import './Badge.css';

const STATUT_CONFIG = {
  en_attente: { label: 'En attente', variant: 'warning' },
  confirme:   { label: 'Confirmé',   variant: 'success' },
  refuse:     { label: 'Refusé',     variant: 'danger'  },
  annule:     { label: 'Annulé',     variant: 'default' },
  termine:    { label: 'Terminé',    variant: 'info'    },
  disponible: { label: 'Disponible', variant: 'success' },
  reserve:    { label: 'Réservé',    variant: 'warning' },
  paye:       { label: 'Payé',       variant: 'success' },
  rembourse:  { label: 'Remboursé',  variant: 'info'    },
  echoue:     { label: 'Échoué',     variant: 'danger'  },
};

export default function Badge({ statut, variant, children, size = 'sm' }) {
  const config = statut ? (STATUT_CONFIG[statut] || { label: statut, variant: 'default' }) : null;
  const v = variant || config?.variant || 'default';
  const label = children || config?.label || statut;
  return <span className={clsx('badge', `badge--${v}`, `badge--${size}`)}>{label}</span>;
}
