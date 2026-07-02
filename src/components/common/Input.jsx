// src/components/common/Input.jsx
import clsx from 'clsx';
import './Input.css';

export default function Input({ label, error, icon: Icon, className, ...props }) {
  return (
    <div className={clsx('input-group', className)}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <span className="input-icon"><Icon size={16} /></span>}
        <input className={clsx('input-field', Icon && 'input-field--icon', error && 'input-field--error')} {...props} />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
