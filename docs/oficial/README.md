# WiseLife — Documentación oficial

**Estado:** referencia documental del repositorio sincronizado con `main` en `52de404` (7 de agosto de 2026).  
**Alcance:** documentar el sistema existente. Esta entrega no desarrolla funcionalidades ni aplica migraciones.

## Navegación

- [Arquitectura](./arquitectura.md)
- [APIs e integraciones](./apis.md)
- [Componentes y pantallas](./componentes.md)
- [Manual técnico](./manual-tecnico.md)
- [Manual para desarrolladores](./manual-desarrolladores.md)
- [Registro de cambios](./cambios.md)
- [Diagramas](./diagramas.md)

## Resumen

WiseLife es una SPA de React y TypeScript para conectar pacientes con profesionales de salud mental, gestionar onboarding, evaluaciones, especialistas, citas y superficies clínicas. La aplicación usa Vite para desarrollo y build, React Router para navegación, i18next para internacionalización y Supabase como plataforma de autenticación y datos.

## Stack de referencia

- React 19, TypeScript 5.9 y Vite 7.
- `react-router-dom`, `i18next`, `react-icons`, `framer-motion` y `swiper`.
- `@supabase/supabase-js` para autenticación y persistencia.
- Vercel con rewrite SPA definido en `vercel.json`.

## Reglas documentales

1. Diferenciar siempre **implementado**, **propuesto** y **pendiente**.
2. No documentar endpoints, permisos o tablas que no estén comprobados en el repositorio o en el esquema conectado.
3. Cada cambio funcional debe actualizar esta documentación y su registro en [cambios](./cambios.md).
4. Los datos clínicos deben documentarse sin exponer valores reales, secretos ni información personal.
5. Los cambios de esquema deben incluir migración versionada, impacto, RLS, rollback y validación.

## Responsables

- Documentación oficial, operación de repositorio y DevOps: v0.
- Desarrollo de funcionalidades de negocio: equipo WiseLife.
- Revisión de seguridad y privacidad: obligatoria para autenticación, datos personales, citas e historia clínica.

## Fuentes de verdad

La documentación especializada existente permanece en `docs/`, `docs/ia/`, `docs/qa/`, `docs/security/`, `docs/seo/`, `database/` y `supabase/migrations/`. Este índice los organiza; no los reemplaza.
