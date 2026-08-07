# COMPONENTES.md — WiseLife

**Propósito:** catálogo y reglas de componentes frontend.
**Responsables:** Desarrollador Frontend + Arquitecto UX/UI. **Estado:** Inventario base; requiere sincronización con código.

## Catálogo por dominio
- Shell: `App`, navegación, layouts, guards y errores.
- Auth: formularios de login/registro, callback y estados de sesión.
- Paciente: onboarding, perfil, encuestas, dashboard, diario y citas.
- Descubrimiento: listado, filtros, tarjeta y perfil de especialista.
- Agenda: disponibilidad, bloqueos, selector de fecha/hora y reserva.
- Psicólogo: onboarding profesional, dashboard, agenda, pagos y pacientes.
- Clínico: historia, notas, diagnósticos y consentimientos.
- UI compartida: botones, inputs, cards, dialogs, alerts, loading/empty/error.

## Reglas
Componentes visuales reciben props; páginas coordinan; lógica Supabase va en hooks/casos de uso/repositories; nombres accesibles y estados completos; no duplicar estilos ni autorización en UI.

## Contratos
Cada componente debe documentar props, eventos, estados, permisos, responsive y errores. Acciones clínicas/pagos requieren confirmación y feedback seguro.

## Estructura objetivo
`src/features/<dominio>/{components,domain,hooks,repositories,schemas}` y `src/components/ui` para primitives compartidos.

## Pendientes `[POR DEFINIR]`
Inventario exacto por archivo, cobertura Storybook, tokens visuales y componentes obsoletos — **Responsable:** Frontend + UX/UI.

## Referencias
`UX_GUIDE.md`, `ARQUITECTURA.md`, `PLAN_PRUEBAS.md`.
