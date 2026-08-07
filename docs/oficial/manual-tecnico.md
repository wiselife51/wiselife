# Manual técnico

## Requisitos

- Node.js compatible con Vite 7 y TypeScript 5.9.
- Dependencias instaladas con el lockfile elegido por el equipo.
- Variables Supabase configuradas en el entorno local o Vercel.

## Comandos oficiales

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Los scripts están definidos en `package.json`. `build` ejecuta TypeScript y después `vite build`; `preview` sirve el artefacto localmente.

## Configuración

No commitear `.env*`. Para el navegador usar solo configuración pública `VITE_*`; las claves privilegiadas deben quedar fuera del bundle. Confirmar URL, clave pública, proyecto y ambiente antes de ejecutar operaciones con Supabase.

## Datos y migraciones

Las migraciones versionadas viven en `supabase/migrations/`. Los scripts en `database/` son referencias históricas o de apoyo y no deben ejecutarse automáticamente sin revisión. Antes de una migración: revisar dependencias, RLS, índices, datos sensibles, rollback y estado vivo. Después: verificar tablas, políticas y consultas representativas.

## Despliegue

Vercel usa `vercel.json` para reescribir rutas a `index.html`. El despliegue de producción debe provenir de `main` después de revisión. Los previews deben probar navegación profunda, autenticación, permisos y responsive.

## Diagnóstico

1. Revisar `git status`, rama y commit.
2. Ejecutar `npm run lint` y `npm run build`.
3. Revisar consola del navegador sin copiar tokens ni PII.
4. Confirmar variables del ambiente correcto.
5. Revisar sesión, políticas RLS y esquema vivo de Supabase.
6. Reproducir con un usuario de prueba mínimo.

## Seguridad operativa

No usar `service_role` en cliente; no registrar historias, notas, diagnósticos ni tokens; rotar secretos comprometidos; revisar RLS antes de publicar cambios; y conservar trazabilidad de PR, migración y despliegue.

## Rollback

Para una regresión de frontend, revertir el commit o promover el último despliegue sano. Para esquema, aplicar únicamente un rollback revisado y compatible con datos ya escritos; no borrar tablas clínicas como respuesta improvisada. Documentar impacto, decisión y verificación.
