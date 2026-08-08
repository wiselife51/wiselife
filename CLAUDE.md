# WiseLife — Guía para el equipo de agentes

## Cómo funciona este equipo

Claude Code es el único punto de entrada al proyecto. Nicolás (Tech Lead / dueño) le habla directo a Claude, y Claude delega internamente al subagente correcto según la tarea — no hace falta invocarlos a mano ni saltar entre herramientas externas.

## Agentes disponibles (`.claude/agents/`)

| Agente | Responsabilidad | Herramientas |
|---|---|---|
| **architect** | Arquitectura backend, Supabase, RLS, seguridad, optimización, y features full-stack de punta a punta | Todas |
| **frontend** | UI/UX, componentes, páginas y estilos (`src/components`, `src/pages`, `src/styles`, `public/`) | Todas |
| **docs-devops** | Documentación, deploy, CI/CD, `vercel.json`, README/CHANGELOG | Todas |
| **product-owner** | Priorización, backlog, desglose de features en tareas, `docs/PRODUCT_BACKLOG.md`, `docs/ROADMAP.md` | Read, Grep, Glob |
| **code-reviewer** | Revisión de calidad antes de mergear a `main` o abrir PR | Read, Grep, Glob, Bash |
| **security** | Auditoría: credenciales expuestas, RLS de Supabase, manejo de `.env` | Read, Grep, Glob |

## Reglas de convivencia

1. **`main` es la única rama de producción** en Vercel. Nunca asumir que otra rama (incluida `antigravity`) es producción.
2. **Antes de mergear a `main`**, pasar por `code-reviewer`.
3. **Cambios que toquen credenciales, `.env` o configuración de Supabase** pasan primero por `security`.
4. **El build debe pasar antes de pushear** — `pnpm run build` corre TypeScript en modo estricto (sin variables sin usar, sin imports muertos).
5. **`docs-devops` es quien actualiza la documentación** después de que cualquier otro agente termine un cambio — no dejar `docs/` desactualizado.
6. Para features grandes, **`product-owner` desglosa primero** en tareas concretas y sugiere qué agente le corresponde a cada una.

## Stack

React 19 + TypeScript 5.9 (SPA con Vite 7), React Router 7, Supabase (Auth + PostgreSQL + RLS, sin backend propio), CSS plano por componente, deploy en Vercel.

## Deuda técnica conocida

- Acoplamiento UI↔Supabase: 16+ archivos importan el cliente directo. Arquitectura objetivo (`docs/ARQUITECTURA.md`): UI → hook → caso de uso → repository — implementada parcialmente. Responsable: `architect`.
- i18n instalado (i18next) pero sin uso real en `src/` — decidir si se implementa o se retira. Responsable: `product-owner` para la decisión, `frontend` para la implementación.
- Credenciales de Supabase con fallback hardcodeado en `src/lib/supabase.ts`. Responsable: `security` + `architect`.
- Tres fuentes de SQL sin jerarquía clara: `database/`, `scripts/`, `supabase/migrations/` (esta última es la única formal). Responsable: `architect`.
- `GEMINI.md`, `.idx/`, `blueprint.md` son residuo de Project IDX/Firebase Studio — no aplican al stack actual, candidatos a eliminar. Responsable: `docs-devops`.

## Convenciones de código

- Colocation: cada componente/página en su propia carpeta (`Componente/Componente.tsx` + `.css`)
- PascalCase para componentes, default export siempre, `React.FC<Props>` con interface local
- CSS plano, patrón BEM-ish (`btn`, `btn--primary`), sin framework ni preprocesador
- Rutas en español (`/especialistas`, `/mis-citas`), código y columnas de BD en inglés (snake_case DB, camelCase formularios)
- Comentarios en español
- Guard de auth por página: `if (!user) navigate('/login')` en `useEffect`