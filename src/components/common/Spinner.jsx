// src/components/common/Spinner.jsx
import { Loader2 } from 'lucide-react';
import './Spinner.css';

export default function Spinner({ size = 'md', text = '' }) {
  const sizes = { sm: 20, md: 32, lg: 48 };
  return (
    <div className="spinner-wrap">
      <Loader2 size={sizes[size]} className="animate-spin spinner-icon" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
