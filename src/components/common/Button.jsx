// src/components/common/Button.jsx
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import './Button.css';

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, icon: Icon, fullWidth = false,
  className, disabled, ...props
}) {
  return (
    <button
      className={clsx('btn', `btn--${variant}`, `btn--${size}`, fullWidth && 'btn--full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children && <span>{children}</span>}
    </button>
  );
}
