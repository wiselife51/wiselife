# DEVOPS.md — WiseLife

**Propósito:** documentar el estado real de GitHub, Vercel, scripts y operación.
**Responsable:** Ingeniería DevOps.
**Estado:** actualizado contra el repositorio auditado; la configuración remota de GitHub/Vercel requiere confirmación en sus proyectos.

## Repositorio y flujo recomendado
El flujo recomendado es `feature/fix/chore → PR → checks → revisión → main → Vercel Production`. No hacer push directo a `main`. La protección de ramas y los checks obligatorios deben verificarse en GitHub; no se infieren de los archivos del repositorio.

## Scripts disponibles
El `package.json` auditado expone `dev`, `build`, `lint` y `preview`. No se identificaron scripts `test` ni `typecheck`; por ello no deben presentarse como pasos CI existentes. El build usa Vite y el preview ejecuta el artefacto generado.

No se encontró workflow bajo `.github/workflows` en el checkout auditado. CI, concurrencia, permisos mínimos y timeout son recomendaciones pendientes, no controles activos.

## Vercel
`vercel.json` declara el rewrite SPA para enviar rutas no estáticas a `index.html`. No define por sí mismo Production Branch, previews por PR, dominios, variables o rollbacks. Esas capacidades dependen de la configuración remota del proyecto Vercel y de su integración con GitHub.

Antes de activar producción se debe confirmar `main` como rama de producción, separar variables Development/Preview/Production y ejecutar smoke tests sobre el deployment.

## Variables y secretos
No versionar secretos. Las variables `VITE_*` quedan expuestas al bundle y sólo deben contener valores públicos. Las claves de servicio de Supabase son server-side y no deben llegar al navegador. Revisar variables por entorno y rotarlas ante exposición.

## Rollback e incidentes
Identificar el deployment estable, promover rollback, ejecutar smoke test, registrar el incidente y abrir un fix. Para incidentes de credenciales, revocar/rotar primero y revisar logs y alcance.

## Docker
Docker no es necesario para esta SPA estática en Vercel. Sólo debe incorporarse ante un requisito operativo explícito.

## Reproducibilidad y pendientes
El `package.json` no declara un campo `packageManager` y el checkout auditado no debe asumir un lockfile o gestor canónico sin confirmación. Por tanto, la versión de Node, package manager, lockfile, workflow oficial, protección de ramas, CODEOWNERS, Dependabot, secret scanning, dominios, observabilidad y matriz de variables permanecen pendientes de formalización.

**Responsable:** DevOps.

## Referencias
`ARQUITECTURA.md`, `API.md` y `BASE_DATOS.md`.
