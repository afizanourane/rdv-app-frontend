// Composants UI réutilisables
import { Loader2, X } from 'lucide-react';

export function Btn({ children, variant='primary', size='md', loading, icon:Icon, full, className='', disabled, type='button', onClick }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      className={`btn btn-${variant} btn-${size}${full?' btn-full':''} ${className}`}>
      {loading ? <Loader2 size={14} className="spin" /> : Icon ? <Icon size={14} /> : null}
      {children && <span>{children}</span>}
    </button>
  );
}

const BADGE_LABELS = {
  en_attente:'En attente', confirme:'Confirmé', refuse:'Refusé',
  annule:'Annulé', termine:'Terminé', disponible:'Disponible',
  reserve:'Réservé', paye:'Payé', rembourse:'Remboursé', echoue:'Échoué',
  client:'Client', admin:'Admin', personnel:'Personnel',
};
export function Badge({ statut, children }) {
  const cls = `badge b-${statut}`;
  return <span className={cls}>{children || BADGE_LABELS[statut] || statut}</span>;
}

export function Spinner({ text='Chargement...' }) {
  return (
    <div className="spin-wrap">
      <div className="spinner" />
      {text && <p className="spin-txt">{text}</p>}
    </div>
  );
}

export function Empty({ icon:Icon, title, desc, action }) {
  return (
    <div className="empty-wrap">
      {Icon && <div className="empty-icon"><Icon size={30} /></div>}
      <h3 className="empty-title">{title}</h3>
      {desc && <p className="empty-desc">{desc}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, size='md' }) {
  if (!open) return null;
  return (
    <div className="modal-overlay scale-in" onClick={onClose}>
      <div className={`modal-box modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Input({ label, error, icon:Icon, hint, className='', ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }} className={className}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrap">
        {Icon && <span className="input-ico"><Icon size={15} /></span>}
        <input className={`input-field${Icon?' input-icon-field':''}${error?' input-field-error':''}`} {...props} />
      </div>
      {error && <span className="input-err">{error}</span>}
      {hint  && <span style={{ fontSize:11.5, color:'var(--text-4)' }}>{hint}</span>}
    </div>
  );
}

export function Select({ label, error, children, className='', ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }} className={className}>
      {label && <label className="input-label">{label}</label>}
      <select className={`select-field${error?' input-field-error':''}`} {...props}>{children}</select>
      {error && <span className="input-err">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className='', ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }} className={className}>
      {label && <label className="input-label">{label}</label>}
      <textarea className={`textarea-field${error?' input-field-error':''}`} {...props} />
      {error && <span className="input-err">{error}</span>}
    </div>
  );
}

export function Card({ children, className='', padding='card-p6', hover, onClick }) {
  return (
    <div className={`card ${padding}${hover?' card-hover':''} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon:Icon, color='si-green', sub, trend }) {
  return (
    <div className="card card-p5 stat-card">
      <div className="stat-top">
        <div>
          <div className="stat-label">{title}</div>
          <div className="stat-value" style={{ marginTop:6 }}>{value ?? '—'}</div>
          {sub && <div className="stat-sub" style={{ marginTop:4 }}>{sub}</div>}
        </div>
        <div className={`stat-icon ${color}`}>
          {Icon && <Icon size={22} />}
        </div>
      </div>
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% ce mois
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-hdr">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {action && <div className="page-acts">{action}</div>}
    </div>
  );
}
