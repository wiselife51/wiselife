# DEVOPS.md — WiseLife

**Propósito:** Git, CI/CD, Vercel, entornos, despliegues e infraestructura.
**Responsable:** Ingeniero DevOps. **Estado:** Requiere confirmación de configuración viva.

## Flujo
`feature/fix/chore → PR → checks → revisión → main → Vercel Production`; PR genera Preview. No push directo a `main`.

## CI mínimo
Instalación reproducible, lint, typecheck/build, timeout, concurrencia y permisos mínimos. Confirmar workflow, versión Node y lockfile existentes antes de activarlo.

## Vercel
`main` debe ser Production Branch; Preview usa variables Preview; producción sólo tras merge. `vercel.json` mantiene rewrite de la SPA. Ejecutar smoke test y conservar commit/deployment.

## Variables
Separar Development/Preview/Production; no versionar secretos. `VITE_*` sólo para valores que puedan ser públicos; `SUPABASE_SERVICE_ROLE_KEY` únicamente server-side.

## Rollback e incidentes
Identificar deployment estable, promover rollback, hacer smoke test, registrar incidente y abrir fix. Rotar credenciales ante exposición.

## Docker
No es necesario para la SPA estática en Vercel; sólo introducirlo por requerimiento operativo validado.

## Pendientes `[POR DEFINIR]`
Workflow oficial, protección de ramas, CODEOWNERS, Dependabot, secret scanning, dominios, observabilidad y matriz de variables — **Responsable:** DevOps.

## Referencias
`ARQUITECTURA.md`, `SEGURIDAD.md`, `PLAN_PRUEBAS.md`, `CHANGELOG.md`.
