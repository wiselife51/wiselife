import React, { useMemo, useState } from 'react';
import {
  CUSTOM_ROLE_PATTERN,
  KNOWN_ROLES,
  formatDate,
  grantRole,
  revokeRole,
  roleLabel,
} from './adminData';
import type { AdminData } from './adminData';
import { Avatar, ErrorNote, FilterChips, Modal, SearchInput } from './AdminUi';

interface Props {
  data: AdminData;
  reload: () => void;
  currentUserId: string;
}

type RoleFilter = 'todos' | 'admin' | 'psychologist' | 'patient' | 'sin_rol';

const FILTERS: { key: RoleFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'admin', label: 'Administradores' },
  { key: 'psychologist', label: 'Psicólogos' },
  { key: 'patient', label: 'Pacientes' },
  { key: 'sin_rol', label: 'Sin rol' },
];

const TOGGLEABLE_ROLES = ['admin', 'patient'] as const;

const RoleBadge: React.FC<{ code: string }> = ({ code }) => (
  <span className={`adm-role-badge adm-role-badge--${code in KNOWN_ROLES ? code : 'custom'}`}>{roleLabel(code)}</span>
);

const AdminRoles: React.FC<Props> = ({ data, reload, currentUserId }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RoleFilter>('todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const rolesByUser = useMemo(() => {
    const map = new Map<string, string[]>();
    data.roles.forEach((r) => map.set(r.user_id, [...(map.get(r.user_id) ?? []), r.role_code]));
    return map;
  }, [data.roles]);

  const users = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.profiles.filter((p) => {
      const roles = rolesByUser.get(p.id) ?? [];
      const matchesFilter = filter === 'todos' || (filter === 'sin_rol' ? roles.length === 0 : roles.includes(filter));
      const matchesQuery =
        !term || (p.full_name || '').toLowerCase().includes(term) || (p.email || '').toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [data.profiles, rolesByUser, query, filter]);

  const selected = data.profiles.find((p) => p.id === selectedId) ?? null;
  const selectedRoles = selected ? rolesByUser.get(selected.id) ?? [] : [];
  const customRoles = selectedRoles.filter((r) => !(r in KNOWN_ROLES));
  const isLastAdmin = data.adminIds.length <= 1;

  const closeModal = () => {
    setSelectedId(null);
    setCustomRole('');
    setError('');
  };

  const run = async (action: () => Promise<string>) => {
    setBusy(true);
    setError('');
    const message = await action();
    setBusy(false);
    if (message) {
      setError(message);
      return false;
    }
    reload();
    return true;
  };

  const toggleRole = (code: string) => {
    if (!selected) return;
    const has = selectedRoles.includes(code);
    run(() => (has ? revokeRole(selected.id, code) : grantRole(selected.id, code, currentUserId)));
  };

  const addCustomRole = async () => {
    if (!selected) return;
    const code = customRole.trim().toLowerCase();
    if (!CUSTOM_ROLE_PATTERN.test(code)) {
      setError('Usa de 3 a 30 caracteres: letras minúsculas, números o guion bajo, empezando por una letra.');
      return;
    }
    if (selectedRoles.includes(code)) {
      setError('Este usuario ya tiene ese rol.');
      return;
    }
    if (await run(() => grantRole(selected.id, code, currentUserId))) setCustomRole('');
  };

  const adminLockReason = (code: string): string => {
    if (code !== 'admin' || !selected || !selectedRoles.includes('admin')) return '';
    if (selected.id === currentUserId) return 'No puedes quitarte tu propio rol de administrador.';
    if (isLastAdmin) return 'Debe existir al menos un administrador.';
    return '';
  };

  return (
    <>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar usuario por nombre o correo" />
      <FilterChips options={FILTERS} value={filter} onChange={setFilter} label="Filtrar por rol" />

      <div className="psy-patients-scroll">
        {users.length === 0 ? (
          <div className="psy-dash-empty">
            <p>No se encontraron usuarios.</p>
          </div>
        ) : (
          <div className="adm-list">
            {users.map((p) => {
              const roles = rolesByUser.get(p.id) ?? [];
              return (
                <button key={p.id} type="button" className="adm-card adm-card--roles" onClick={() => setSelectedId(p.id)}>
                  <Avatar url={p.avatar_url} name={p.full_name || p.email} />
                  <span className="adm-card-text">
                    <strong>{p.full_name || 'Sin nombre'}</strong>
                    <small>{p.email || '—'}</small>
                  </span>
                  <span className="adm-role-row">
                    {roles.length === 0 ? (
                      <span className="adm-role-badge adm-role-badge--none">Sin rol</span>
                    ) : (
                      roles.map((code) => <RoleBadge key={code} code={code} />)
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <Modal title={selected.full_name || 'Usuario'} subtitle={selected.email || undefined} onClose={closeModal}>
          <dl className="adm-facts">
            <div><dt>Registro</dt><dd>{formatDate(selected.created_at)}</dd></div>
            <div><dt>Roles activos</dt><dd>{selectedRoles.length}</dd></div>
          </dl>

          <h4 className="adm-subtitle">Roles de la plataforma</h4>
          <ul className="adm-role-list">
            {TOGGLEABLE_ROLES.map((code) => {
              const active = selectedRoles.includes(code);
              const lock = adminLockReason(code);
              return (
                <li key={code} className="adm-role-item">
                  <span className="adm-card-text">
                    <strong>{roleLabel(code)}</strong>
                    <small>{lock || (code === 'admin' ? 'Acceso total al panel de administración.' : 'Acceso al área de pacientes.')}</small>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={active}
                    aria-label={`${active ? 'Quitar' : 'Asignar'} rol ${roleLabel(code)}`}
                    className={`adm-switch ${active ? 'adm-switch--on' : ''}`}
                    disabled={busy || Boolean(lock)}
                    onClick={() => toggleRole(code)}
                  />
                </li>
              );
            })}
            <li className="adm-role-item">
              <span className="adm-card-text">
                <strong>{roleLabel('psychologist')}</strong>
                <small>Se asigna al aprobar la verificación en la sección Psicólogos.</small>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={selectedRoles.includes('psychologist')}
                aria-label="Rol Psicólogo, gestionado desde la sección Psicólogos"
                className={`adm-switch ${selectedRoles.includes('psychologist') ? 'adm-switch--on' : ''}`}
                disabled
              />
            </li>
          </ul>

          <h4 className="adm-subtitle">Otros roles</h4>
          {customRoles.length > 0 && (
            <div className="adm-role-row">
              {customRoles.map((code) => (
                <span key={code} className="adm-role-badge adm-role-badge--custom adm-role-badge--removable">
                  {code}
                  <button
                    type="button"
                    aria-label={`Quitar rol ${code}`}
                    disabled={busy}
                    onClick={() => toggleRole(code)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <form
            className="adm-role-form"
            onSubmit={(e) => {
              e.preventDefault();
              addCustomRole();
            }}
          >
            <label className="adm-label" htmlFor="adm-custom-role">Crear y asignar un rol nuevo</label>
            <div className="adm-role-form-row">
              <input
                id="adm-custom-role"
                className="adm-input"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="ej. soporte"
                maxLength={30}
                autoComplete="off"
                autoCapitalize="none"
              />
              <button type="submit" className="psy-dash-btn-primary" disabled={busy || !customRole.trim()}>
                {busy ? 'Guardando...' : 'Asignar'}
              </button>
            </div>
          </form>
          <ErrorNote message={error} />
        </Modal>
      )}
    </>
  );
};

export default AdminRoles;
