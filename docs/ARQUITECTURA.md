# ARQUITECTURA.md — WiseLife

**Propósito:** describir la arquitectura implementada y separar explícitamente las decisiones objetivo.
**Responsable:** Arquitectura de Software.
**Estado:** actualizado contra el commit `cb00865` y el repositorio local.

## Estado implementado
WiseLife es una SPA basada en React 19, TypeScript y Vite 7, con React Router, i18next y `@supabase/supabase-js`. `src/App.tsx` concentra el enrutamiento y `AuthProvider` mantiene la sesión. Las páginas y componentes consultan Supabase directamente en varios módulos; todavía no existe una capa uniforme de casos de uso, repositories o mappers.

`vercel.json` contiene el rewrite necesario para servir la SPA. No se encontraron rutas HTTP propias de Next.js ni backend server-side en el repositorio auditado.

## Módulos funcionales
- Shell y navegación.
- Identidad, login, callback y sesión.
- Perfil y onboarding de paciente.
- Evaluaciones y diarios emocionales.
- Descubrimiento de especialistas y perfiles.
- Agenda, disponibilidad y citas.
- Historia clínica y notas de sesión.
- Flujo de psicólogo y plataforma.

Estos módulos reflejan la organización funcional actual; no implican que todos tengan el mismo nivel de aislamiento arquitectónico.

## Flujo de datos actual
`UI/página → cliente Supabase → Auth/Data API/Postgres → RLS → estado local de la página`.

El frontend puede enviar identificadores al cliente, pero la autorización efectiva debe derivarse de la sesión y de RLS. El cliente no es una frontera de seguridad y no debe contener claves privilegiadas.

## Patrones objetivo
Se recomienda evolucionar gradualmente hacia feature slices, componentes presentacionales, una fachada de autenticación, casos de uso, repositories/adapters, validación en bordes, errores tipados y cache centralizada. El primer candidato de extracción es agenda/historia clínica; después onboarding y especialistas.

Estos patrones son **objetivo**, no capacidades ya implementadas. Toda extracción debe preservar el comportamiento actual y verificarse contra RLS.

## Integraciones
- **Supabase:** Auth, Postgres, RLS y potencialmente Storage. El uso de Storage no quedó confirmado en el frontend auditado.
- **Vercel:** hosting de la SPA y rewrites declarados en `vercel.json`. La configuración de ramas, previews y variables vive en el proyecto Vercel y no se demuestra sólo con el repositorio.
- **GitHub:** repositorio y revisión por ramas/PR. La protección de `main`, CODEOWNERS y checks obligatorios deben confirmarse en GitHub.

## Riesgos
Acoplamiento UI-persistencia, IDOR clínico, conflictos de agenda, datos sensibles en logs, exposición accidental de claves y drift entre SQL versionado y esquema vivo.

## Documentación relacionada
`API.md`, `BASE_DATOS.md` y `DEVOPS.md` son documentos existentes. `SEGURIDAD.md`, `IA.md`, `COMPONENTES.md` y `PLAN_PRUEBAS.md` están disponibles como documentación complementaria en el repositorio actual.
