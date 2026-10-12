import React from 'react';
import { createPortal } from 'react-dom';

export const Avatar: React.FC<{ url?: string | null; name?: string | null }> = ({ url, name }) => (
  <span className="psy-dash-upcoming-avatar-sm">
    {url ? <img src={url} alt="" crossOrigin="anonymous" /> : <span>{(name || '?').charAt(0).toUpperCase()}</span>}
  </span>
);

export const Modal: React.FC<{
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, onClose, children }) =>
  createPortal(
    <div className="psy-dash-modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="psy-dash-modal adm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-head">
          <div className="adm-modal-copy">
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );

export const ConfirmDialog: React.FC<{
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, confirmLabel, busy, onConfirm, onCancel }) => (
  <Modal title={title} onClose={onCancel}>
    <p className="adm-muted">{message}</p>
    <div className="adm-actions">
      <button type="button" className="psy-dash-btn-outline" onClick={onCancel} disabled={busy}>
        Volver
      </button>
      <button type="button" className="adm-btn adm-btn--danger" onClick={onConfirm} disabled={busy}>
        {busy ? 'Guardando...' : confirmLabel}
      </button>
    </div>
  </Modal>
);

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="adm-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
  label: string;
}) {
  return (
    <div className="adm-chips" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          className={`adm-chip ${value === o.key ? 'adm-chip--active' : ''}`}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const ErrorNote: React.FC<{ message: string }> = ({ message }) =>
  message ? (
    <p className="adm-error" role="alert">
      {message}
    </p>
  ) : null;
