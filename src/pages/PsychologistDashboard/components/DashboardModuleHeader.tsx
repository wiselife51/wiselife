import type { ReactNode } from 'react'

type DashboardModuleHeaderProps = {
  title: string
  subtitle?: string
  count?: number
  action?: ReactNode
  onMenu: () => void
  menuOpen?: boolean
}

export function DashboardModuleHeader({
  title,
  subtitle,
  count,
  action,
  onMenu,
  menuOpen = false,
}: DashboardModuleHeaderProps) {
  return (
    <header className="psy-module-header">
      <button
        type="button"
        className="psy-mobile-menu-toggle"
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú de Perfil'}
        title="Perfil"
        onClick={onMenu}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {menuOpen ? (
            <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
          ) : (
            <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
          )}
        </svg>
      </button>
      <div className="psy-module-brand" aria-label="Vida Sabia">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#module-logo-grad)" />
          <defs><linearGradient id="module-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4dd0e1" /><stop offset="50%" stopColor="#42a5f5" /><stop offset="100%" stopColor="#7e57c2" /></linearGradient></defs>
        </svg>
        <span>Vida Sabia</span>
      </div>
      {count !== undefined ? <span className="psy-alert-count">{count}</span> : null}
      <div className="psy-module-copy"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      {action}
    </header>
  )
}
