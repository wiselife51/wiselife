# ARQUITECTURA.md — WiseLife

**Propósito:** arquitectura de software, módulos, patrones, tecnologías y decisiones.
**Responsable:** Arquitecto de Software. **Estado:** Propuesta; requiere validación del esquema y CI vivos.

## Estado actual
React 19, TypeScript, Vite 7, React Router, i18next y `@supabase/supabase-js`. `src/App.tsx` concentra rutas; `AuthProvider` gestiona sesión; páginas y componentes aún consultan Supabase directamente. `vercel.json` sirve la SPA con rewrite.

## Módulos
Shell/navegación, identidad, perfil/onboarding, evaluaciones, descubrimiento, agenda, experiencia clínica, psicólogo y plataforma.

## Flujo de datos
`UI → hook → caso de uso → repository → Supabase → RLS → mapper → estado UI`.
El cliente no es frontera de seguridad; identidad, rol y permisos se resuelven con sesión y políticas.

## Patrones objetivo
Feature slices, componentes presentacionales, facade de Auth, casos de uso, repositories/adapters, validación en bordes, cache centralizada y errores tipados. Extraer primero citas e historia clínica; luego onboarding y especialistas.

## Datos y despliegue
Supabase Auth/Postgres/RLS/Storage; Vercel Preview por PR y Production desde `main`; GitHub es fuente de cambios. Ver `BASE_DATOS.md` y `DEVOPS.md`.

## Riesgos
Acoplamiento UI-persistencia, IDOR clínico, conflicto de citas, datos sensibles en logs y drift SQL/esquema vivo.

## Contradicciones `[POR DEFINIR]`
La documentación histórica menciona ramas de trabajo distintas (`arq_software`, `arq_db`, `dev_ops`) y versiones de referencia diferentes. **Decisor:** Arquitecto de Software + DevOps. Confirmar rama y commit canónicos.

## Referencias
`BASE_DATOS.md`, `API.md`, `SEGURIDAD.md`, `IA.md`, `COMPONENTES.md`, `DEVOPS.md`.
